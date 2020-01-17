import React, { useState, useEffect } from 'react';
import { Content, Text, List, ListItem, Icon, Body, Item, Input, NativeBase, Left, Spinner, Right } from 'native-base';
import { Parcel } from '../models/Parcel';
import { database } from '../database/Database';

export interface ParcelBrowserProps extends NativeBase.Content {}

const ParcelBrowser: React.SFC<ParcelBrowserProps> = ({ ...rest }) => {
    const [search, setSearch] = useState('');
    const [isLoadingParcels, setIsLoadingParcels] = useState(true);
    const [parcels, setParcels] = useState([] as Parcel[]);

    useEffect(() => {
        database.getAllParcels(true).then(parcels => {
            setParcels(parcels);
            setIsLoadingParcels(false);
        });
    }, []);

    const lowerSearch = search.toLowerCase();

    const filteredParcels = parcels.filter(
        parcel =>
            (parcel.barcode && parcel.barcode.toLowerCase().includes(lowerSearch)) ||
            parcel.recipient?.name.includes(lowerSearch)
    );

    if (isLoadingParcels) return <Spinner color="blue" />;

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
                                style={{ color: parcel.checkOutPerson ? 'green' : 'grey', fontSize: 20 }}
                                type="MaterialCommunityIcons"
                            />
                        </Left>
                        <Body>
                            <Text>No: {parcel.barcode}</Text>
                            <Text>For: {parcel.recipient?.name}</Text>
                            <Text note>{parcel.checkInDate.toLocaleDateString()}</Text>
                            {parcel.shelfBarcode && <Text note>Shelf: {parcel.shelfBarcode}</Text>}
                        </Body>
                        <Right>
                            {parcel.checkOutDate && (
                                <Text note>Collected: {parcel.checkOutDate.toLocaleDateString()}</Text>
                            )}
                            {parcel.checkOutPerson ? <Text note>By: {parcel.checkOutPerson}</Text> : null}
                        </Right>
                    </ListItem>
                )}
            />
        </Content>
    );
};

export default ParcelBrowser;
