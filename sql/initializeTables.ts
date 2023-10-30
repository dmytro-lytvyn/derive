import { SQLTransaction } from "expo-sqlite";

function initializeTables(transaction: SQLTransaction) {
  transaction.executeSql(
    "CREATE TABLE IF NOT EXISTS cards (id TEXT PRIMARY KEY NOT NULL, balance INT, paymentSystem TEXT, number TEXT, endDate TEXT, colorId INT);"
  );
  transaction.executeSql(
    "CREATE TABLE IF NOT EXISTS goals (id TEXT PRIMARY KEY NOT NULL, name TEXT, description TEXT, finalAmount INT, currentAmount INT);"
  );
  transaction.executeSql(
    "CREATE TABLE IF NOT EXISTS transactions (id TEXT PRIMARY KEY NOT NULL, cardId TEXT, amount INT, date TEXT, type TEXT, actionType TEXT);"
  );
}

export default initializeTables;
