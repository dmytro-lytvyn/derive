import React, { FunctionComponent, useState } from "react";
import { StyleSheet, View } from "react-native";
import TheLayout from "layouts";
import db from "sql";
import { SQLResultSet, SQLTransaction } from "expo-sqlite";
import returnConfigurationData from "libs/config";
import ExpenseType from "components/Custom/ExpenseType";
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

const ExpenseScreen: FunctionComponent<IScreen> = ({ navigation, route }) => {
  const [sum, setSum] = useState<number>(0);
  const [expenseTypeID, setExpenseTypeID] = useState<number>(returnConfigurationData().ExpenseTypes[0].id);

  async function onCreateTransactionPressHandler(): void {
    await db.transaction(async connection => {
      const id = uuidv4();
      const updatedAt = new Date().getTime();

      // Insert a new transaction
      var sqlTemplate = 'INSERT INTO transactions (id, createdAt, updatedAt, cardId, amount, type, actionType) VALUES (?, ?, ?, ?, ?, ?, ?);';
      var valuesArray = [id, updatedAt, updatedAt, route.params.cardId, Number(sum), expenseTypeID, "expense"];
      await connection.execute(
        sqlTemplate,
        valuesArray
      );

      // Save SQL into file
      await saveTransactionToFile(updatedAt, 'transactions', id, sqlTemplate, valuesArray);
      console.log('Insert a new transaction done!');

      // Update card balance
      sqlTemplate = 'UPDATE cards SET balance = balance - ?, updatedAt = ? WHERE id = ?;';
      valuesArray = [Number(sum), updatedAt, route.params.cardId];
      await connection.execute(
        sqlTemplate,
        valuesArray
      );

      // Save SQL into file
      await saveTransactionToFile(updatedAt, 'cards', route.params.cardId, sqlTemplate, valuesArray);
      console.log('Update card balance done!');
    });

    navigation.push("Card", {
      id: route.params.cardId,
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
        <Label>Expense</Label>
        <View style={styles.headerInput}>
          <Input state={sum} setState={setSum} placeholder="Enter expense sum..." keyboardType="decimal-pad" />
        </View>
        <View style={styles.headerType}>
          <Label>Expense Type</Label>
          <View style={styles.bodyTypes}>
            {returnConfigurationData().ExpenseTypes.map(_expenseType => {
              return (
                <ExpenseType
                  isActive={_expenseType.id === expenseTypeID}
                  key={_expenseType.id}
                  data={_expenseType}
                  onPressHandler={() => {
                    setExpenseTypeID(_expenseType.id);
                  }}
                />
              );
            })}
          </View>
        </View>
        <View style={styles.actionButton}>
          <Button variant="danger" onPressHandler={onCreateTransactionPressHandler} isValidate={validateData()}>
            Expense
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

export default ExpenseScreen;