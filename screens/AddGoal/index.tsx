import React, { FunctionComponent, useState } from "react";
import { StyleSheet, View } from "react-native";
import Database from "sql";
import { SQLTransaction } from "expo-sqlite";
import TheLayout from "layouts";
import TopPanel from "components/UI/TopPanel";
import Label from "components/UI/Label";
import Input from "components/UI/Input";
import MultilineInput from "components/UI/MultilineInput";
import Button from "components/UI/Button";
// UUID
//import * as Crypto from 'expo-crypto';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const AddGoalScreen: FunctionComponent<IScreen> = ({ navigation }) => {
  const [goalName, setGoalName] = useState<string>("");
  const [goalFinalAmount, setGoalFinalAmount] = useState<string>("");
  const [goalDescription, setGoalDescription] = useState<string>("");

  function onAddGoalPressHandler(): void {
    Database.transaction((transaction: SQLTransaction) => {
      var id = uuidv4();
      transaction.executeSql(
        "INSERT INTO goals (id, name, description, finalAmount, currentAmount) VALUES (?, ?, ?, ?, ?);",
        [id, goalName, goalDescription, goalFinalAmount, 0],
        () => {
          navigation.push("Home");
        }
      );
    });
  }

  function validateData(): boolean {
    if (goalName && goalFinalAmount) {
      return true;
    } else {
      return false;
    }
  }

  return (
    <TheLayout>
      <TopPanel navigation={navigation} withBack backPathname="Home" />
      <View style={styles.body}>
        <Label>Create a Goal</Label>
        <View style={styles.finalAmount}>
          <Input
            state={goalFinalAmount}
            setState={setGoalFinalAmount}
            placeholder="Enter the final amount..."
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.goalName}>
          <Input state={goalName} setState={setGoalName} placeholder="Enter goal name..." />
        </View>
        <View style={styles.goalDescription}>
          <MultilineInput
            state={goalDescription}
            setState={setGoalDescription}
            placeholder="Enter goal description..."
          />
        </View>
        <View style={styles.createButton}>
          <Button onPressHandler={onAddGoalPressHandler} isValidate={validateData()}>
            Create
          </Button>
        </View>
      </View>
    </TheLayout>
  );
};

const styles = StyleSheet.create({
  body: {
    marginTop: 39,
  },
  goalName: {
    marginTop: 10,
  },
  goalDescription: {
    marginTop: 10,
  },
  finalAmount: {
    marginTop: 23,
  },
  createButton: {
    marginTop: 60,
    paddingBottom: 35,
  },
});

export default AddGoalScreen;
