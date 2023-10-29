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
//Kafka
import { Kafka } from "@upstash/kafka";
import * as FileSystem from 'expo-file-system';
//import { StorageAccessFramework } from 'expo-file-system';

//Kafka
const kafka = new Kafka({
  url: process.env.EXPO_PUBLIC_KAFKA_URL,
  username: process.env.EXPO_PUBLIC_KAFKA_USERNAME,
  password: process.env.EXPO_PUBLIC_KAFKA_PASSWORD,
})
const producer = kafka.producer()
const consumer = kafka.consumer()

const ExpenseScreen: FunctionComponent<IScreen> = ({ navigation, route }) => {
  const [sum, setSum] = useState<string>("");
  const [expenseTypeID, setExpenseTypeID] = useState<number>(returnConfigurationData().ExpenseTypes[0].id);

  function onCreateTransactionPressHandler(): void {
    Database.transaction(async (transaction: SQLTransaction) => {
      await transaction.executeSql(
        "INSERT INTO transactions (cardId, amount, date, type, actionType) VALUES (?, ?, ?, ?, ?);",
        [route.params.cardId, sum, `${new Date().getTime()}`, expenseTypeID, "expense"]
      );
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
      //Kafka
      console.log('Before setExternalDirectory');
      // Requests permissions for external directory
      const { StorageAccessFramework } = FileSystem;
      
      var uri = 'content://com.android.externalstorage.documents/tree/primary%3ASync%2FDerive';
      var files = await StorageAccessFramework.readDirectoryAsync(uri)
          .then((files) => {
            console.log(`Files inside ${uri}:\n${JSON.stringify(files)}`);
            const data_string = FileSystem.readAsStringAsync(files[0], {encoding: FileSystem.EncodingType.UTF8});
            console.log(`Loaded ${data_string.length} bytes`);
            console.log(data_string);
          })
          .catch((error) => {
            console.log(error);
            StorageAccessFramework.requestDirectoryPermissionsAsync(uri); 
          });
      /*
      console.log(`Files inside ${uri}:\n${JSON.stringify(files)}`);
      const data_string = await FileSystem.readAsStringAsync(files[0], {encoding: FileSystem.EncodingType.UTF8});
      console.log(`Loaded ${data_string.length} bytes`);
      console.log(data_string);
      */
      
      

      /*
      const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync(uri);
      if (permissions.granted) {
        // Gets SAF URI from response
        const uri = permissions.directoryUri;

        // Gets all files inside of selected directory
        const files = await StorageAccessFramework.readDirectoryAsync(uri);
        console.log(`Files inside ${uri}:\n${JSON.stringify(files)}`);
      }
      */
      console.log('Before produce');
      const message = {cardId: route.params.cardId, amount: sum, date: `${new Date().getTime()}`, type: expenseTypeID, actionType: "expense"}
      const res = await producer.produce("transactions", message, {
        partition: 0,
        //timestamp: 4567,
        key: route.params.cardId,
        //headers: [{ key: "TRACE-ID", value: "32h67jk" }],
      });
      console.log(res);
      console.log('After produce');
      const messages = await consumer.consume({
        consumerGroupId: "my_consumer_group",
        instanceId: "my_consumer_instance",
        topics: ["transactions"],
        autoOffsetReset: "earliest",
      });
      /*const messages = await consumer.fetch({
        topic: "transactions",
        partition: 0,
        offset: 12,
        timeout: 1000,
      });*/
      console.log('After consume');
      for (let m of messages) {
        console.log(m);
      }
      console.log('After messages');
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
