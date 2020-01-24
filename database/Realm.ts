import Realm from 'realm';
import Config from 'react-native-config';
import { Recipient, recipientSchema } from '../models/Recipient';
import { Parcel, parcelSchema } from '../models/Parcel';

class RealmWrapper {
    private realm?: Realm;
    private user?: Realm.Sync.User;

    public async open(): Promise<Realm> {
        const credentials = Realm.Sync.Credentials.usernamePassword(Config.REALM_USER, Config.REALM_PASS, false);
        const user = await Realm.Sync.User.login(`https://${Config.REALM_INSTANCE}`, credentials);
        const config = user.createConfiguration({
            schema: [recipientSchema, parcelSchema],
            deleteRealmIfMigrationNeeded: true,
            path: Config.REALM_NAME,
            sync: {
                url: `realms://${Config.REALM_INSTANCE}/${Config.REALM_NAME}`,
                fullSynchronization: true
            }
        });

        console.log('open realm');
        const realm = await Realm.open(config);
        console.log('realm opened');

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

    public async getAllRecipients(): Promise<Recipient[]> {
        const realm = await this.getRealm();
        return realm
            .objects<Recipient>(recipientSchema.name)
            .sorted('name')
            .map(this.extract);
    }

    public async getAllParcels(): Promise<Parcel[]> {
        const realm = await this.getRealm();
        return realm
            .objects<Parcel>(parcelSchema.name)
            .sorted('checkInDate', true)
            .map(this.extract);
    }

    public async findParcel(barcode: string): Promise<Parcel | null> {
        const realm = await this.getRealm();
        const parcel = realm.objectForPrimaryKey<Parcel>(parcelSchema.name, barcode);

        return parcel ? this.extract<Parcel>(parcel) : null;
    }

    public async createRecipient(name: string, email: string): Promise<Recipient> {
        const realm = await this.getRealm();

        const lastId = realm.objects(recipientSchema.name).max('id') as number | undefined;
        const recipient: Recipient = {
            id: lastId ? lastId + 1 : 1,
            name,
            email
        };

        realm.write(() => realm.create(recipientSchema.name, recipient));

        return recipient;
    }

    public async updateRecipient(recipient: Recipient): Promise<void> {
        const realm = await this.getRealm();

        realm.write(() => realm.create(recipientSchema.name, recipient, true));
    }

    public async deleteRecipient(id: number): Promise<void> {
        const realm = await this.getRealm();

        const recipient = realm.objectForPrimaryKey(recipientSchema.name, id);

        if (!recipient) {
            throw Error(`Cannot delete recipient, id '${id}' not found.`);
        }

        realm.write(() => realm.delete(recipient));
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

    public async deleteParcel(barcode: number): Promise<void> {
        const realm = await this.getRealm();

        const parcel = realm.objectForPrimaryKey(parcelSchema.name, barcode);

        if (!parcel) {
            throw Error(`Cannot delete parcel, barcode '${barcode}' not found.`);
        }

        realm.write(() => realm.delete(parcel));
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
}

const realm = new RealmWrapper();

export default realm;
