import React from 'react';
import { View } from 'native-base';
import { Parcel } from '../../../models/Parcel';
import { TextField } from 'react-native-material-textfield';

export interface ParcelViewProps {
    parcel: Parcel;
    checkIn?: boolean;
    onChangeCheckoutPerson?: (checkoutPerson: string) => void;
}

const ParcelView: React.SFC<ParcelViewProps> = ({ parcel, checkIn, onChangeCheckoutPerson }) => {
    const { recipient } = parcel;
    const recipientPlaceholder = !recipient ? '(not found)' : undefined;

    return (
        <View>
            <TextField label="Parcel No" value={parcel.barcode} editable={false} />
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
