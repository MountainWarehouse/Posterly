import React, { useState, useEffect } from 'react';
import { Content, Text, List, ListItem, Icon, Body, Item, Input, NativeBase, Left } from 'native-base';
import { Parcel } from '../models/Parcel';
import { database } from '../database/Database';

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
            (parcel.barcode && parcel.barcode.toLowerCase().includes(lowerSearch)) ||
            //TODO: Change to recipient name when available
            parcel.recipientId.toString().includes(lowerSearch)
    );

    return (
        //TODO: Group by recipient?
        <Content {...rest}>
            <Item style={{ marginVertical: 5 }}>
                <Icon name="md-search" />
                <Input placeholder="Search" onChangeText={setSearch} />
            </Item>
            <List
                dataArray={filteredParcels}
                keyExtractor={(parcel: Parcel) => parcel.id.toString()}
                renderRow={(parcel: Parcel) => (
                    <ListItem avatar>
                        <Left>
                            <Icon
                                name={parcel.checkOutPerson ? 'package-up' : 'package-down'}
                                style={{ color: parcel.checkOutPerson ? 'green' : 'yellow', fontSize: 20 }}
                                type="MaterialCommunityIcons"
                            />
                        </Left>
                        <Body>
                            <Text>Barcode: {parcel.barcode}</Text>
                            <Text>Recipient: {parcel.recipientId}</Text>
                            <Text note>Shelf: {parcel.shelfBarcode}</Text>
                            <Text note>Collected by: {parcel.checkOutPerson}</Text>
                            <Text>
                                Checked In:{' '}
                                {parcel.checkInDate.getFullYear() > 1970
                                    ? parcel.checkInDate.toLocaleDateString()
                                    : 'unknown'}
                            </Text>
                            {parcel.checkOutDate && (
                                <Text>Checked Out: {parcel.checkOutDate.toLocaleDateString()}</Text>
                            )}
                        </Body>
                    </ListItem>
                )}
            />
        </Content>
    );
};

export default ParcelBrowser;
