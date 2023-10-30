import React, { FunctionComponent, useState } from "react";
import { StyleSheet, View } from "react-native";
import Database from "sql";
import { SQLTransaction } from "expo-sqlite";
import TheLayout from "layouts";
import AppConstants from "styles/constants";
import TopPanel from "components/UI/TopPanel";
import Label from "components/UI/Label";
import Skin from "components/UI/Skin";
import Input from "components/UI/Input";
import Button from "components/UI/Button";
import PaymentSystem from "components/UI/PaymentSystem";
// Custom functions
import saveTransactionToFile from "libs/saveTransactionToFile"
// UUID
//import * as Crypto from 'expo-crypto';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const AddCardScreen: FunctionComponent<IScreen> = ({ navigation }) => {
  const [paymentSystem, setPaymentSystem] = useState<IPaymentSystem>("Visa");
  const [skinID, setSkinID] = useState<number>(0);
  const [initialSum, setInitialSum] = useState<number>(0);
  const [cardNumber, setCardNumber] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  function onCreateCardPressHandler(): void {
    Database.transaction((transaction: SQLTransaction) => {
      var id = uuidv4();
      var updatedAt = `${new Date().getTime()}`;
      var sqlTemplate = 'INSERT INTO cards (id, balance, paymentSystem, number, endDate, colorId) VALUES (?, ?, ?, ?, ?, ?);';
      var valuesArray = [id, Number(initialSum), paymentSystem, cardNumber, endDate, skinID];
      // Insert a new card
      transaction.executeSql(
        sqlTemplate,
        valuesArray
      );
      // Save SQL into file
      saveTransactionToFile(updatedAt, 'cards', id, sqlTemplate, valuesArray);
      console.log('saveTransactionToFile done!');
    });
    navigation.push("Home");
  }

  function validateData(): boolean {
    if (Number(initialSum) !== 0 && cardNumber.length === 19 && endDate.length === 10) {
      return true;
    } else {
      return false;
    }
  }

  return (
    <TheLayout>
      <TopPanel navigation={navigation} withBack isGoBack />
      <View style={styles.body}>
        <Label>Choose skin</Label>
        <View style={styles.skins}>
          {AppConstants.CardSkins.map(skin => {
            return <Skin key={skin.id} setState={setSkinID} state={skinID} colors={skin.colors} id={skin.id} />;
          })}
        </View>
        <View style={styles.mt}>
          <Label>Card info</Label>
          <View style={styles.cardInfoContent}>
            <Input
              state={initialSum}
              setState={setInitialSum}
              keyboardType="decimal-pad"
              placeholder="Enter initial sum..."
            />
            <Input
              mask="9999 9999 9999 9999"
              state={cardNumber}
              setState={setCardNumber}
              keyboardType="decimal-pad"
              placeholder="Enter card number..."
            />
            <Input
              mask="99/99/9999"
              state={endDate}
              setState={setEndDate}
              keyboardType="decimal-pad"
              placeholder="Enter end date..."
            />
          </View>
        </View>
        <View style={{ marginTop: 35 }}>
          <Label>Payment System</Label>
          <View style={styles.paymentSystems}>
            <PaymentSystem system="visa" isActive={paymentSystem === "Visa"} onPress={() => setPaymentSystem("Visa")} />
            <PaymentSystem
              system="paypal"
              isActive={paymentSystem === "Paypal"}
              onPress={() => setPaymentSystem("Paypal")}
            />
          </View>
        </View>
        <View style={styles.createButton}>
          <Button variant="primary" onPressHandler={onCreateCardPressHandler} isValidate={validateData()}>
            Create
          </Button>
        </View>
      </View>
    </TheLayout>
  );
};

const styles = StyleSheet.create({
  body: {
    marginTop: 32,
  },
  mt: {
    marginTop: 25,
  },
  createButton: {
    marginTop: 60,
    paddingBottom: 35,
  },
  skins: {
    marginTop: 23,
    height: 175,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardInfoContent: {
    marginTop: 23,
    height: 200,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  paymentSystems: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 23,
  },
});

export default AddCardScreen;
