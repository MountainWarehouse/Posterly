import SQLite from "react-native-sqlite-storage";

import { Package } from "../models/package";
import { User } from "../models/user";
import { DatabaseInitialization } from "./databaseInitialization";

export interface Database {
    open(): Promise<SQLite.SQLiteDatabase>;
    close(): Promise<void>;
    createUser(userName: string, userEmail: string): Promise<User>;
    getUserByUserId(userId: number): Promise<User[]>;
    getAllUsers(): Promise<User[]>;
    createPackage(packageBarcode: string, shelfBarcode: string, user: User, checkoutPerson: string): Promise<Package>;
    getPackageByBarocde(packageBarcode: string): Promise<Package[]>;
    updatePackage(packageBarcode: string, checkoutPerson: string): Promise<void>;
    //todo getPackageByUser

}

class DatabaseImpl implements Database {
    private databaseName = "AppDatabase.db";
    private database: SQLite.SQLiteDatabase | undefined;

    // Open the connection to the database
    public open(): Promise<SQLite.SQLiteDatabase> {
        SQLite.DEBUG(true);
        SQLite.enablePromise(true);
        let databaseInstance: SQLite.SQLiteDatabase;

        return SQLite.openDatabase({
            name: this.databaseName,
            location: "default"
        })
            .then(db => {
                databaseInstance = db;
                console.log("[db] Database open!");

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
            return Promise.reject("[db] Database was not open; unable to close.");
        }
        return this.database.close().then(status => {
            console.log("[db] Database closed.");
            this.database = undefined;
        });
    }

    // Insert a new list into the database
    public createUser(userName: string, userEmail: string): Promise<User> {
        return this.getDatabase()
            .then(db =>
                db.executeSql("INSERT INTO User (userName,userEmail) VALUES (?,?);", [userName, userEmail])
            )
            .then(([results]) => {
                const { insertId } = results;
                console.log(
                    `[db] Added User with name: "${userName}"! InsertId: ${insertId}`
                );
                return new User(userName, userEmail, insertId);
            });
    }

    public getUserByUserId(userId: number): Promise<User[]> {
        console.log("[db] Fetching lists from the db...");
        return this.getDatabase()
            .then(db =>
                // Get all the lists, ordered by newest lists first
                db.executeSql("SELECT user_id as id, userName,UserEmail FROM User WHERE id = ?;", [userId])
            )
            .then(([results]) => {
                if (results === undefined) {
                    return [];
                }
                const count = results.rows.length;
                const users: User[] = [];
                for (let i = 0; i < count; i++) {
                    const row = results.rows.item(i);
                    const { userName, userEmail, userId } = row;
                    console.log(`[db] UserName : ${userName}, id: ${userId}`);
                    users.push(new User(userName, userEmail, userId));
                }
                return users;
            });
    }

  // Get an array of all the lists in the database
  public getAllUsers(): Promise<User[]> {
    console.log("[db] Fetching lists from the db...");
    return this.getDatabase()
      .then(db =>
        // Get all the lists, ordered by newest lists first
        db.executeSql("SELECT user_id as id, userName,UserEmail FROM User ORDER BY id DESC;")
      )
      .then(([results]) => {
        if (results === undefined) {
          return [];
        }
        const count = results.rows.length;
        const users: User[] = [];
        for (let i = 0; i < count; i++) {
          const row = results.rows.item(i);
          const { userName,userEmail, id } = row;
          console.log(`[db] UserName : ${userName}, id: ${id}`);
          users.push(new User( userName,userEmail, id));
        }
        return users;
      });
  }

    public createPackage(packageBarcode: string, shelfBarcode: string, user: User, checkoutPerson: string): Promise<Package> {

        return this.getDatabase()
            .then(db =>
                db.executeSql("INSERT INTO package (packageBarcode,shelfBarcode,checkoutPerson, user_id) VALUES (?, ?, ?, ?);", [
                    packageBarcode, shelfBarcode, checkoutPerson, user.UserId
                ])
            )
            .then(([results]) => {
                return new Package(packageBarcode, results.insertId, shelfBarcode, user.UserId)
            }
            );
    }

    public getPackageByBarocde(packageBarcode: string): Promise<Package[]> {

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
                const packages: Package[] = [];
                for (let i = 0; i < count; i++) {
                    const row = results.rows.item(i);
                    const { package_id, packageBarcode, shelfBarcode, user_id } = row;
                    packages.push(new Package(packageBarcode, package_id, shelfBarcode, user_id))
                }
                return packages;
            });
    }

    public updatePackage(packageBarcode: string, checkoutPerson: string): Promise<void> {

        return this.getDatabase()
            .then(db =>
                db.executeSql(
                    `UPDATE PACKAGE SET checkoutPerson = ?,  WHERE packageBarcode = ?;`,
                    [checkoutPerson, packageBarcode]
                )
            ).then(() => { return })
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
            console.log(`[db] List item with id: ${listItem.id} updated.`);
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
            console.log(`[db] Deleted list titled: "${list.title}"!`);
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