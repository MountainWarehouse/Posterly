import SQLite from 'react-native-sqlite-storage';

import { Parcel } from '../models/Parcel';
import { Recipient } from '../models/Recipient';
import { DatabaseInitialization } from './DatabaseInitialization';

export interface Database {
    open(): Promise<SQLite.SQLiteDatabase>;
    close(): Promise<void>;
    createRecipient(name: string, email: string): Promise<Recipient>;
    getRecipientById(id: number): Promise<Recipient | null>;
    getAllRecipients(): Promise<Recipient[]>;
    createParcel(parcelBarcode: string, recipientId: number, shelfBarcode?: string): Promise<Parcel>;
    getParcelByBarcode(barcode: string): Promise<Parcel | null>;
    getAllParcels(): Promise<Parcel[]>;
    updateParcel(barcode: string, checkoutPerson: string): Promise<void>;
    //todo getParcelByRecipient
}

class DatabaseImpl implements Database {
    private databaseName = 'AppDatabase.db';
    private database: SQLite.SQLiteDatabase | undefined;

    // Open the connection to the database
    public async open(): Promise<SQLite.SQLiteDatabase> {
        SQLite.DEBUG(true);
        SQLite.enablePromise(true);
        let databaseInstance: SQLite.SQLiteDatabase;

        const db = await SQLite.openDatabase({
            name: this.databaseName,
            location: 'default'
        });
        databaseInstance = db;
        // Perform any database initialization or updates, if needed
        const databaseInitialization = new DatabaseInitialization();
        await databaseInitialization.updateDatabaseTables(databaseInstance);
        this.database = databaseInstance;
        return databaseInstance;
    }

    // Close the connection to the database
    public async close(): Promise<void> {
        if (!this.database) {
            return Promise.reject('[db] Database was not open; unable to close.');
        }
        await this.database.close();
        this.database = undefined;
    }

    // Insert a new list into the database
    public async createRecipient(name: string, email: string): Promise<Recipient> {
        const resultSet = await this.executeSql('INSERT INTO User (userName, userEmail) VALUES (?,?);', [name, email]);
        return { id: resultSet.insertId, name, email };
    }

    public async getRecipientById(id: number): Promise<Recipient | null> {
        const resultSet = await this.executeSql(
            'SELECT user_id as id, userName as name, UserEmail as email FROM User WHERE id = ?;',
            [id]
        );
        if (!resultSet) {
            return null;
        }

        return resultSet.rows.item(0);
    }

    // Get an array of all the lists in the database
    public async getAllRecipients(): Promise<Recipient[]> {
        const resultSet = await this.executeSql(
            'SELECT user_id as id, userName as name, UserEmail as email FROM User;'
        );
        if (!resultSet) {
            return [];
        }
        const users: Recipient[] = [];
        for (let i = 0; i < resultSet.rows.length; i++) {
            const row = resultSet.rows.item(i);
            const { id, name, email } = row;
            users.push({ id, name, email });
        }
        return users;
    }

    public async createParcel(barcode: string, recipientId: number, shelfBarcode?: string): Promise<Parcel> {
        const resultSet = await this.executeSql(
            'INSERT INTO package (packageBarcode, shelfBarcode, user_id) VALUES (?, ?, ?);',
            [barcode, shelfBarcode, recipientId]
        );
        return {
            id: resultSet.insertId,
            barcode,
            shelfBarcode,
            checkInDate: new Date(),
            recipientId
        };
    }

    public async getParcelByBarcode(barcode: string): Promise<Parcel | null> {
        const resultSet = await this.executeSql(
            `SELECT package_id as id, packageBarcode as barcode, shelfBarcode, user_id as recipientId FROM Package WHERE packageBarcode = ?;`,
            [barcode]
        );
        if (!resultSet) {
            return null;
        }

        return resultSet.rows.item(0);
    }

    public async getAllParcels(): Promise<Parcel[]> {
        //TODO: Add checkout person
        const resultSet = await this.executeSql(
            'SELECT package_id as id, packageBarcode as barcode, shelfBarcode, user_id as recipientId FROM Package'
        );
        if (!resultSet) {
            return [];
        }
        const parcels: Parcel[] = [];
        for (let i = 0; i < resultSet.rows.length; i++) {
            const row = resultSet.rows.item(i);
            const { id, barcode, shelfBarcode, recipientId } = row;
            parcels.push({
                id,
                barcode,
                shelfBarcode,
                recipientId,
                //TODO: To be fixed
                checkInDate: new Date()
            });
        }
        return parcels;
    }

    public async updateParcel(parcelBarcode: string, checkoutPerson: string): Promise<void> {
        await this.executeSql('UPDATE PACKAGE SET checkoutPerson = ? WHERE packageBarcode = ?;', [
            checkoutPerson,
            parcelBarcode
        ]);
    }

    private getDatabase(): Promise<SQLite.SQLiteDatabase> {
        return this.database ? Promise.resolve(this.database) : this.open();
    }

    private async executeSql(statement: string, params?: any[]): Promise<SQLite.ResultSet> {
        const db = await this.getDatabase();
        const [resultSet] = await db.executeSql(statement, params);
        return resultSet;
    }
}

// Export a single instance of DatabaseImpl
export const database: Database = new DatabaseImpl();
