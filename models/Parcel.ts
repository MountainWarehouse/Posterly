import { Recipient } from './Recipient';

export interface Parcel {
    id: number;
    barcode: string;
    recipientId: number;
    recipient?: Recipient;
    checkInDate: Date;
    shelfBarcode?: string;
    checkOutDate?: Date;
    checkOutPerson?: string;
}
