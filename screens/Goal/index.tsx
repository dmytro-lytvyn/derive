import React, { FunctionComponent, useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import db from "sql";
import { SQLResultSet, SQLTransaction } from "expo-sqlite";
import toPriceFormat from "libs/toPriceFormat";
import TheLayout from "layouts";
import Goal from "components/Custom/Goal";
import TopPanel from "components/UI/TopPanel";
import Label from "components/UI/Label";
import Input from "components/UI/Input";
import Button from "components/UI/Button";
// Custom functions
import saveTransactionToFile from "libs/saveTransactionToFile"

const GoalScreen: FunctionComponent<IScreen> = ({ navigation, route }) => {
  const [goal, setGoal] = useState<IGoal>();
  const [leftAmount, setLeftAmount] = useState<number>(0);
  const [amountToAdd, setAmountToAdd] = useState<string>("");
  const [amountToWithdraw, setAmountToWithdraw] = useState<string>("");

  useEffect(() => {
    db.transaction(async connection => {
      const result = await connection.execute(
        "SELECT * FROM goals WHERE id = ?",
        [route.params.id]
      );

      setGoal(result.rows[0]);
      setLeftAmount(result.rows[0].finalAmount - result.rows[0].currentAmount);
    });
  }, [navigation]);

  async function onUpdateGoalPressHandler(): void {
    await db.transaction(async connection => {
      const currentAmount = goal?.currentAmount || 0;
      const newAmount = currentAmount + Number(amountToAdd) + -Number(amountToWithdraw);
      const completeAmount = newAmount >= 0 ? newAmount : 0;
      const updatedAt = new Date().getTime();

      // Update goal
      const sqlTemplate = 'UPDATE goals SET currentAmount = ?, updatedAt = ? WHERE id = ?;';
      const valuesArray = [completeAmount, updatedAt, route.params.id];

      await connection.execute(
        sqlTemplate,
        valuesArray
      );

      // Save SQL into file
      saveTransactionToFile(updatedAt, 'goals', route.params.id, sqlTemplate, valuesArray);
      console.log('saveTransactionToFile done!');
    });

    navigation.push("Home");
  }

  async function onRemoveGoalPressHandler(): void {
    await db.transaction(async connection => {
      const updatedAt = new Date().getTime();

      // Update goal
      const sqlTemplate = 'DELETE FROM goals WHERE id = ?;';
      const valuesArray = [route.params.id];

      await connection.execute(
        sqlTemplate,
        valuesArray
      );

      // Save SQL into file
      saveTransactionToFile(updatedAt, 'goals', route.params.id, sqlTemplate, valuesArray);
      console.log('saveTransactionToFile done!');
    });

    navigation.push("Home");
  }

  return (
    <TheLayout>
      <TopPanel withBack navigation={navigation} backPathname="Home" />
      <View style={styles.body}>
        <Label>Goal: {goal?.name}</Label>
        <View style={styles.goalProgress}>
          <Goal type="B" currentAmount={goal?.currentAmount} finalAmount={goal?.finalAmount} name={goal?.name} />
        </View>
        <Text style={styles.goalDescription}>{goal?.description}</Text>
        <Text style={styles.left}>Left: {toPriceFormat(leftAmount)} ₽</Text>
        <View style={styles.action}>
          <Label>Add amount</Label>
          <View style={styles.actionInput}>
            <Input
              state={amountToAdd}
              setState={setAmountToAdd}
              keyboardType="decimal-pad"
              placeholder="Enter the amount to add..."
            />
          </View>
        </View>
        <View style={styles.action}>
          <Label>Withdraw the amount</Label>
          <View style={styles.actionInput}>
            <Input
              state={amountToWithdraw}
              setState={setAmountToWithdraw}
              keyboardType="decimal-pad"
              placeholder="Enter the amount to withdraw..."
            />
          </View>
        </View>
        <View style={styles.saveButton}>
          <Button onPressHandler={onUpdateGoalPressHandler}>Save</Button>
        </View>
        <View style={styles.removeButton}>
          <Button onPressHandler={onRemoveGoalPressHandler} variant="danger">
            Remove
          </Button>
        </View>
      </View>
    </TheLayout>
  );
};

const styles = StyleSheet.create({
  body: {
    marginTop: 35,
    paddingBottom: 46,
  },
  goalProgress: {
    marginTop: 8,
  },
  progress: {
    height: 75,
    borderRadius: 20,
    marginTop: -75,
  },
  progressLine: {
    backgroundColor: "#1E1E2D",
    width: "100%",
    height: 75,
    borderRadius: 20,
  },
  goalDescription: {
    marginTop: 19,
    fontFamily: "Lato-Bold",
    color: "#F9F9F9",
    fontSize: 12,
  },
  left: {
    marginTop: 12,
    fontFamily: "Lato-Bold",
    color: "#F9F9F9",
    fontSize: 12,
  },
  action: {
    marginTop: 26,
  },
  actionInput: {
    marginTop: 18,
  },
  saveButton: {
    marginTop: 82,
  },
  removeButton: {
    marginTop: 12,
  },
});

export default GoalScreen;
