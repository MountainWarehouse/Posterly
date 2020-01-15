import SQLite from 'react-native-sqlite-storage';

import { Parcel } from '../models/Parcel';
import { Recipient } from '../models/Recipient';
import { DatabaseInitialization } from './DatabaseInitialization';

export interface Database {
    open(): Promise<SQLite.SQLiteDatabase>;
    close(): Promise<void>;
    createRecipient(name: string, email: string): Promise<Recipient>;
    getRecipientById(id: number): Promise<Recipient[]>;
    getAllRecipients(): Promise<Recipient[]>;
    createParcel(
        parcelBarcode: string,
        shelfBarcode: string,
        recipient: Recipient,
        checkoutPerson: string
    ): Promise<Parcel>;
    getParcelByBarcode(barcode: string): Promise<Parcel[]>;
    getAllParcels(): Promise<Parcel[]>;
    updateParcel(barcode: string, checkoutPerson: string): Promise<void>;
    //todo getPackageByRecipient
}

class DatabaseImpl implements Database {
    private databaseName = 'AppDatabase.db';
    private database: SQLite.SQLiteDatabase | undefined;

    // Open the connection to the database
    public open(): Promise<SQLite.SQLiteDatabase> {
        SQLite.DEBUG(true);
        SQLite.enablePromise(true);
        let databaseInstance: SQLite.SQLiteDatabase;

        return SQLite.openDatabase({
            name: this.databaseName,
            location: 'default'
        })
            .then(db => {
                databaseInstance = db;

                // Perform any database initialization or updates, if needed
                const databaseInitialization = new DatabaseInitialization();
                return databaseInitialization.updateDatabaseTables(databaseInstance);
            })
            .then(() => {
                this.database = databaseInstance;
                return databaseInstance;
            });
    }

    // Close the connection to the database
    public close(): Promise<void> {
        if (this.database === undefined) {
            return Promise.reject('[db] Database was not open; unable to close.');
        }
        return this.database.close().then(status => {
            this.database = undefined;
        });
    }

    // Insert a new list into the database
    public createRecipient(name: string, email: string): Promise<Recipient> {
        return this.getDatabase()
            .then(db => db.executeSql('INSERT INTO User (userName,userEmail) VALUES (?,?);', [name, email]))
            .then(([results]) => {
                const { insertId } = results;
                return new Recipient(name, email, insertId);
            });
    }

    public getRecipientById(id: number): Promise<Recipient[]> {
        return this.getDatabase()
            .then(db =>
                // Get all the lists, ordered by newest lists first
                db.executeSql('SELECT user_id as id, userName as name, UserEmail as email FROM User WHERE id = ?;', [
                    id
                ])
            )
            .then(([results]) => {
                if (results === undefined) {
                    return [];
                }
                const count = results.rows.length;
                const users: Recipient[] = [];
                for (let i = 0; i < count; i++) {
                    const row = results.rows.item(i);
                    const { name, email } = row;
                    users.push(new Recipient(name, email, id));
                }
                return users;
            });
    }

    // Get an array of all the lists in the database
    public getAllRecipients(): Promise<Recipient[]> {
        return this.getDatabase()
            .then(db =>
                // Get all the lists, ordered by newest lists first
                db.executeSql('SELECT user_id as id, userName as name, UserEmail as email FROM User ORDER BY id DESC;')
            )
            .then(([results]) => {
                if (results === undefined) {
                    return [];
                }
                const count = results.rows.length;
                const users: Recipient[] = [];
                for (let i = 0; i < count; i++) {
                    const row = results.rows.item(i);
                    const { name, email, id } = row;
                    users.push(new Recipient(name, email, id));
                }
                return users;
            });
    }

    public createParcel(
        packageBarcode: string,
        shelfBarcode: string,
        recipient: Recipient,
        checkoutPerson: string
    ): Promise<Parcel> {
        return this.getDatabase()
            .then(db =>
                db.executeSql(
                    'INSERT INTO package (packageBarcode,shelfBarcode,checkoutPerson, user_id) VALUES (?, ?, ?, ?);',
                    [packageBarcode, shelfBarcode, checkoutPerson, recipient.id]
                )
            )
            .then(([results]) => {
                return new Parcel(packageBarcode, results.insertId, shelfBarcode, recipient.id);
            });
    }

    public getParcelByBarcode(packageBarcode: string): Promise<Parcel[]> {
        return this.getDatabase()
            .then(db =>
                db.executeSql(
                    `SELECT package_id as id,packageBarcode,shelfBarcode, user_id FROM Package WHERE packageBarcode = ?;`,
                    [packageBarcode]
                )
            )
            .then(([results]) => {
                if (results === undefined) {
                    return [];
                }
                const count = results.rows.length;
                const packages: Parcel[] = [];
                for (let i = 0; i < count; i++) {
                    const row = results.rows.item(i);
                    const { package_id, packageBarcode, shelfBarcode, user_id } = row;
                    packages.push(new Parcel(packageBarcode, package_id, shelfBarcode, user_id));
                }
                return packages;
            });
    }

    public async getAllParcels(): Promise<Parcel[]> {
        //TODO: Add checkout person
        const db = await this.getDatabase();
        const [results] = await db.executeSql(
            'SELECT package_id as id, packageBarcode, shelfBarcode, user_id FROM Package'
        );
        if (!results) {
            return [];
        }
        const packages: Parcel[] = [];
        for (let i = 0; i < results.rows.length; i++) {
            const row = results.rows.item(i);
            const { package_id, packageBarcode, shelfBarcode, user_id } = row;
            packages.push(new Parcel(packageBarcode, package_id, shelfBarcode, user_id));
        }
        return packages;
    }

    public updateParcel(packageBarcode: string, checkoutPerson: string): Promise<void> {
        return this.getDatabase()
            .then(db =>
                db.executeSql(`UPDATE PACKAGE SET checkoutPerson = ? WHERE packageBarcode = ?;`, [
                    checkoutPerson,
                    packageBarcode
                ])
            )
            .then(() => {
                return;
            });
    }

    /*   public updateListItem(listItem: ListItem): Promise<void> {
        const doneNumber = listItem.done ? 1 : 0;
        return this.getDatabase()
          .then(db =>
            db.executeSql(
              "UPDATE ListItem SET text = ?, done = ? WHERE item_id = ?;",
              [listItem.text, doneNumber, listItem.id]
            )
          )
          .then(([results]) => {
                      });
      }
    
      public deleteList(list: List): Promise<void> {
        console.log(
          `[db] Deleting list titled: "${list.title}" with id: ${list.id}`
        );
        return this.getDatabase()
          .then(db => {
            // Delete list items first, then delete the list itself
            return db
              .executeSql("DELETE FROM ListItem WHERE list_id = ?;", [list.id])
              .then(() => db);
          })
          .then(db =>
            db.executeSql("DELETE FROM List WHERE list_id = ?;", [list.id])
          )
          .then(() => {
                        return;
          });
      } */

    private getDatabase(): Promise<SQLite.SQLiteDatabase> {
        if (this.database !== undefined) {
            return Promise.resolve(this.database);
        }
        // otherwise: open the database first
        return this.open();
    }
}

// Export a single instance of DatabaseImpl
export const database: Database = new DatabaseImpl();
