import * as React from 'react';
import Scanner from '../views/Scanner';
import { NavigationStackScreenComponent } from 'react-navigation-stack';
import Screen from '../../navigation/Screen';
import { Parcel } from '../../models/Parcel';

export interface ShelfParams {
    parcel: Parcel;
}

const Shelf: NavigationStackScreenComponent<ShelfParams> = ({ navigation }) => {
    const handleScanShelf = (code: string) => {
        const parcel = navigation.getParam('parcel');
        parcel.shelfBarcode = code;
        navigation.navigate(Screen.CheckIn, { parcel });
    };
    return <Scanner tip="Place the parcel on a shelf and scan shelf barcode" onScan={handleScanShelf} />;
};

Shelf.navigationOptions = { title: 'Scan Shelf' };

export default Shelf;
