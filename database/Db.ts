import Realm from 'realm';
import Config from 'react-native-config';
import { Parcel, parcelSchema } from '../models/Parcel';
import Contacts from 'react-native-contacts';
import { PermissionsAndroid, Alert, Permission } from 'react-native';
import { DisplayContact, toDisplayContact } from '../models/DisplayContact';
import { sortArray } from '../utils/ArrayUtil';

class DbManager {
    private realm?: Realm;
    private user?: Realm.Sync.User;

    public async open(): Promise<Realm> {
        const credentials = Realm.Sync.Credentials.usernamePassword(Config.REALM_USER, Config.REALM_PASS, false);
        const user = await Realm.Sync.User.login(`https://${Config.REALM_INSTANCE}`, credentials);
        const config = user.createConfiguration({
            schema: [parcelSchema],
            path: Config.REALM_NAME,
            sync: {
                url: `realms://${Config.REALM_INSTANCE}/${Config.REALM_NAME}`,
                fullSynchronization: true
            }
        });

        const realm = await Realm.open(config);

        this.user = user;
        this.realm = realm;

        return realm;
    }

    public async close() {
        this.user?.logout();
        this.realm?.close();
        this.user = undefined;
        this.realm = undefined;
    }

    public getAllContacts(): Promise<DisplayContact[]> {
        return this.useContacts(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, resolve => {
            Contacts.getAll((err, contacts) => {
                if (err) throw err;
                const displayContacts = contacts.map(toDisplayContact);
                sortArray(displayContacts, c => c.displayName);
                resolve(displayContacts);
            });
        });
    }

    public getContactById(recordID: string): Promise<DisplayContact | undefined> {
        return this.useContacts(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, resolve => {
            Contacts.getContactById(recordID, (err, contact) => {
                if (err) throw err;
                resolve(contact ? toDisplayContact(contact) : undefined);
            });
        });
    }

    public async getAllParcels(): Promise<Parcel[]> {
        const realm = await this.getRealm();
        const contacts = await this.getAllContacts();

        return realm
            .objects<Parcel>(parcelSchema.name)
            .sorted('checkInDate', true)
            .map(pObj => this.extractParcel(pObj, contacts));
    }

    public async findParcel(barcode: string): Promise<Parcel | undefined> {
        const realm = await this.getRealm();
        const parcel = realm.objectForPrimaryKey<Parcel>(parcelSchema.name, barcode);

        if (parcel) {
            parcel.recipient = await this.getContactById(parcel.recipientRecordID);
        }

        return parcel;
    }

    public async createParcel(parcel: Parcel): Promise<Parcel> {
        const realm = await this.getRealm();

        realm.write(() => realm.create(parcelSchema.name, parcel, true));

        return parcel;
    }

    public async updateParcel(parcel: Parcel): Promise<void> {
        const realm = await this.getRealm();

        realm.write(() => realm.create(parcelSchema.name, parcel, true));
    }

    public async updateParcels(parcels: Parcel[]): Promise<void> {
        const realm = await this.getRealm();

        realm.write(() => parcels.forEach(parcel => realm.create(parcelSchema.name, parcel, true)));
    }

    public async restoreRecipient(recordID: string, restoredRecordId: string): Promise<void> {
        const realm = await this.getRealm();

        const parcels = realm.objects<Parcel>(parcelSchema.name).filter(p => p.recipientRecordID === recordID);

        realm.write(() =>
            parcels.forEach(parcel => {
                parcel.recipientRecordID = restoredRecordId;
                realm.create(parcelSchema.name, parcel, true);
            })
        );
    }

    public async deleteParcel(barcode: number): Promise<void> {
        const realm = await this.getRealm();

        const parcel = realm.objectForPrimaryKey(parcelSchema.name, barcode);

        if (!parcel) {
            throw Error(`Cannot delete parcel, barcode '${barcode}' not found.`);
        }

        realm.write(() => realm.delete(parcel));
    }

    private extractParcel(obj: Parcel & Realm.Object, contacts: DisplayContact[]) {
        const parcel = this.extract(obj);
        parcel.recipient = contacts.find(c => c.recordID === parcel.recipientRecordID);
        return parcel;
    }

    private extract<T>(obj: T & Realm.Object) {
        const result = {} as T;
        for (const property of Object.keys(obj) as Array<keyof T>) {
            result[property] = obj[property];
        }
        return result;
    }

    private async getRealm(): Promise<Realm> {
        return this.realm ? this.realm : this.open();
    }

    private async useContacts<T>(
        requiredPermission: Permission,
        executor: (resolve: (value?: T | PromiseLike<T> | undefined) => void, reject: (reason?: any) => void) => void
    ): Promise<T> {
        try {
            PermissionsAndroid.PERMISSIONS;
            const permissionStatus = await PermissionsAndroid.request(requiredPermission);
            if (permissionStatus !== PermissionsAndroid.RESULTS.GRANTED) {
                Alert.alert('You need to give requested permission in order to use this feature.');
                throw Error(`Permission denied: ${requiredPermission}`);
            } else {
                return new Promise(executor);
            }
        } catch (error) {
            throw Error(`Permissions error.\n${error}`);
        }
    }
}

const db = new DbManager();

export default db;
