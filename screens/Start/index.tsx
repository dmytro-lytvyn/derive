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
// Custom functions
import getOrGenerateOriginId from "libs/getOrGenerateOriginId"
import getSyncPathOrRequestPermissions from "libs/getSyncPathOrRequestPermissions"
import processSyncFiles from "libs/processSyncFiles"

const StartScreen: FunctionComponent<IScreen> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  async function onLetsStartPressHandler(): void {
    await getSyncPathOrRequestPermissions().then(() => navigation.push("AddCard"));
  }

  useEffect(() => {
    getOrGenerateOriginId(); // Make sure we have originId generated

    Database.transaction((transaction: SQLTransaction) => {
      initializeTables(transaction);
    });

    async function doSync() {
      await processSyncFiles();
    }
    doSync().then(() => {
      Database.transaction((transaction: SQLTransaction) => {
        transaction.executeSql(
          "SELECT * FROM cards",
          [],
          (transaction: SQLTransaction, result: SQLResultSet) => {
            if (result.rows.length) {
              navigation.push("Home");
            } else {
              setIsLoading(false);
            }
          }
        );
      });
    }, []);
  });

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