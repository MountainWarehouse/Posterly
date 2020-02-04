import React from 'react';
import { View, Text, NativeBase } from 'native-base';
import { Parcel } from '../../models/Parcel';
import { TextField } from 'react-native-material-textfield';

export interface SummaryProps extends NativeBase.View {
    parcel: Parcel;
    tip?: string;
}

const Summary: React.SFC<SummaryProps> = ({ parcel, tip, ...rest }) => {
    return (
        <View {...rest}>
            <TextField label="Parcel No" value={parcel.barcode} editable={false} />
            <TextField label="Recipient Name" value={parcel.recipient.name} editable={false} />
            <TextField label="Recipient Email" value={parcel.recipient.email} editable={false} />
            {parcel.shelfBarcode && <TextField label="Shelf No" value={parcel.shelfBarcode} editable={false} />}
            {tip && <Text note>{tip}</Text>}
        </View>
    );
};

export default Summary;
