import React, { FunctionComponent, useState } from "react";
import { StyleSheet, View } from "react-native";
import db from "sql";
import { SQLResultSet, SQLTransaction } from "expo-sqlite";
import TheLayout from "layouts";
import returnConfigurationData from "libs/config";
import IncomeType from "components/Custom/IncomeType";
import TopPanel from "components/UI/TopPanel";
import Label from "components/UI/Label";
import Input from "components/UI/Input";
import Button from "components/UI/Button";
// Custom functions
import saveTransactionToFile from "libs/saveTransactionToFile"
// UUID
//import * as Crypto from 'expo-crypto';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const IncomeScreen: FunctionComponent<IScreen> = ({ navigation, route }) => {
  const [sum, setSum] = useState<number>(0);
  const [incomeTypeID, setIncomeTypeID] = useState<number>(returnConfigurationData().IncomeTypes[0].id);

  function onCreateTransactionPressHandler(): void {
    db.transaction(async connection => {
      var id = uuidv4();
      var updatedAt = new Date().getTime();
      var sqlTemplate = 'INSERT INTO transactions (id, createdAt, updatedAt, cardId, amount, type, actionType) VALUES (?, ?, ?, ?, ?, ?, ?);';
      var valuesArray = [id, updatedAt, updatedAt, route.params.cardId, Number(sum), incomeTypeID, "income"];

      // Insert a new transaction
      await connection.execute(
        sqlTemplate,
        valuesArray
      );

      // Save SQL into file
      saveTransactionToFile(updatedAt, 'transactions', id, sqlTemplate, valuesArray);
      console.log('Insert a new transaction done!');

      sqlTemplate = 'UPDATE cards SET balance = balance + ?, updatedAt = ? WHERE id = ?;';
      valuesArray = [Number(sum), updatedAt, route.params.cardId];

      // Update card balance
      await connection.execute(
        sqlTemplate,
        valuesArray
      );

      // Save SQL into file
      saveTransactionToFile(updatedAt, 'cards', route.params.cardId, sqlTemplate, valuesArray);
      console.log('Update card balance done!');

      navigation.push("Card", {
        id: route.params.cardId,
      });
    });
  }

  function validateData(): boolean {
    if (sum) {
      return true;
    }
    return false;
  }

  return (
    <TheLayout>
      <TopPanel withBack navigation={navigation} backPathname="Card" backParams={{ id: route.params.cardId }} />
      <View style={styles.body}>
        <Label>Income</Label>
        <View style={styles.headerInput}>
          <Input state={sum} setState={setSum} placeholder="Enter income sum..." keyboardType="decimal-pad" />
        </View>
        <View style={styles.headerType}>
          <Label>Income Type</Label>
          <View style={styles.bodyTypes}>
            {returnConfigurationData().IncomeTypes.map(_incomeType => {
              return (
                <IncomeType
                  key={_incomeType.id}
                  data={_incomeType}
                  isActive={_incomeType.id === incomeTypeID}
                  onPressHandler={() => {
                    setIncomeTypeID(_incomeType.id);
                  }}
                />
              );
            })}
          </View>
        </View>
        <View style={styles.actionButton}>
          <Button onPressHandler={onCreateTransactionPressHandler} isValidate={validateData()}>
            Income
          </Button>
        </View>
      </View>
    </TheLayout>
  );
};

const styles = StyleSheet.create({
  body: {
    marginTop: 39,
    paddingBottom: 39,
  },
  headerInput: {
    marginTop: 15,
  },
  headerType: {
    marginTop: 25,
  },
  bodyTypes: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionButton: {
    marginTop: 92,
  },
});

export default IncomeScreen;
