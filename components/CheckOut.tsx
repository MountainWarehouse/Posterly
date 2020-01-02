import React from 'react';
import Summary, { SummaryProps } from './Summary';
import { Content, Text } from 'native-base';
import { TextField } from 'react-native-material-textfield';
import styles from '../_shared/styles';

export interface CheckOutProps extends SummaryProps {
    onChangeCheckoutPerson: (checkoutPerson: string) => void;
}

const CheckOut: React.SFC<CheckOutProps> = props => {
    const { parcel, user, tip, onChangeCheckoutPerson } = props;
    return (
        <Content>
            <Summary parcel={parcel} user={user} />
            <Content padder>
                <TextField
                    label="Person collecting parcel"
                    onChangeText={onChangeCheckoutPerson}
                    placeholder="Type name of the person"
                />
                {tip && <Text style={styles.tip}>{tip}</Text>}
            </Content>
        </Content>
    );
};

export default CheckOut;
