import React, { FunctionComponent, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import TheLayout from "layouts";
import db from "sql";
import { SQLResultSet, SQLTransaction } from "expo-sqlite";
import Transaction from "components/Custom/Transaction";
import TopPanel from "components/UI/TopPanel";
import Label from "components/UI/Label";

const TransactionsScreen: FunctionComponent<IScreen> = ({ navigation }) => {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);

  useEffect(() => {
    db.transaction(async connection => {
      var result = await connection.execute(
        sqlTemplate,
        valuesArray
      );

      setTransactions(result.rows);
    });
  }, []);

  return (
    <TheLayout>
      <TopPanel withBack navigation={navigation} backPathname="Home" />
      <View style={styles.body}>
        <Label>All Transactions</Label>
        <View style={styles.data}>
          {transactions.map((_transaction: ITransaction) => {
            return <Transaction navigation={navigation} key={_transaction.id} data={_transaction} />;
          })}
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
  data: {
    marginTop: 11,
  },
});

export default TransactionsScreen;
