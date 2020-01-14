import React from 'react';
import { Content, Text } from 'native-base';
import { Package } from '../models/package';
import { User } from '../models/user';
import { TextField } from 'react-native-material-textfield';
import styles from '../_shared/styles';

export interface SummaryProps {
    parcel: Package;
    user: User;
    tip?: string;
}

const Summary: React.SFC<SummaryProps> = ({ parcel, user, tip }) => {
    return (
        <Content padder>
            <TextField label="Parcel No" value={parcel.ParcelBarcode} editable={false} />
            <TextField label="Recipient Name" value={user.UserName} editable={false} />
            <TextField label="Recipient Email" value={user.UserEmail} editable={false} />
            {parcel.ShelfBarcode !== '0' && <TextField label="Shelf No" value={parcel.ShelfBarcode} editable={false} />}
            {tip && <Text style={styles.tip}>{tip}</Text>}
        </Content>
    );
};

export default Summary;
