import React, { FunctionComponent, useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import db from "sql";
import { SQLResultSet, SQLTransaction } from "expo-sqlite";
import returnConfigurationData from "libs/config";
import toPriceFormat from "libs/toPriceFormat";
import toDateFormat from "libs/toDateFormat";
import AppConstants from "styles/constants";
import TheLayout from "layouts";
import Transaction from "components/Custom/Transaction";
import TopPanel from "components/UI/TopPanel";
import Label from "components/UI/Label";

const TransactionScreen: FunctionComponent<IScreen> = ({ navigation, route }) => {
  const [currentTransaction, setCurrentTransaction] = useState<ITransaction>();
  const [transactions, setTransactions] = useState<ITransaction[]>();

  useEffect(() => {
    db.transaction(async connection => {
      // Get the current transaction record
      var result = await connection.execute(
        "SELECT * FROM transactions WHERE id = ?",
        [route.params.id]
      );

      setCurrentTransaction(result.rows[0]);

      // Show last 5 transactions of the same type
      result = await connection.execute(
        "SELECT * FROM transactions WHERE type = ? AND id != ? ORDER BY createdAt DESC LIMIT 5",
            [result.rows[0].type, result.rows[0].id]
      );

      setTransactions(result.rows);
    });
  }, [route]);

  return (
    <TheLayout>
      <TopPanel withBack isGoBack navigation={navigation} />
      <View style={styles.card}>
        <View style={styles.imageWrapper}>
          <Image
            source={
              returnConfigurationData().AllTransactionTypes.find(
                transactionType => transactionType.id === Number(currentTransaction?.type)
              )?.image
            }
            style={styles.image}
          />
        </View>
        <View>
          <Text style={[styles.center, styles.transactionType]}>
            {
              returnConfigurationData().AllTransactionTypes.find(
                transactionType => transactionType.id === Number(currentTransaction?.type)
              )?.title
            }
          </Text>
          <Text style={[styles.center, styles.transactionDate]}>{toDateFormat(currentTransaction?.createdAt || "")}</Text>
          <Text style={[styles.center, styles.transactionAmount]}>
            {currentTransaction?.actionType === "income" ? "+ " : "- "}
            {toPriceFormat(currentTransaction?.amount || 0)} ₽
          </Text>
        </View>
      </View>
      {Boolean(transactions?.length) && (
        <View style={styles.transactionsWrapper}>
          <Label>More transactions</Label>
          <View style={styles.transactionsBody}>
            {transactions?.map(transaction => {
              return <Transaction key={transaction.id} data={transaction} navigation={navigation} />;
            })}
          </View>
        </View>
      )}
    </TheLayout>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppConstants.BackgroundSecondColor,
    width: "100%",
    paddingVertical: 31,
    borderRadius: 20,
    marginTop: 35,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  imageWrapper: {
    width: 134,
    height: 134,
    backgroundColor: AppConstants.BackgroundColor,
    borderRadius: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 74,
    height: 74,
  },
  center: {
    textAlign: "center",
  },
  transactionType: {
    fontFamily: AppConstants.FontBold,
    color: "#F9F9F9",
    fontSize: 16,
    marginTop: 16,
  },
  transactionDate: {
    fontFamily: AppConstants.FontBold,
    color: "#9E9E9E",
    fontSize: 10,
    marginTop: 4,
  },
  transactionsBody: {
    marginTop: 11,
  },
  transactionAmount: {
    fontFamily: AppConstants.FontExtra,
    color: "#F9F9F9",
    fontSize: 18,
    marginTop: 16,
  },
  transactionsWrapper: {
    marginTop: 42,
    paddingBottom: 40,
  },
});

export default TransactionScreen;
