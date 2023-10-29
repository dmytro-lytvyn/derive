import React, { FunctionComponent, useState } from "react";
import { StyleSheet, View } from "react-native";
import TheLayout from "layouts";
import Database from "sql";
import { SQLResultSet, SQLTransaction } from "expo-sqlite";
import returnConfigurationData from "libs/config";
import ExpenseType from "components/Custom/ExpenseType";
import TopPanel from "components/UI/TopPanel";
import Label from "components/UI/Label";
import Input from "components/UI/Input";
import Button from "components/UI/Button";
// File System
import * as FileSystem from 'expo-file-system';
import { StorageAccessFramework } from 'expo-file-system';

const ExpenseScreen: FunctionComponent<IScreen> = ({ navigation, route }) => {
  const [sum, setSum] = useState<string>("");
  const [expenseTypeID, setExpenseTypeID] = useState<number>(returnConfigurationData().ExpenseTypes[0].id);

  async function saveSyncFile(updatedAt: String, entityType: String, entityId: String, origin: String, sql: String): void {
    var fileName = `${updatedAt}+${entityType}+${entityId}+${origin}.sql`;
    console.log(fileName);
    // Get saved path
    var uri = 'content://com.android.externalstorage.documents/tree/primary%3ASync%2FDerive';
    var fileUri = await StorageAccessFramework.createFileAsync(uri, fileName, 'application/x-sql');
    console.log(fileUri);
    await FileSystem.writeAsStringAsync(fileUri, sql, {encoding: FileSystem.EncodingType.UTF8})
    console.log('After writeAsStringAsync');
  }

  function onCreateTransactionPressHandler(): void {
    Database.transaction(async (transaction: SQLTransaction) => {
      var updatedAt = `${new Date().getTime()}`;
      var valuesTemplate = '?, ?, ?, ?, ?'
      var valuesArray = [route.params.cardId, sum, updatedAt, expenseTypeID, "expense"]
      var valuesString = "'" + valuesArray.join("','") + "'"; // JSON.stringify(valuesArray)
      var sql = 'INSERT INTO transactions (cardId, amount, date, type, actionType) VALUES ({values});'
      // Insert a new transaction
      await transaction.executeSql(
        sql.replace('{values}', valuesTemplate),
        valuesArray
      );
      console.log(sql.replace('{values}', valuesString));
      // Save SQL into file
      saveSyncFile(updatedAt, 'transactions', route.params.cardId, 'debug', sql.replace('{values}', valuesString));
      // Update card balance
      await transaction.executeSql(
        "SELECT * FROM cards WHERE id = ?",
        [route.params.cardId],
        (t: SQLTransaction, result: SQLResultSet) => {
          transaction.executeSql(
            "UPDATE cards SET balance = ? WHERE id = ?",
            [Number(result.rows._array[0].balance) - Number(sum), route.params.cardId],
            () => {
              navigation.push("Card", {
                id: route.params.cardId,
              });
            }
          );
        }
      );
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