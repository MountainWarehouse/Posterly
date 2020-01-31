import React, { useState } from 'react';
import Summary, { SummaryProps } from './Summary';
import { View, Text, NativeBase, Card, Button, CardItem, Body, H3 } from 'native-base';
import { TextField } from 'react-native-material-textfield';

export interface CheckOutProps extends SummaryProps, NativeBase.View {
    onChangeCheckoutPerson?: (checkoutPerson: string) => void;
}

const CheckOut: React.SFC<CheckOutProps> = ({ parcel, tip, onChangeCheckoutPerson, ...rest }) => {
    const [checkedOut] = useState(!!parcel.checkOutPerson);
    const [showCheckedOutInfo, setShowCheckedOutInfo] = useState(checkedOut);
    return (
        <View>
            {showCheckedOutInfo && (
                <Card>
                    <CardItem header>
                        <H3>Checked Out</H3>
                    </CardItem>
                    <CardItem>
                        <Body>
                            <Text>This parcel has already been checked out.</Text>
                        </Body>
                    </CardItem>
                    <CardItem footer>
                        <Button transparent onPress={() => setShowCheckedOutInfo(false)}>
                            <Text>OK</Text>
                        </Button>
                    </CardItem>
                </Card>
            )}
            <View {...rest}>
                <Summary parcel={parcel} />
                <TextField
                    label="Person collecting parcel"
                    onChangeText={onChangeCheckoutPerson}
                    placeholder="Type name of the person"
                    value={parcel.checkOutPerson ? parcel.checkOutPerson : ''}
                    editable={!checkedOut}
                />
                {tip && <Text note>By pressing 'Check Out' you confirm that the person has collected the parcel</Text>}
            </View>
        </View>
    );
};

export default CheckOut;
