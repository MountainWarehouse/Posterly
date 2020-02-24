import React, { useState } from 'react';
import Scanner from '../views/Scanner';
import { View, Button, Text, Icon, Item, Input } from 'native-base';
import styles from '../../_shared/Styles';
import { NavigationStackScreenComponent } from 'react-navigation-stack';
import db from '../../database/Db';
import Screen from '../../navigation/Screen';
import { ParcelInfoParams } from './ParcelInfo';

const Home: NavigationStackScreenComponent = ({ navigation }) => {
    const [search, setSearch] = useState('');

    const browseParcels = (search: string) => navigation.navigate(Screen.ParcelBrowser, { search });

    const handleScanParcel = async (barcode: string) => {
        let parcel = await db.findParcel(barcode);

        //TODO: Refactor to load all parcels here or upper?
        if (parcel) return navigation.navigate(parcel.checkOutPerson ? Screen.ParcelInfo : Screen.CheckOut, { parcel });

        parcel = {
            barcode,
            checkInDate: new Date(),
            notificationCount: 0,
            recipientRecordID: ''
        };
        const params: ParcelInfoParams = { parcel };
        return navigation.navigate(Screen.ContactSelection, params);
    };

    return (
        <View padder>
            <Scanner tip="Scan barcode of a parcel to check in or out" onScan={handleScanParcel} />

            <Text style={{ marginTop: 25 }}>Search parcel by its barcode or recipient name</Text>
            <Item style={{ marginVertical: 5 }}>
                <Icon name="md-search" />
                <Input
                    placeholder="Search"
                    onChangeText={setSearch}
                    value={search}
                    onEndEditing={() => browseParcels(search)}
                />
            </Item>
            <Text style={{ marginTop: 25 }}>Browse all registered parcels</Text>
            <Button block bordered iconLeft style={styles.button} onPress={() => browseParcels('')}>
                <Icon name="md-list-box" type="Ionicons" />
                <Text>Browse Parcels</Text>
            </Button>
        </View>
    );
};

Home.navigationOptions = { title: 'Scan Parcel' };

export default Home;
