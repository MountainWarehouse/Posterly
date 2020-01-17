import SQLite from 'react-native-sqlite-storage';

export class DatabaseInitialization {
    // Perform any updates to the database schema. These can occur during initial configuration, or after an app store update.
    // This should be called each time the database is opened.
    public async updateDatabaseTables(database: SQLite.SQLiteDatabase): Promise<void> {
        const dbVersion = await this.getDatabaseVersion(database);

        if (dbVersion === 0) {
            await database.transaction(this.createTables);
        }

        if (dbVersion < 1) {
            await database.transaction(this.preVersion1Inserts);
        }
    }

    // Perform initial setup of the database tables
    private createTables(transaction: SQLite.Transaction) {
        // USER table
        transaction.executeSql(
            'CREATE TABLE IF NOT EXISTS User( ' +
                'user_id INTEGER PRIMARY KEY NOT NULL, ' +
                'userName TEXT, ' +
                'userEmail TEXT ' +
                ');'
        );

        // PACKAGE table
        transaction.executeSql(
            'CREATE TABLE IF NOT EXISTS Package( ' +
                'package_id INTEGER PRIMARY KEY NOT NULL, ' +
                'packageBarcode TEXT, ' +
                'shelfBarcode TEXT, ' +
                'checkoutPerson TEXT, ' +
                'user_id INTEGER, ' +
                'FOREIGN KEY ( user_id ) REFERENCES User ( user_id )' +
                ');'
        );

        // Version table
        transaction.executeSql(
            'CREATE TABLE IF NOT EXISTS Version( ' +
                'version_id INTEGER PRIMARY KEY NOT NULL, ' +
                'version INTEGER' +
                ');'
        );
    }

    // Get the version of the database, as specified in the Version table
    private async getDatabaseVersion(database: SQLite.SQLiteDatabase): Promise<number> {
        // Select the highest version number from the version table
        try {
            const [results] = await database.executeSql('SELECT version FROM Version ORDER BY version DESC LIMIT 1;');
            if (results.rows && results.rows.length > 0) {
                const version = results.rows.item(0).version;
                return version;
            } else {
                return 0;
            }
        } catch {
            return 0;
        }
    }

    // This function should be called when the version of the db is < 1
    private async preVersion1Inserts(transaction: SQLite.Transaction) {
        // Make schema changes
        transaction.executeSql(
            `CREATE TABLE IF NOT EXISTS Recipient( 
                id INTEGER PRIMARY KEY NOT NULL, 
                name TEXT NOT NULL, 
                email TEXT NOT NULL
            );`
        );

        transaction.executeSql(
            `INSERT INTO Recipient (id, name, email)
                SELECT user_id, userName, userEmail
                FROM User
                WHERE userName IS NOT NULL AND userEmail IS NOT NULL;`
        );

        transaction.executeSql(
            `CREATE TABLE IF NOT EXISTS Parcel(
                id INTEGER PRIMARY KEY NOT NULL, 
                barcode TEXT NOT NULL UNIQUE, 
                checkInDate INTEGER NOT NULL,
                shelfBarcode TEXT, 
                checkOutPerson TEXT, 
                checkOutDate INTEGER,
                recipientId INTEGER NOT NULL, 
                FOREIGN KEY (recipientId) REFERENCES Recipient (id)  
            );`
        );

        transaction.executeSql(
            `INSERT INTO Parcel(id, barcode, shelfBarcode, checkOutPerson, recipientId, checkInDate)
                SELECT package_id, packageBarcode, shelfBarcode, checkoutPerson, user_id, 0
                FROM Package
                WHERE user_id IS NOT NULL AND packageBarcode IS NOT NULL;`
        );

        transaction.executeSql('DROP TABLE Package;');
        transaction.executeSql('DROP TABLE User;');

        // Update the database version
        transaction.executeSql('INSERT INTO Version (version) VALUES (1);');
    }
}
