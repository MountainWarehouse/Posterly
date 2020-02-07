import { DisplayContact } from './DisplayContact';

export interface Parcel {
    barcode: string;
    recipientRecordID: string;
    recipient?: DisplayContact;
    checkInDate: Date;
    shelfBarcode?: string;
    checkOutDate?: Date;
    checkOutPerson?: string;
    notificationCount: number;
}

export const parcelSchema = {
    name: 'Parcel',
    primaryKey: 'barcode',
    properties: {
        barcode: { type: 'string', indexed: true },
        recipientRecordID: 'string',
        checkInDate: 'date',
        shelfBarcode: 'string?',
        checkOutDate: 'date?',
        checkOutPerson: 'string?',
        notificationCount: 'int'
    }
};
