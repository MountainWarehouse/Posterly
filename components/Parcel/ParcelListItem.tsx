import React from 'react';
import { Text, ListItem, Body, Left, Right, Button, Icon } from 'native-base';
import { Parcel } from '../../models/Parcel';
import ParcelIcon from './ParcelIcon';
export interface ParcelListItemProps {
    parcel: Parcel;
    hideRecipient?: boolean;
    onSelect: () => void;
    onRemind: () => void;
}

const ParcelListItem: React.SFC<ParcelListItemProps> = ({ parcel, hideRecipient, onSelect, onRemind }) => {
    const isCheckedOut = !!parcel.checkOutPerson;
    return (
        <ListItem avatar onPress={onSelect}>
            <Left>
                <ParcelIcon checkedOut={isCheckedOut} size={20} />
            </Left>
            <Body>
                {!hideRecipient && <Text>For: {parcel.recipient?.name}</Text>}
                <Text>No: {parcel.barcode}</Text>
                <Text note>{parcel.checkInDate.toLocaleDateString()}</Text>
                {parcel.shelfBarcode && <Text note>Shelf: {parcel.shelfBarcode}</Text>}
            </Body>
            <Right>
                {isCheckedOut ? (
                    <React.Fragment>
                        {parcel.checkOutDate && <Text note>Collected: {parcel.checkOutDate.toLocaleDateString()}</Text>}
                        <Text note>By: {parcel.checkOutPerson}</Text>
                    </React.Fragment>
                ) : (
                    <Button iconLeft rounded info onPress={onRemind}>
                        <Icon name="md-mail" />
                        <Text>Remind</Text>
                    </Button>
                )}
            </Right>
        </ListItem>
    );
};

export default ParcelListItem;
