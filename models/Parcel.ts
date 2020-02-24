import { DisplayContact } from './DisplayContact';
import { Operator } from './Operator';

export interface Parcel {
    barcode: string;
    recipientRecordID: string;
    recipient?: DisplayContact;
    checkInDate: Date;
    shelfBarcode?: string;
    checkOutDate?: Date;
    checkOutPerson?: string;
    notificationCount: number;
    operator?: Operator;
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
        notificationCount: 'int',
        operator: 'string?'
    }
};
