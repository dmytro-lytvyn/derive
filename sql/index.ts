//import * as SQLite from "expo-sqlite";
import {Database} from "libs/database/database.js";

//const Database: SQLite.WebSQLDatabase = SQLite.openDatabase("deriveDB");
const db = new Database("deriveDB");

export default db;
