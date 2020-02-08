import React, { useState } from 'react';
import { NavigationStackScreenComponent } from 'react-navigation-stack';
import { Parcel } from '../../models/Parcel';
import { View, Text, Card, CardItem, H3, Body, Button } from 'native-base';
import ParcelView from '../views/Parcel/ParcelView';
import ContactService from '../../services/ContactService';

export interface ParcelInfoParams {
    parcel: Parcel;
}

const ParcelInfo: NavigationStackScreenComponent<ParcelInfoParams> = ({ navigation }) => {
    const parcel = navigation.getParam('parcel');

    if (!parcel.recipient) {
        ContactService.restoreRecipient(parcel).then(parcel => (parcel ? navigation.setParams({ parcel }) : null));
    }
    const [showCheckedOutInfo, setShowCheckedOutInfo] = useState(true);
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
            <View padder>
                <ParcelView parcel={parcel} />
            </View>
        </View>
    );
};

ParcelInfo.navigationOptions = { title: 'ParcelInfo' };

export default ParcelInfo;
