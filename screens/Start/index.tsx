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
//import * as FileSystem from 'expo-file-system';
//import { StorageAccessFramework } from 'expo-file-system';

const StartScreen: FunctionComponent<IScreen> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  function onLetsStartPressHandler(): void {
    navigation.push("AddCard");
  }

  useEffect(() => {
    Database.transaction((transaction: SQLTransaction) => {
      initializeTables(transaction);
      transaction.executeSql("SELECT * FROM cards", [], (transaction: SQLTransaction, result: SQLResultSet) => {
        if (result.rows.length) {
          /*
          console.log('Before setExternalDirectory');
          // Requests permissions for external directory
          //const { StorageAccessFramework } = FileSystem;

          //const files1 = await StorageAccessFramework.readDirectoryAsync(uri);
          //alert(`Files inside ${uri}:\n\n${JSON.stringify(files1)}`);
          
          const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (permissions.granted) {
            // Gets SAF URI from response
            const uri = permissions.directoryUri;

            // Gets all files inside of selected directory
            const files = await StorageAccessFramework.readDirectoryAsync(uri);
            console.log(uri);
            alert(`Files inside ${uri}:\n\n${JSON.stringify(files)}`);
          }
          const externalDirectory = FileSystem.documentDirectory;
          console.log(externalDirectory);
          console.log('After dir');
          */
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
