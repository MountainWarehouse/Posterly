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
    createParcel(parcel: Parcel): Promise<Parcel>;
    getParcelByBarcode(barcode: string): Promise<Parcel | null>;
    getAllParcels(): Promise<Parcel[]>;
    updateParcel(parcel: Parcel): Promise<void>;
    //todo getParcelByRecipient
}

class DatabaseImpl implements Database {
    private databaseName = 'AppDatabase.db';
    private database: SQLite.SQLiteDatabase | undefined;

    public async open(): Promise<SQLite.SQLiteDatabase> {
        SQLite.DEBUG(true);
        SQLite.enablePromise(true);
        const db = await SQLite.openDatabase({
            name: this.databaseName,
            location: 'default'
        });

        // Perform any database initialization or updates, if needed
        const databaseInitialization = new DatabaseInitialization();
        await databaseInitialization.updateDatabaseTables(db);
        this.database = db;
        return db;
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
        const resultSet = await this.executeSql(`INSERT INTO Recipient (name, email) VALUES (?,?);`, [name, email]);
        return { id: resultSet.insertId, name, email };
    }

    public async getRecipientById(id: number): Promise<Recipient | null> {
        const resultSet = await this.executeSql('SELECT * FROM Recipient WHERE id = ?;', [id]);

        if (resultSet && resultSet.rows.length === 1) {
            return resultSet.rows.item(0);
        }

        return null;
    }

    // Get an array of all the lists in the database
    public async getAllRecipients(): Promise<Recipient[]> {
        const resultSet = await this.executeSql('SELECT * FROM Recipient;');
        if (!resultSet) {
            return [];
        }
        const recipients: Recipient[] = [];
        for (let i = 0; i < resultSet.rows.length; i++) {
            const recipient = resultSet.rows.item(i);
            recipients.push(recipient);
        }
        return recipients;
    }

    public async createParcel(parcel: Parcel): Promise<Parcel> {
        const resultSet = await this.executeSql(
            `INSERT INTO Parcel (barcode, checkInDate, shelfBarcode, checkOutPerson, checkOutDate, recipientId) 
                VALUES (?, ?, ?, ?, ?, ?);`,
            [
                parcel.barcode,
                parcel.checkInDate.getTime(),
                parcel.shelfBarcode,
                parcel.checkOutPerson,
                parcel.checkOutDate?.getTime(),
                parcel.recipientId
            ]
        );

        const createdParcel = { ...parcel };
        createdParcel.id = resultSet.insertId;
        return createdParcel;
    }

    public async getParcelByBarcode(barcode: string): Promise<Parcel | null> {
        const resultSet = await this.executeSql(`SELECT * FROM Parcel WHERE barcode = ?;`, [barcode]);

        if (resultSet && resultSet.rows && resultSet.rows.length === 1) {
            return this.parcelFromDbRow(resultSet.rows.item(0));
        }

        return null;
    }

    private parcelFromDbRow = (parcelRow: any): Parcel => {
        const { id, barcode, checkInDate, shelfBarcode, checkOutPerson, checkOutDate, recipientId } = parcelRow;
        const parcel: Parcel = {
            id,
            barcode,
            checkInDate: new Date(checkInDate),
            shelfBarcode,
            checkOutPerson,
            checkOutDate: checkOutDate ? new Date(checkOutDate) : undefined,
            recipientId
        };

        return parcel;
    };

    public async getAllParcels(): Promise<Parcel[]> {
        //TODO: Add recipient
        const resultSet = await this.executeSql('SELECT * FROM Parcel;');
        if (!resultSet) {
            return [];
        }
        const parcels: Parcel[] = [];
        for (let i = 0; i < resultSet.rows.length; i++) {
            const parcel = this.parcelFromDbRow(resultSet.rows.item(i));
            parcels.push(parcel);
        }
        return parcels;
    }

    public async updateParcel(parcel: Parcel): Promise<void> {
        this.executeSql(
            `UPDATE Parcel
                SET
                    barcode = ?, 
                    checkInDate = ?, 
                    shelfBarcode = ?, 
                    checkOutPerson = ?, 
                    checkOutDate = ?, 
                    recipientId = ?
                WHERE id = ?;`,
            [
                parcel.barcode,
                parcel.checkInDate.getTime(),
                parcel.shelfBarcode,
                parcel.checkOutPerson,
                parcel.checkOutDate?.getTime(),
                parcel.recipientId,
                parcel.id
            ]
        );
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
