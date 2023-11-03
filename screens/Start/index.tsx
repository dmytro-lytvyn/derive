import React, { FunctionComponent, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import db from "sql";
import initializeTables from "sql/initializeTables";
import { SQLResultSet, SQLTransaction } from "expo-sqlite";
import TheLayout from "layouts";
import AppConstants from "styles/constants";
import Button from "components/UI/Button";
import Logo from "components/UI/Logo";
import TopPanel from "components/UI/TopPanel";
// Custom functions
import getOrGenerateOriginId from "libs/getOrGenerateOriginId"
import getSyncPathOrRequestPermissions from "libs/getSyncPathOrRequestPermissions"
import processSyncFiles from "libs/processSyncFiles"

const StartScreen: FunctionComponent<IScreen> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  async function onLetsStartPressHandler(): void {
    console.log('onLetsStartPressHandler started');
    // Checking for return values is needed to execute things sequentially
    if (await getSyncPathOrRequestPermissions()) {
      console.log(`Finished checking permissions`);
      setIsLoading(true);
      console.log('setIsLoading=true');

      if (await processSyncFiles(isFullLoad = true)) {
        const result = await db.execute("SELECT * FROM cards");
        if (result.rows.length) {
          console.log('Home');
          navigation.push("Home");
        } else {
          console.log('AddCard');
          navigation.push("AddCard");
        }
      }
    }
  }

  useEffect(() => {
    async function initStartScreen() {
      console.log('useEffect');

      await getOrGenerateOriginId(); // Make sure we have originId generated

      console.log('initializeTables');
      await initializeTables();

      const result = await db.execute("SELECT * FROM cards");
      console.log(result.rows);

      if (result.rows.length) {
        console.log('processSyncFiles');
        processSyncFiles(isFullLoad = false).then(() => {
          navigation.push("Home")
        });
      } else {
        setIsLoading(false);
        console.log('setIsLoading=false');
      }
    }

    initStartScreen();

  }, []); // Second parameter to useEffect to run only once (array of variables need to change before re-rendering)

  return (
    <TheLayout>
      <View style={styles.body}>
        <TopPanel />
        <View>
          <Logo variant="big" />
          {isLoading && (
            <View style={styles.body}>
              <Text style={styles.bodyText}>
                Please wait, syncing data...
              </Text>
            </View>
          ) || (
            <View style={styles.body}>
              <Text style={styles.bodyText}>
                Dérive is a mobile app for keeping track of your expenses and income, managing your financial goals, and
                keeping track of your card balances.
              </Text>
              <Text style={styles.bodyText}>
                On the next step, you will be asked to grant permission to a folder for DB sync files.
              </Text>
              <View style={styles.bodyButton}>
                <Button onPressHandler={onLetsStartPressHandler}>Let’s start</Button>
              </View>
            </View>
          )}
        </View>
        <View style={styles.footer} />
      </View>
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