import React from 'react';
import { Content, Text, NativeBase } from 'native-base';
import { Parcel } from '../models/Parcel';
import { TextField } from 'react-native-material-textfield';

export interface SummaryProps extends NativeBase.Content {
    parcel: Parcel;
    tip?: string;
}

const Summary: React.SFC<SummaryProps> = ({ parcel, tip, ...rest }) => {
    const { recipient } = parcel;
    return (
        <Content {...rest}>
            <TextField label="Parcel No" value={parcel.barcode} editable={false} />
            <TextField label="Recipient Name" value={recipient?.name} editable={false} />
            <TextField label="Recipient Email" value={recipient?.email} editable={false} />
            {parcel.shelfBarcode && <TextField label="Shelf No" value={parcel.shelfBarcode} editable={false} />}
            {tip && <Text note>{tip}</Text>}
        </Content>
    );
};

export default Summary;
