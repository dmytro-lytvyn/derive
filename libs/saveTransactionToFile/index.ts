import replaceSqlTemplate  from "libs/replaceSqlTemplate"
// Config
import * as SecureStore from 'expo-secure-store';
// File System
import * as FileSystem from 'expo-file-system';
import { StorageAccessFramework } from 'expo-file-system';

async function saveTransactionToFile(updatedAt: String, entityType: String, entityId: String, sqlTemplate: String, valuesArray: Array): void {
  // Get syncDirectory and originId from locl config
  var uri = await SecureStore.getItemAsync('syncDirectory');
  var originId = await SecureStore.getItemAsync('originId');

  // Format SQL command
  var sqlTemplateReplaced = await replaceSqlTemplate(sqlTemplate, valuesArray);

  // Generate target file name
  var fileName = `${updatedAt}+${entityType}+${entityId}+${originId}.sql`;
  console.log(`Writing to ${fileName}`);

  // Create target sync file
  var fileUri = await StorageAccessFramework.createFileAsync(uri, fileName, 'application/x-sql');
  await FileSystem.writeAsStringAsync(fileUri, sqlTemplateReplaced, {encoding: FileSystem.EncodingType.UTF8});
}

export default saveTransactionToFile;
