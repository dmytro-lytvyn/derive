// (c) Gennady Dogaev, https://gist.github.com/GendelfLugansk/db31d7742c4dbc3d6d768fa525474aff
import * as SQLite from "expo-sqlite";

class Connection {
    constructor(databaseName) {
        this._db = SQLite.openDatabase(databaseName);
        this.transacting = false;
    }

    execute(sqlStatement, args = []) {
        return new Promise((resolve, reject) => {
            this._db.exec([{sql: sqlStatement, args}], false, (err, res) => {
                if (err) {
                    return reject(err);
                }
                
                if (res[0].error) {
                    return reject(res[0].error);
                }

                resolve(res[0]);
            });
        });
    }

    close() {
        this._db._db.close();
    }

    async beginTransaction() {
        await this.execute("begin transaction");
        this.transacting = true;
    }

    async commitTransaction() {
        await this.execute("commit");
        this.transacting = false;
    }

    async rollbackTransaction() {
        await this.execute("rollback");
        this.transacting = false;
    }
}

export class Database {
    constructor(name = "main", {prepareConnFn, migrateFn} = {}) {
        this._dbName = name;
        this._connection = new Connection(this._dbName);
        this._params = {prepareConnFn, migrateFn};

        this._prepareConnectionPromise =
            typeof this._params.prepareConnFn === "function"
                ? this._params.prepareConnFn(this._connection)
                : Promise.resolve();

        const performMigration = async () => {
            const connection = new Connection(this._dbName);
            await this._params.migrateFn(connection);
            connection.close();
        };

        this._migrationPromise =
            typeof this._params.migrateFn === "function"
                ? performMigration()
                : Promise.resolve();
    }

    async execute(sqlQuery, args = []) {
        await this._prepareConnectionPromise;
        await this._migrationPromise;

        return await this._connection.execute(sqlQuery, args);
    }

    async transaction(cb) {
        await this._prepareConnectionPromise;
        await this._migrationPromise;
        const connection = new Connection(this._dbName);
        if (typeof this._params.prepareConnFn === "function") {
            await this._params.prepareConnFn(connection);
        }
        try {
            await connection.beginTransaction();
            try {
                await cb(connection);
                await connection.commitTransaction();
            } catch (e) {
                await connection.rollbackTransaction();
                throw e;
            }
        } catch (e) {
            connection.close();
            throw e;
        }
        await connection.close();
    }

    close() {
        this._connection._db.close();
    }
}