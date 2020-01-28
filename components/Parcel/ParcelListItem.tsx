import React from 'react';
import { Text, ListItem, Body, Left, Right, Button, Icon } from 'native-base';
import { Parcel } from '../../models/Parcel';
import ParcelIcon from './ParcelIcon';
export interface ParcelListItemProps {
    parcel: Parcel;
    onSelect: () => void;
    onRemind: () => void;
}

const ParcelListItem: React.SFC<ParcelListItemProps> = ({ parcel, onSelect, onRemind }) => {
    const isCheckedOut = !!parcel.checkOutPerson;
    return (
        <ListItem avatar onPress={onSelect}>
            <Left>
                <ParcelIcon checkedOut={isCheckedOut} size={20} />
            </Left>
            <Body>
                <Text style={{ fontWeight: !isCheckedOut ? 'bold' : 'normal' }}>No: {parcel.barcode}</Text>
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
