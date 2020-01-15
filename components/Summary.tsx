import React from 'react';
import { Content, Text, NativeBase } from 'native-base';
import { Parcel } from '../models/Parcel';
import { Recipient } from '../models/Recipient';
import { TextField } from 'react-native-material-textfield';
import styles from '../_shared/Styles';

export interface SummaryProps extends NativeBase.Content {
    parcel: Parcel;
    recipient: Recipient;
    tip?: string;
}

const Summary: React.SFC<SummaryProps> = ({ parcel, recipient, tip, ...rest }) => {
    return (
        <Content {...rest}>
            <TextField label="Parcel No" value={parcel.ParcelBarcode} editable={false} />
            <TextField label="Recipient Name" value={recipient.name} editable={false} />
            <TextField label="Recipient Email" value={recipient.email} editable={false} />
            {parcel.ShelfBarcode !== '0' && <TextField label="Shelf No" value={parcel.ShelfBarcode} editable={false} />}
            {tip && <Text style={styles.tip}>{tip}</Text>}
        </Content>
    );
};

export default Summary;
