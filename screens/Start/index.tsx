import React, { FunctionComponent, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Database from "sql";
import initializeTables from "sql/initializeTables";
import { SQLResultSet, SQLTransaction } from "expo-sqlite";
import TheLayout from "layouts";
import AppConstants from "styles/constants";
import Button from "components/UI/Button";
import Logo from "components/UI/Logo";
import TopPanel from "components/UI/TopPanel";
// File System
import * as FileSystem from 'expo-file-system';
import { StorageAccessFramework } from 'expo-file-system';

const StartScreen: FunctionComponent<IScreen> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  async function requestSyncDirectoryPermissions(uri: String): void {
    // If we have no permissions, request them
    console.log('Before requestDirectoryPermissionsAsync');
    const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync(uri);
    console.log('After requestDirectoryPermissionsAsync');
    if (permissions.granted) {
      const uri = permissions.directoryUri;
      console.log(uri);
      // Save chosen URI path
    } else {
      console.log('Permission not granted!');
      requestSyncDirectoryPermissions(uri);
    };
  }

  async function checkSyncDirectoryPermissions(): void {
    // Requests permissions for external directory
    //const { StorageAccessFramework } = FileSystem;

    // Get saved path
    var uri = 'content://com.android.externalstorage.documents/tree/primary%3ASync%2FDerive';
    // Check if we have permissions to the path
    var files = await StorageAccessFramework.readDirectoryAsync(uri)
        .catch((error) => {
          console.log(error);
          requestSyncDirectoryPermissions(uri);
        });
  }

  async function listSyncDirectoryFiles(): void {
    console.log('Before setExternalDirectory');
    //const { StorageAccessFramework } = FileSystem;
    
    // Get saved path
    var uri = 'content://com.android.externalstorage.documents/tree/primary%3ASync%2FDerive';
    var files = await StorageAccessFramework.readDirectoryAsync(uri);
    console.log(`Files inside ${uri}:\n${JSON.stringify(files)}`);
    const data_string = await FileSystem.readAsStringAsync(files[0], {encoding: FileSystem.EncodingType.UTF8});
    console.log(`Loaded ${data_string.length} bytes`);
    console.log(data_string);
  }

  function onLetsStartPressHandler(): void {
    checkSyncDirectoryPermissions();
    navigation.push("AddCard");
  }

  useEffect(() => {
    Database.transaction((transaction: SQLTransaction) => {
      initializeTables(transaction);
      transaction.executeSql("SELECT * FROM cards", [], (transaction: SQLTransaction, result: SQLResultSet) => {
        if (result.rows.length) {
          listSyncDirectoryFiles();
          navigation.push("Home");
        } else {
          setIsLoading(false);
        }
      });
    });
  }, []);

  return (
    <TheLayout>
      {!isLoading && (
        <View style={styles.body}>
          <TopPanel />
          <View>
            <Logo variant="big" />
            <Text style={styles.bodyText}>
              Dérive is a mobile app for keeping track of your expenses and income, managing your financial goals, and
              keeping track of your card balances.
            </Text>
            <View style={styles.bodyButton}>
              <Button onPressHandler={onLetsStartPressHandler}>Let’s start</Button>
            </View>
          </View>
          <View style={styles.footer} />
        </View>
      )}
    </TheLayout>
  );
};

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 25,
  },
  bodyText: {
    fontFamily: AppConstants.FontRegular,
    color: "#F9F9F9",
    marginTop: 10,
  },
  bodyButton: {
    marginTop: 45,
  },
  footer: {
    height: 40,
  },
});

export default StartScreen;