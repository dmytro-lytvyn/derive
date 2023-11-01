// Config
import * as SecureStore from 'expo-secure-store';
// File System
import { StorageAccessFramework } from 'expo-file-system';

async function requestSyncDirectoryPermissions(uri: String): void {
  // If we have no permissions, request them
  const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync(uri);
  if (permissions.granted) {
    const uri = permissions.directoryUri;
    // Save chosen URI path
    await SecureStore.setItemAsync('syncDirectory', uri);
    console.log(`Current syncDirectory = ${uri}`);
  } else {
    console.log('Permission not granted!');
    await requestSyncDirectoryPermissions(uri);
  };
}

async function getSyncPathOrRequestPermissions(): String {
  // Get saved path
  var uri = await SecureStore.getItemAsync('syncDirectory');
  if (!uri) {
    // Check if we have permissions to the path
    var files = await StorageAccessFramework.readDirectoryAsync(uri)
        .catch((error) => {
          console.log(error);
          requestSyncDirectoryPermissions(uri);
        });
  } else {
    console.log(`Current syncDirectory = ${uri}`);
  }
  return uri;
}

export default getSyncPathOrRequestPermissions;
