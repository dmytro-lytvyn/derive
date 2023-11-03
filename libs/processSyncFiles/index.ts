import db from "sql";
// Custom functions
import getSyncPathOrRequestPermissions from "libs/getSyncPathOrRequestPermissions"
// Config
import * as SecureStore from 'expo-secure-store';
// File System
import * as FileSystem from 'expo-file-system';
import { StorageAccessFramework } from 'expo-file-system';

async function entityIsMissingOrOlder(entityType: String, entityId: String, updatedAt: Number): boolean {
  console.log('1.Starting entityIsMissingOrOlder...');
  var entityIsMissingOrOlder: boolean;

  console.log(`2.SELECT updatedAt FROM ${entityType}`);
  var result = await db.execute(
    `SELECT updatedAt FROM ${entityType} WHERE id = ?`,
    [entityId]
  );
  console.log(`3.Selected ${result.rows.length} record(s)!`);

  if ((result.rows.length > 0) && (result.rows[0].updatedAt > updatedAt)) {
    console.log(`4.Entity ${entityType} with id='${entityId}' already exists and is newer (${result.rows[0].updatedAt}) than the file updatedAt (${updatedAt}), will skip this update!`);
    entityIsMissingOrOlder = false;
  } else {
    console.log(`4.Entity ${entityType} with id='${entityId}' doesn't exist or is older than the file updatedAt (${updatedAt}), will process this update!`);
    entityIsMissingOrOlder = true;
  }

  console.log(`5.Returning ${entityIsMissingOrOlder}`);
  return entityIsMissingOrOlder;
}

async function processFile(file: String): boolean {
  console.log(`Processing sync file: ${file}`);
  const fileSql = await FileSystem.readAsStringAsync(file, {encoding: FileSystem.EncodingType.UTF8});
  console.log('SQL file contents:');
  console.log(fileSql);
  if (fileSql.length > 0) await db.execute(fileSql);
  return true;
}

async function processSyncFiles(isFullLoad: boolean = false): int {
  // Get saved path
  var filesProcessed = 0;
  var uri = await getSyncPathOrRequestPermissions();
  var files = await StorageAccessFramework.readDirectoryAsync(uri);
  files.sort();

  var originId = await SecureStore.getItemAsync('originId');
  // This object holds the last known offsets, we'll compare all files to it
  var originOffsets: { [key: string]: string; } = {};
  // This object will hold updated offsets, it's separate to ensure we don't skip any new files with the same timestamp/entity
  var originOffsetsNew: { [key: string]: string; } = {};
  var originOffsetsString = await SecureStore.getItemAsync('originOffsets');
  console.log(`originOffsets: ${originOffsetsString}`);
  // Both old and new offsets are parsed from string because it's the easiest way to have an unlinked clone of an object
  if (originOffsetsString) originOffsets = JSON.parse(originOffsetsString);
  if (originOffsetsString) originOffsetsNew = JSON.parse(originOffsetsString);

  for (file of files) {
    if (file.endsWith('.sql') && !file.endsWith(`${originId}.sql`)) {
      var fileName = file.substr(file.lastIndexOf('%2F') + 3).replace('.sql', '');
      var fileParts = fileName.split('%2B');
      //console.log(`fileParts: ${JSON.stringify(fileParts)}`);
      var fileUpdatedAt = Number(fileParts[0]);
      var fileEntityType = fileParts[1];
      var fileEntityId = fileParts[2];
      var fileOriginId = fileParts[3];
      var fileOffset = `${fileOriginId}+${fileEntityType}`;
      if (!(fileOffset in originOffsets) || (originOffsets[fileOffset] < fileUpdatedAt)) {
        console.log(`0.fileOffset "${fileOffset}" is not known or latest fileUpdatedAt is older than last seen offset ${fileUpdatedAt} - will process this sync file!`);

        if ((isFullLoad) || (await entityIsMissingOrOlder(fileEntityType, fileEntityId, fileUpdatedAt))) {
          if (await processFile(file)) {
            originOffsetsNew[fileOffset] = fileUpdatedAt;
            filesProcessed++;
            console.log(`Saving last fileUpdatedAt for fileOffset "${fileOffset}" as ${fileUpdatedAt}...`);
            await SecureStore.setItemAsync('originOffsets', JSON.stringify(originOffsetsNew));
          } else {
            break;
          }
          // Save the offset for any new file
          //console.log(`Saving last fileUpdatedAt for fileOffset "${fileOffset}" as ${fileUpdatedAt}...`);
          //await SecureStore.setItemAsync('originOffsets', JSON.stringify(originOffsetsNew));
        }
      } else {
        //console.log(`fileOffset "${fileOffset}" is already known and latest fileUpdatedAt is same or newer than last seen offset ${fileUpdatedAt} - skipping this sync file!`);
      }
    }
  }
  return filesProcessed;
}

export default processSyncFiles;
