import React from 'react';
import { Text, ListItem, Body, Left, Right } from 'native-base';
import { Parcel } from '../../models/Parcel';
import ParcelIcon from './ParcelIcon';
export interface ParcelListItemProps {
    parcel: Parcel;
    hideRecipient?: boolean;
    onSelect: () => void;
}

const ParcelListItem: React.SFC<ParcelListItemProps> = ({ parcel, hideRecipient, onSelect }) => {
    return (
        <ListItem avatar onPress={onSelect}>
            <Left>
                <ParcelIcon checkedOut={parcel.checkOutPerson ? true : false} size={20} />
            </Left>
            <Body>
                {!hideRecipient && <Text>For: {parcel.recipient?.name}</Text>}
                <Text>No: {parcel.barcode}</Text>
                <Text note>{parcel.checkInDate.toLocaleDateString()}</Text>
                {parcel.shelfBarcode && <Text note>Shelf: {parcel.shelfBarcode}</Text>}
            </Body>
            <Right>
                {parcel.checkOutDate && <Text note>Collected: {parcel.checkOutDate.toLocaleDateString()}</Text>}
                {parcel.checkOutPerson ? <Text note>By: {parcel.checkOutPerson}</Text> : null}
            </Right>
        </ListItem>
    );
};

export default ParcelListItem;
