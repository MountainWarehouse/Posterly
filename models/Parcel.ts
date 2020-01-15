export class Parcel {
    ParcelBarcode: string;
    ParcelId: number;
    recipientId: number;
    ActionDate: Date;
    ShelfBarcode: string;
    CheckoutDate: Date;
    CheckoutPerson: string;

    public constructor(
        parcelBarcode: string,
        parcelId: number = 0,
        shelfBarcode: string = '0',
        recipientId: number = 0
    ) {
        this.ParcelBarcode = parcelBarcode;
        this.ParcelId = parcelId;
        this.ShelfBarcode = shelfBarcode;
        this.recipientId = recipientId;
    }
}
