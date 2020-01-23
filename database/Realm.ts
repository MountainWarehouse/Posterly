import Realm from 'realm';
import { Recipient, recipientSchema } from '../models/Recipient';
import { Parcel, parcelSchema } from '../models/Parcel';

class RealmWrapper {
    private realm?: Realm;

    public async open(): Promise<Realm> {
        const realm = await Realm.open({
            schema: [recipientSchema, parcelSchema]
        });

        this.realm = realm;

        return realm;
    }

    public async close() {
        this.realm?.close();
        this.realm = undefined;
    }

    public getRecipients(query?: string): Promise<Recipient[]> {
        return this.getObjects<Recipient>(recipientSchema.name, query);
    }

    public getParcels(query?: string): Promise<Parcel[]> {
        return this.getObjects<Parcel>(parcelSchema.name, query);
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

    private async getObjects<T>(name: string, query?: string): Promise<T[]> {
        const realm = await this.getRealm();
        let results = realm.objects<T>(name);

        if (query) {
            results = results.filtered(query);
        }

        return results.map<T>(this.extract);
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
