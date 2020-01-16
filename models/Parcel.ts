export interface Parcel {
    id: number;
    barcode: string;
    recipientId: number;
    checkInDate: Date;
    shelfBarcode?: string;
    checkOutDate?: Date;
    checkOutPerson?: string;
}
