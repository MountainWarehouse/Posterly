import React from 'react';
import { View } from 'native-base';
import { Parcel } from '../../../models/Parcel';
import { TextField } from 'react-native-material-textfield';
import ParcelOperator from '../../../utils/ParcelOperator';
import { Operator } from '../../../models/Operator';
import { Dropdown } from 'react-native-material-dropdown';

export interface ParcelViewProps {
    parcel: Parcel;
    checkIn?: boolean;
    onChangeCheckoutPerson?: (checkoutPerson: string) => void;
    onChangeOperator?: (operator: Operator) => void;
}

const ParcelView: React.SFC<ParcelViewProps> = ({ parcel, checkIn, onChangeCheckoutPerson, onChangeOperator }) => {
    const { barcode, recipient } = parcel;
    const recipientPlaceholder = !recipient ? '(not found)' : undefined;

    const consigmentNo = ParcelOperator.getConsignmentNo(parcel);

    return (
        <View>
            <TextField label="Parcel No" value={barcode} editable={false} />
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
            {checkIn ? (
                <React.Fragment>
                    <Dropdown
                        label="Operator"
                        value="Select Operator"
                        data={Object.keys(Operator).map(o => ({ value: o }))}
                        onChangeText={onChangeOperator}
                    />
                    <TextField
                        label="Consignment No"
                        placeholder={barcode}
                        defaultValue={consigmentNo}
                        editable={false}
                    />
                </React.Fragment>
            ) : (
                <React.Fragment>
                    <TextField
                        label="Operator"
                        value={parcel.operator ? parcel.operator : Operator.Other}
                        editable={false}
                    />
                    <TextField label="Consignment No" value={consigmentNo ? consigmentNo : barcode} editable={false} />
                    <TextField label="Checked In" value={parcel.checkInDate.toLocaleDateString()} editable={false} />
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
