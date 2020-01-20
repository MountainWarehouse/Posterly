import React, { useState, useEffect } from 'react';
import {
    Content,
    Text,
    List,
    ListItem,
    Icon,
    Body,
    Item,
    Input,
    NativeBase,
    Left,
    Spinner,
    Right,
    Picker,
    View
} from 'native-base';
import { Parcel } from '../models/Parcel';
import { database } from '../database/Database';

enum Show {
    All,
    In,
    Out
}

export interface ParcelBrowserProps extends NativeBase.Content {}

const ParcelBrowser: React.SFC<ParcelBrowserProps> = ({ ...rest }) => {
    const [search, setSearch] = useState('');
    const [isLoadingParcels, setIsLoadingParcels] = useState(true);
    const [parcels, setParcels] = useState([] as Parcel[]);
    const [show, setShow] = useState(Show.All);

    useEffect(() => {
        database.getAllParcels(true).then(parcels => {
            setParcels(parcels);
            setIsLoadingParcels(false);
        });
    }, []);

    const lowerSearch = search.toLowerCase();

    const isCheckedOut = (parcel: Parcel): boolean => (parcel.checkOutPerson ? true : false);

    const filteredParcels = parcels.filter(parcel => {
        const shouldBeShown =
            show === Show.All ||
            (show === Show.Out && isCheckedOut(parcel)) ||
            (show === Show.In && !isCheckedOut(parcel));
        const searchResult =
            parcel.barcode.toLowerCase().includes(lowerSearch) ||
            parcel.recipient?.name.toLocaleLowerCase().includes(lowerSearch);

        return shouldBeShown && searchResult;
    });

    const parcelIcon = (isCheckedOut: boolean) => (
        <Icon
            name={isCheckedOut ? 'package-variant' : 'package-variant-closed'}
            style={{ color: isCheckedOut ? '#27a844' : '#17a2b7' }}
            type="MaterialCommunityIcons"
        />
    );

    if (isLoadingParcels) return <Spinner color="blue" />;

    return (
        //TODO: Group by recipient?
        <Content {...rest}>
            <Item>
                <Text>Show: </Text>
                {show === Show.All ? (
                    <Icon name="package-variant-closed" style={{ color: 'lightgrey' }} type="MaterialCommunityIcons" />
                ) : (
                    parcelIcon(show === Show.Out)
                )}
                <Picker mode="dropdown" selectedValue={show} onValueChange={setShow}>
                    <Picker.Item label="All" value={Show.All} />
                    <Picker.Item label="Checked In" value={Show.In} />
                    <Picker.Item label="Checked Out" value={Show.Out} />
                </Picker>
            </Item>
            <Item>
                <Icon name="md-search" />
                <Input placeholder="Search" onChangeText={setSearch} />
            </Item>
            <List
                dataArray={filteredParcels}
                keyExtractor={(parcel: Parcel) => parcel.id.toString()}
                renderRow={(parcel: Parcel) => (
                    <ListItem avatar>
                        <Left>{parcelIcon(parcel.checkOutPerson ? true : false)}</Left>
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
