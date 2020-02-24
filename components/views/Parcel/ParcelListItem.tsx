import React from 'react';
import { Text, ListItem, Body, Left, Right, Button, Icon, View } from 'native-base';
import { Parcel } from '../../../models/Parcel';
import ParcelIcon from './ParcelIcon';
import ParcelOperator from '../../../utils/ParcelOperator';
export interface ParcelListItemProps {
    parcel: Parcel;
    onSelect: () => void;
    onNotify: () => void;
}

const ParcelListItem: React.SFC<ParcelListItemProps> = ({ parcel, onSelect, onNotify }) => {
    const isCheckedOut = !!parcel.checkOutPerson;
    return (
        <View style={{ borderColor: 'transparent', borderBottomColor: '#F4F4F4', borderWidth: 1 }}>
            <ListItem noBorder thumbnail onPress={onSelect}>
                <Left>
                    <ParcelIcon checkedOut={isCheckedOut} size={20} />
                </Left>
                <Body>
                    <Text style={{ fontWeight: !isCheckedOut ? 'bold' : 'normal' }}>
                        {parcel.consignmentNo ? parcel.consignmentNo : parcel.barcode}
                    </Text>
                    {parcel.shelfBarcode && <Text note>Shelf: {parcel.shelfBarcode}</Text>}
                </Body>
                <Right>
                    {isCheckedOut ? (
                        <React.Fragment>
                            {parcel.checkOutDate && (
                                <Text note>Collected: {parcel.checkOutDate.toLocaleDateString()}</Text>
                            )}
                            <Text note>By: {parcel.checkOutPerson}</Text>
                        </React.Fragment>
                    ) : (
                        <Button icon rounded info={!!parcel.notificationCount} onPress={onNotify}>
                            <Icon name={parcel.notificationCount ? 'md-mail' : 'md-mail-unread'} />
                        </Button>
                    )}
                </Right>
            </ListItem>
        </View>
    );
};

export default ParcelListItem;
