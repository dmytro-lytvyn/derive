import React, { FunctionComponent, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, Text, Pressable } from "react-native";
import db from "sql";
import { SQLResultSet, SQLTransaction } from "expo-sqlite";
import TheLayout from "layouts";
import AppConstants from "styles/constants";
import AddCard from "components/Custom/AddCard";
import MinCard from "components/Custom/MinCard";
import AddGoal from "components/Custom/AddGoal";
import Goal from "components/Custom/Goal";
import Transaction from "components/Custom/Transaction";
import TopPanel from "components/UI/TopPanel";
import Label from "components/UI/Label";

const HomeScreen: FunctionComponent<IScreen> = ({ navigation, route }) => {
  const [cards, setCards] = useState<ICard[]>([]);
  const [goals, setGoals] = useState<IGoal[]>([]);
  const [transactions, setTransactions] = useState<ITransaction[]>([]);

  function onGoToTransactions(): void {
    navigation.push("Transactions");
  }

  useEffect(() => {
    db.transaction(async connection => {
      const result = await connection.execute(
        "SELECT * FROM cards ORDER BY endDate DESC",
      );

      setCards(result.rows);
    });

    db.transaction(async connection => {
      const result = await connection.execute(
        "SELECT * FROM goals ORDER BY name"
      );

      setGoals(result.rows);
    });

    db.transaction(async connection => {
      const result = await connection.execute(
        "SELECT * FROM transactions ORDER BY createdAt DESC LIMIT 5"
      );

      setTransactions(result.rows);
    });
  }, [route]);

  return (
    <TheLayout withHorizontalPaddings={false}>
      <TopPanel />
      <View style={styles.container}>
        <View style={styles.cardsContainer}>
          <ScrollView horizontal>
            <AddCard navigation={navigation} />
            {cards.map(card => {
              return (
                <MinCard
                  key={card.id}
                  id={card.id}
                  number={card.number}
                  endDate={card.endDate}
                  colorId={card.colorId}
                  balance={card.balance}
                  paymentSystem={card.paymentSystem}
                  navigation={navigation}
                />
              );
            })}
          </ScrollView>
        </View>
        <View style={styles.body}>
          <Label>Goals</Label>
          <View style={styles.goalsContent}>
            {goals.map(goal => {
              return (
                <Goal
                  key={goal.id}
                  id={goal.id}
                  name={goal.name}
                  currentAmount={goal.currentAmount}
                  finalAmount={goal.finalAmount}
                  navigation={navigation}
                />
              );
            })}
            <View style={styles.addGoal}>
              <AddGoal navigation={navigation} />
            </View>
          </View>
          {Boolean(transactions.length) && (
            <View>
              <View style={styles.transactionsHeader}>
                <Label>Last Transactions</Label>
                <Pressable onPress={onGoToTransactions}>
                  <Text style={styles.allTransactions}>All</Text>
                </Pressable>
              </View>
              <View style={styles.transactionsBody}>
                {transactions.map((transaction: ITransaction) => {
                  return <Transaction navigation={navigation} key={transaction.id} data={transaction} />;
                })}
              </View>
            </View>
          )}
        </View>
      </View>
    </TheLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 46,
  },
  body: {
    marginTop: 10,
    paddingHorizontal: AppConstants.PaddingHorizontal,
    paddingBottom: 40,
  },
  cardsContainer: {
    paddingLeft: AppConstants.PaddingHorizontal,
    height: 200,
  },
  goalsContent: {
    marginTop: 5,
  },
  addGoal: {
    marginTop: 12,
  },
  transactionsHeader: {
    marginTop: 42,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  transactionsBody: {
    marginTop: 11,
  },
  allTransactions: {
    fontFamily: AppConstants.FontExtra,
    color: "#585858",
  },
});

export default HomeScreen;
