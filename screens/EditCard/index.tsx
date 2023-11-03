import React, { FunctionComponent, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import db from "sql";
import { SQLResultSet, SQLTransaction } from "expo-sqlite";
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

const EditCardScreen: FunctionComponent<IScreen> = ({ navigation, route }) => {
  const [activePaymentSystem, setActivePaymentSystem] = useState<IPaymentSystem>("Visa");
  const [activeSkin, setActiveSkin] = useState<number>(0);
  const [cardNumber, setCardNumber] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  async function onUpdateCardPressHandler(): void {
    const updatedAt = new Date().getTime();

    // Update card
    const sqlTemplate = 'UPDATE cards SET number = ?, endDate = ?, paymentSystem = ?, colorId = ?, updatedAt = ? WHERE id = ?;';
    const valuesArray = [
      cardNumber,
      endDate,
      activePaymentSystem,
      activeSkin,
      updatedAt,
      route.params.id,
    ];

    await db.execute(
      sqlTemplate,
      valuesArray
    );

    // Save SQL into file
    await saveTransactionToFile(updatedAt, 'cards', route.params.id, sqlTemplate, valuesArray);
    console.log('saveTransactionToFile done!');

    navigation.push("Home");
  }

  async function onRemoveCardPressHandler(): void {
    await db.transaction(async connection => {
      const updatedAt = new Date().getTime();
      const valuesArray = [route.params.id];

      var sqlTemplate = 'DELETE FROM transactions WHERE cardId = ?;';
      // Delete transactions
      await connection.execute(
        sqlTemplate,
        valuesArray
      );
      // Save SQL into file
      await saveTransactionToFile(updatedAt, 'transactions', route.params.id, sqlTemplate, valuesArray);
      console.log('Delete transactions done!');

      sqlTemplate = 'DELETE FROM cards WHERE id = ?;';
      // Delete card
      await connection.execute(
        sqlTemplate,
        valuesArray
      );
      // Save SQL into file
      await saveTransactionToFile(updatedAt, 'cards', route.params.id, sqlTemplate, valuesArray);
      console.log('Delete card done!');
    });

    const result = await db.execute("SELECT * FROM cards");
    if (result.rows.length) {
      navigation.push("Home");
    } else {
      navigation.push("Start");
    }
  }

  useEffect(() => {
    db.transaction(async connection => {
      const result = await connection.execute(
        "SELECT * FROM cards WHERE id = ?",
        [route.params.id]
      );

      if (result.rows.length > 0) {
        setActiveSkin(Number(result.rows[0].colorId));
        setActivePaymentSystem(result.rows[0].paymentSystem);
        setCardNumber(String(result.rows[0].number));
        setEndDate(result.rows[0].endDate.replace("/", "").replace("/", ""));
      }
    });
  }, []);

  return (
    <TheLayout>
      <TopPanel navigation={navigation} withBack isGoBack />
      <View style={styles.body}>
        <Label>Edit skin</Label>
        <View style={styles.skins}>
          {AppConstants.CardSkins.map(skin => {
            return <Skin key={skin.id} setState={setActiveSkin} state={activeSkin} {...skin} />;
          })}
        </View>
        <View style={styles.mt}>
          <Label>Edit card info</Label>
          <View style={styles.cardInfoContent}>
            {Boolean(cardNumber) ? (
              <Input
                defaultValue={cardNumber}
                mask="9999 9999 9999 9999"
                state={cardNumber}
                setState={setCardNumber}
                keyboardType="decimal-pad"
                placeholder="Enter card number..."
              />
            ) : (
              <Input state={cardNumber} setState={setCardNumber} placeholder="Enter card number..." />
            )}
            {Boolean(endDate) ? (
              <Input
                defaultValue={endDate}
                mask="99/99/9999"
                state={endDate}
                setState={setEndDate}
                keyboardType="decimal-pad"
                placeholder="Enter end date..."
              />
            ) : (
              <Input state={endDate} setState={setEndDate} placeholder="Enter end date..." />
            )}
          </View>
        </View>
        <View style={{ marginTop: 35 }}>
          <Label>Edit payment system</Label>
          <View style={styles.paymentSystems}>
            <PaymentSystem
              system="visa"
              isActive={activePaymentSystem === "Visa"}
              onPress={() => setActivePaymentSystem("Visa")}
            />
            <PaymentSystem
              system="paypal"
              isActive={activePaymentSystem === "Paypal"}
              onPress={() => setActivePaymentSystem("Paypal")}
            />
          </View>
        </View>
        <View style={styles.createButton}>
          <Button variant="primary" onPressHandler={onUpdateCardPressHandler}>
            Save
          </Button>
        </View>
        <View style={styles.removeButton}>
          <Button variant="danger" onPressHandler={onRemoveCardPressHandler}>
            Remove
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
  },
  removeButton: {
    marginTop: 12,
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
    height: 130,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  paymentSystems: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 23,
  },
});

export default EditCardScreen;
