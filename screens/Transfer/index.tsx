import React, { FunctionComponent, useEffect, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import Database from "sql";
import { SQLResultSet, SQLTransaction } from "expo-sqlite";
import TheLayout from "layouts";
import AppConstants from "styles/constants";
import EmptyCard from "components/Custom/EmptyCard";
import Card from "components/Custom/Card";
import TopPanel from "components/UI/TopPanel";
import Label from "components/UI/Label";
import Button from "components/UI/Button";
import Input from "components/UI/Input";
// Custom functions
import saveTransactionToFile from "libs/saveTransactionToFile"
// UUID
//import * as Crypto from 'expo-crypto';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const TransferScreen: FunctionComponent<IScreen> = ({ navigation, route }) => {
  const [sum, setSum] = useState<number>(0);
  const [cards, setCards] = useState<ICard[]>([]);
  const [selectedCard, setSelectedCard] = useState<ICard>();
  const [isOpenChooseCardScreen, setIsOpenChooseCardScreen] = useState<boolean>(false);

  function onChooseCardPressHandler(): void {
    setIsOpenChooseCardScreen(true);
  }

  useEffect(() => {
    Database.transaction((transaction: SQLTransaction) => {
      transaction.executeSql(
        "SELECT * FROM cards WHERE id != ?",
        [route.params.cardId],
        (transaction: SQLTransaction, result: SQLResultSet) => {
          setCards(result.rows._array);
        }
      );
    });
  }, []);

  function validateData(): boolean {
    if (sum) {
      return true;
    }
    return false;
  }

  function onTransferConfirmHandler(): void {
    var updatedAt = `${new Date().getTime()}`;
    var sqlSelectTemplate = 'SELECT * FROM cards WHERE id = ?;';
    var sqlUpdateTemplate = 'UPDATE cards SET balance = ? WHERE id = ?;';

    Database.transaction((transaction: SQLTransaction) => {
      // From card
      transaction.executeSql(
        sqlSelectTemplate,
        [route.params.cardId],
        (t, result: SQLResultSet) => {
          var valuesArray = [Number(result.rows._array[0].balance) - Number(sum), route.params.cardId];

          transaction.executeSql(
            sqlUpdateTemplate,
            valuesArray
          );
          console.log('Update card 1 done!');
          // Save SQL into file
          saveTransactionToFile(updatedAt, 'cards', String(route.params.cardId), sqlUpdateTemplate, valuesArray);
          console.log('saveTransactionToFile 1 done!');
        });

      // To card
      transaction.executeSql(
        sqlSelectTemplate,
        [selectedCard?.id],
        (t, result: SQLResultSet) => {
          var valuesArray = [Number(result.rows._array[0].balance) + Number(sum), selectedCard?.id];

          transaction.executeSql(
            sqlUpdateTemplate,
            valuesArray,
            () => {
              navigation.push("Card", {
                id: route.params.cardId,
              });
            }
          );
          console.log('Update card 2 done!');
          // Save SQL into file
          saveTransactionToFile(updatedAt, 'cards', String(selectedCard?.id), sqlUpdateTemplate, valuesArray);
          console.log('saveTransactionToFile 2 done!');
        }
      );
    });
  }

  return (
    <TheLayout>
      {isOpenChooseCardScreen ? (
        <>
          <TopPanel />
          <View style={styles.body}>
            <Label>Transfer amount to different card</Label>
            <View style={styles.headerInput}>
              {cards.map((card: ICard) => {
                return (
                  <View key={card.id} style={styles.chooseCard}>
                    <Card
                      number={card.number}
                      colorId={card.colorId}
                      balance={card.balance}
                      paymentSystem={card.paymentSystem}
                      date={card.endDate}
                      onPressHandler={() => {
                        setSelectedCard(card);
                        setIsOpenChooseCardScreen(false);
                      }}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        </>
      ) : (
        <>
          <TopPanel withBack navigation={navigation} backPathname="Card" backParams={{ id: route?.params?.cardId }} />
          <View style={styles.body}>
            <Label>Transfer amount to different card</Label>
            <View style={styles.headerInput}>
              <Input state={sum} setState={setSum} placeholder="Enter transfer sum..." keyboardType="decimal-pad" />
            </View>
            <View style={styles.transferBody}>
              {selectedCard ? (
                <Card
                  key={selectedCard.id}
                  number={selectedCard.number}
                  colorId={selectedCard.colorId}
                  balance={selectedCard.balance}
                  paymentSystem={selectedCard.paymentSystem}
                  date={selectedCard.endDate}
                />
              ) : (
                <EmptyCard onPressHandler={onChooseCardPressHandler} />
              )}
              <TouchableOpacity onPress={onChooseCardPressHandler} activeOpacity={AppConstants.ActiveOpacity}>
                <View style={styles.chooseCardButton}>
                  <Text style={styles.chooseCardButtonText}>Choose card</Text>
                </View>
              </TouchableOpacity>
              {selectedCard?.id && (
                <View style={styles.actionButton}>
                  <Button variant="warning" onPressHandler={onTransferConfirmHandler} isValidate={validateData()}>
                    Transfer
                  </Button>
                </View>
              )}
            </View>
          </View>
        </>
      )}
    </TheLayout>
  );
};

const styles = StyleSheet.create({
  body: {
    marginTop: 39,
    paddingBottom: 39,
  },
  headerInput: {
    marginTop: 23,
  },
  transferBody: {
    marginTop: 23,
  },
  chooseCard: {
    marginTop: 12,
  },
  chooseCardButton: {
    width: "100%",
    marginTop: 23,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppConstants.BackgroundSecondColor,
    paddingVertical: 22,
    paddingHorizontal: 22,
    borderRadius: 20,
  },
  chooseCardButtonText: {
    color: "#DCDCDC",
    fontFamily: AppConstants.FontBold,
    fontSize: 14,
  },
  actionButton: { marginTop: 92 },
});

export default TransferScreen;
