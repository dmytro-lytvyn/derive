import React, { FunctionComponent, useEffect, useState } from "react";
// Config
import * as SecureStore from 'expo-secure-store';
// File System
import { StorageAccessFramework } from 'expo-file-system';

async function requestSyncDirectoryPermissions(uri: String): string {
  try {
    // If we have no permissions, request them
    console.log(`Calling requestDirectoryPermissionsAsync(${uri})`);

    const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync(uri);
    if (permissions.granted) {
      console.log('permissions.granted');
      uri = permissions.directoryUri;
      // Save chosen URI path
      console.log(`Current syncDirectory = ${uri}`);
      SecureStore.setItemAsync('syncDirectory', uri);
    } else {
      console.log('Permission not granted!');
      uri = undefined;
    };
  }
  catch(error) {
    console.log('Caught an error in requestSyncDirectoryPermissions...');
    console.log(error);
    throw error;
  }

  return uri;
}

async function getSyncPathOrRequestPermissions(): String {
  // Get saved path
  console.log('Starting getSyncPathOrRequestPermissions');

  console.log('Reading syncDirectory');
  var uri = await SecureStore.getItemAsync('syncDirectory');
  if (!uri) {
    uri = StorageAccessFramework.getUriForDirectoryInRoot("Derive");
    console.log(`syncDirectory not found, using ${uri}`);

    try {
      // Check if we have permissions to the path
      console.log(`Check if we have permissions to ${uri}`);
      await StorageAccessFramework.readDirectoryAsync(uri);
    }
    catch(error) {
      console.log(error);
      console.log(`Did't have permissions to ${uri}, will requst them`);
      return requestSyncDirectoryPermissions(uri);
    }
  } else {
    console.log(`Already have stored syncDirectory = ${uri}`);
  }
  permissionRequestOngoing = false;
  return uri;
}

export default getSyncPathOrRequestPermissions;
