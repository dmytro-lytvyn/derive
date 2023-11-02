import Database from "sql";
// Custom functions
import getSyncPathOrRequestPermissions from "libs/getSyncPathOrRequestPermissions"
// Config
import * as SecureStore from 'expo-secure-store';
// File System
import * as FileSystem from 'expo-file-system';
import { StorageAccessFramework } from 'expo-file-system';

async function processFile(file: String): boolean {
  console.log(`Processing sync file: ${file}`);
  const fileSql = await FileSystem.readAsStringAsync(file, {encoding: FileSystem.EncodingType.UTF8});
  console.log(fileSql);
  Database.transaction((transaction: SQLTransaction) => {
    transaction.executeSql(fileSql,[]);
  });
  return true;
}

async function processSyncFiles(): int {
  // Get saved path
  var filesProcessed = 0;
  var uri = await getSyncPathOrRequestPermissions();
  var files = await StorageAccessFramework.readDirectoryAsync(uri);
  files.sort();

  var originId = await SecureStore.getItemAsync('originId');
  var originOffsets: { [key: string]: string; } = {};
  var originOffsetsString = await SecureStore.getItemAsync('originOffsets');
  console.log(`originOffsets: ${originOffsetsString}`);
  if (originOffsetsString) originOffsets = JSON.parse(originOffsetsString);

  for (file of files) {
    if (file.endsWith('.sql') && !file.endsWith(`${originId}.sql`)) {
      var fileName = file.substr(file.lastIndexOf('%2F') + 3).replace('.sql', '');
      var fileParts = fileName.split('%2B');
      //console.log(`fileParts: ${JSON.stringify(fileParts)}`);
      var fileUpdatedAt = fileParts[0];
      var fileEntityType = fileParts[1];
      var fileEntityId = fileParts[2];
      var fileOriginId = fileParts[3];
      var fileOffset = `${fileOriginId}+${fileEntityType}`;
      if (!(fileOffset in originOffsets) || (originOffsets[fileOffset] < fileUpdatedAt)) {
        console.log(`fileOffset "${fileOffset}" is not known or latest fileUpdatedAt is older than ${fileUpdatedAt} - will process this sync file!`);
        if (await processFile(file)) {
          originOffsets[fileOffset] = fileUpdatedAt;
          filesProcessed++;
          console.log(`Saving last fileUpdatedAt for fileOffset "${fileOffset}" as ${fileUpdatedAt}...`);
          await SecureStore.setItemAsync('originOffsets', JSON.stringify(originOffsets));
        } else {
          break;
        }
      } else {
        //console.log(`fileOffset "${fileOffset}" is already known and latest fileUpdatedAt is same or newer than ${fileUpdatedAt} - skipping this sync file!`);
      }
    }
  }
  return filesProcessed;
}

export default processSyncFiles;
