import React, { useState, useEffect } from 'react';
import { Content, Text, List, ListItem, Icon, Body, Item, Input, NativeBase } from 'native-base';
import { Parcel } from '../models/parcel';
import { database } from '../database/database';

export interface ParcelBrowserProps extends NativeBase.Content {}

const ParcelBrowser: React.SFC<ParcelBrowserProps> = ({ ...rest }) => {
    const [search, setSearch] = useState('');
    const [parcels, setParcels] = useState([] as Parcel[]);

    useEffect(() => {
        database.getAllParcels().then(setParcels);
    }, []);

    const lowerSearch = search.toLowerCase();

    const filteredParcels = parcels.filter(
        parcel =>
            (parcel.ParcelBarcode && parcel.ParcelBarcode.toLowerCase().includes(lowerSearch)) ||
            //TODO: Change to user name when available
            parcel.User_Id.toString().includes(lowerSearch)
    );

    return (
        <Content {...rest}>
            <Item style={{ marginVertical: 5 }}>
                <Icon name="md-search" />
                <Input placeholder="Search" onChangeText={setSearch} />
            </Item>
            <List
                dataArray={filteredParcels}
                keyExtractor={(parcel: Parcel) => parcel.ParcelId.toString()}
                renderRow={(parcel: Parcel) => (
                    <ListItem onPress={() => null}>
                        <Body>
                            <Text>{parcel.ParcelId}</Text>
                            <Text>{parcel.ParcelBarcode}</Text>
                            <Text>{parcel.User_Id}</Text>
                            <Text>{parcel.ShelfBarcode}</Text>
                            <Text>Status: //TODO</Text>
                        </Body>
                    </ListItem>
                )}
            />
        </Content>
    );
};

export default ParcelBrowser;
