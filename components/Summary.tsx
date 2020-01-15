import React from 'react';
import { Content, Text, NativeBase } from 'native-base';
import { Parcel } from '../models/parcel';
import { User } from '../models/user';
import { TextField } from 'react-native-material-textfield';
import styles from '../_shared/styles';

export interface SummaryProps extends NativeBase.Content {
    parcel: Parcel;
    user: User;
    tip?: string;
}

const Summary: React.SFC<SummaryProps> = ({ parcel, user, tip, ...rest }) => {
    return (
        <Content {...rest}>
            <TextField label="Parcel No" value={parcel.ParcelBarcode} editable={false} />
            <TextField label="Recipient Name" value={user.UserName} editable={false} />
            <TextField label="Recipient Email" value={user.UserEmail} editable={false} />
            {parcel.ShelfBarcode !== '0' && <TextField label="Shelf No" value={parcel.ShelfBarcode} editable={false} />}
            {tip && <Text style={styles.tip}>{tip}</Text>}
        </Content>
    );
};

export default Summary;
