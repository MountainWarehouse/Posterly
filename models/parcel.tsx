import { User } from "./user";

export class Parcel {
    ParcelBarcode: string;
    ParcelId: number;
    User_Id: number;
    ActionDate: Date;
    ShelfBarcode: string;
    CheckoutDate: Date;
    CheckoutPerson: string;

    public constructor(parcelBarcode: string, parcelId: number = 0, shelfBarcode: string = "0", userId: number = 0) {
        this.ParcelBarcode = parcelBarcode;
        this.ParcelId = parcelId;
        this.ShelfBarcode = shelfBarcode;
        this.User_Id = userId;
    }
}
