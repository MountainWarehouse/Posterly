import React from 'react';
import Summary, { SummaryProps } from './Summary';
import { Content, Text, NativeBase } from 'native-base';
import { TextField } from 'react-native-material-textfield';
import styles from '../_shared/Styles';

export interface CheckOutProps extends SummaryProps, NativeBase.Content {
    onChangeCheckoutPerson: (checkoutPerson: string) => void;
}

const CheckOut: React.SFC<CheckOutProps> = ({ parcel, recipient, tip, onChangeCheckoutPerson, ...rest }) => {
    return (
        <Content {...rest}>
            <Summary parcel={parcel} recipient={recipient} />
            <TextField
                label="Person collecting parcel"
                onChangeText={onChangeCheckoutPerson}
                placeholder="Type name of the person"
            />
            {tip && <Text style={styles.tip}>{tip}</Text>}
        </Content>
    );
};

export default CheckOut;
