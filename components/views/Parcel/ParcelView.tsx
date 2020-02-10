import React from 'react';
import { View, Picker, Item, Text } from 'native-base';
import { Parcel } from '../../../models/Parcel';
import { TextField } from 'react-native-material-textfield';
import ParcelOperator from '../../../utils/ParcelOperator';
import { Operator } from '../../../models/Operator';

export interface ParcelViewProps {
    parcel: Parcel;
    checkIn?: boolean;
    onChangeCheckoutPerson?: (checkoutPerson: string) => void;
    onChangeOperator?: (operator: Operator) => void;
}

const ParcelView: React.SFC<ParcelViewProps> = ({ parcel, checkIn, onChangeCheckoutPerson, onChangeOperator }) => {
    const { barcode, recipient } = parcel;
    const recipientPlaceholder = !recipient ? '(not found)' : undefined;
    const consignmentNo = ParcelOperator.getConsignmentNo(parcel);

    return (
        <View>
            <TextField label="Parcel No" value={barcode} editable={false} />
            <Text style={{ color: '#9c9c9c', fontSize: 12 }}>Operator</Text>
            <Item picker>
                <Picker
                    mode="dropdown"
                    selectedValue={parcel.operator}
                    onValueChange={onChangeOperator}
                    enabled={!!checkIn}
                >
                    <Picker.Item
                        label={checkIn ? 'Select Operator' : Operator.Other}
                        value=""
                        color={checkIn ? '#9c9c9c' : ''}
                    />
                    {Object.keys(Operator).map(o => (
                        <Picker.Item key={o} label={o} value={o} />
                    ))}
                </Picker>
            </Item>
            <TextField
                label="Consignment No"
                placeholder={barcode}
                defaultValue={consignmentNo}
                value={consignmentNo}
                editable={false}
            />
            {!checkIn && (
                <TextField label="Checked In" value={parcel.checkInDate.toLocaleDateString()} editable={false} />
            )}

            <TextField
                label="Recipient Name"
                value={recipient?.displayName}
                defaultValue={recipient?.displayName}
                editable={false}
                placeholder={recipientPlaceholder}
            />
            <TextField
                label="Recipient Email"
                value={recipient?.emailsText}
                defaultValue={recipient?.emailsText}
                editable={false}
                placeholder={recipientPlaceholder}
            />
            {parcel.shelfBarcode && <TextField label="Shelf No" value={parcel.shelfBarcode} editable={false} />}
            {!checkIn && (
                <React.Fragment>
                    {onChangeCheckoutPerson && (
                        <TextField
                            label="Notification sent"
                            value={
                                parcel.notificationCount === 1
                                    ? 'Yes'
                                    : parcel.notificationCount > 1
                                    ? 'More than once'
                                    : 'No'
                            }
                            editable={false}
                        />
                    )}

                    {parcel.checkOutDate && (
                        <TextField
                            label="Checked Out"
                            value={parcel.checkOutDate.toLocaleDateString()}
                            editable={false}
                        />
                    )}
                    <TextField
                        label="Person collecting parcel"
                        onChangeText={onChangeCheckoutPerson}
                        placeholder="Type name of the person"
                        value={parcel.checkOutPerson ? parcel.checkOutPerson : ''}
                        editable={!!onChangeCheckoutPerson}
                    />
                </React.Fragment>
            )}
        </View>
    );
};

export default ParcelView;
