import { Recipient } from './Recipient';

export interface Parcel {
    barcode: string;
    recipient: Recipient;
    checkInDate: Date;
    shelfBarcode?: string;
    checkOutDate?: Date;
    checkOutPerson?: string;
}

export const parcelSchema = {
    name: 'Parcel',
    primaryKey: 'barcode',
    properties: {
        barcode: { type: 'string', indexed: true },
        recipient: 'Recipient',
        checkInDate: 'date',
        shelfBarcode: 'string?',
        checkOutDate: 'date?',
        checkOutPerson: 'string?'
    }
};
