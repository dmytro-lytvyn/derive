import db from "sql";

function initializeTables() {
  db.execute(
    "CREATE TABLE IF NOT EXISTS cards (id TEXT PRIMARY KEY NOT NULL, createdAt INT, updatedAt INT, balance INT, paymentSystem TEXT, number TEXT, endDate TEXT, colorId INT);"
  );
  db.execute(
    "CREATE TABLE IF NOT EXISTS goals (id TEXT PRIMARY KEY NOT NULL, createdAt INT, updatedAt INT, name TEXT, description TEXT, finalAmount INT, currentAmount INT);"
  );
  db.execute(
    "CREATE TABLE IF NOT EXISTS transactions (id TEXT PRIMARY KEY NOT NULL, createdAt INT, updatedAt INT, cardId TEXT, amount INT, type TEXT, actionType TEXT);"
  );
}

export default initializeTables;
