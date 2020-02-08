import React from 'react';
import { View, Text, Grid, Col, Button, Toast } from 'native-base';
import ParcelView from '../views/Parcel/ParcelView';
import { ParcelInfoParams } from './ParcelInfo';
import { NavigationStackScreenComponent } from 'react-navigation-stack';
import HeaderCancelButton from '../HeaderCancelButton';
import Screen from '../../navigation/Screen';
import * as emailService from '../../services/EmailService';
import db from '../../database/Db';
import { Alert } from 'react-native';
import ContactService from '../../services/ContactService';

const CheckOut: NavigationStackScreenComponent<ParcelInfoParams> = ({ navigation }) => {
    const parcel = navigation.getParam('parcel');

    if (!parcel.recipient) {
        ContactService.restoreRecipient(parcel).then(parcel => (parcel ? navigation.setParams({ parcel }) : null));
    }

    const handleChangeCheckOutPerson = (checkOutPerson: string) => {
        parcel.checkOutPerson = checkOutPerson;
        navigation.setParams({ parcel });
    };

    return (
        <View padder>
            <ParcelView parcel={parcel} onChangeCheckoutPerson={handleChangeCheckOutPerson} />
            <Text note>By pressing 'Check Out' you confirm that the person has collected the parcel.</Text>
        </View>
    );
};

CheckOut.navigationOptions = ({ navigation }) => ({
    headerLeft: <HeaderCancelButton onPress={() => navigation.navigate(Screen.Home)} />,
    headerTitle: <Text>Check Out</Text>,
    headerRight: () => {
        const parcel = navigation.getParam('parcel');

        const handleCheckOut = () => {
            if (parcel.checkOutPerson === parcel.recipient?.displayName) return checkOutParcel();

            Alert.alert(
                'Notify?',
                'Person collecting parcel is different than the parcel recipient.\n' +
                    'Do you want to notify the original recipient that the parcel has been received?',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel'
                    },
                    {
                        text: 'No',
                        onPress: checkOutParcel
                    },
                    {
                        text: 'Yes',
                        onPress: () => {
                            const body =
                                `Hello ${parcel.recipient?.displayName},\n` +
                                `Your parcel no: ${parcel.barcode} has been checked out by ${parcel.checkOutPerson}.\n\n` +
                                'Have a great day!';
                            emailService.sendEmail(
                                parcel.recipient?.emailsText,
                                'Your parcel has been checked out',
                                body
                            );
                            checkOutParcel();
                        }
                    }
                ],
                { cancelable: false }
            );
        };

        const checkOutParcel = async () => {
            if (!parcel.checkOutPerson) {
                return Alert.alert(
                    'Error',
                    'You need to specify person who collected parcel in order to proceed with checkout.'
                );
            }

            parcel.checkOutDate = new Date();
            await db.updateParcel(parcel);
            Toast.show({ text: 'Parcel has been checked out', duration: 1000 });
            navigation.navigate(Screen.Home);
        };

        const handleNotify = async () => {
            await emailService.sendParcelNotification(parcel);
            parcel.checkOutPerson = undefined;
            parcel.notificationCount++;
            await db.updateParcel(parcel);
            navigation.navigate(Screen.Home);
        };

        return (
            <Grid>
                <Col>
                    <Button hasText transparent onPress={handleNotify}>
                        <Text>{parcel.notificationCount ? 'Remind' : 'Notify'}</Text>
                    </Button>
                </Col>
                <Col>
                    <Button hasText transparent onPress={handleCheckOut} disabled={!parcel.checkOutPerson}>
                        <Text>Check Out</Text>
                    </Button>
                </Col>
            </Grid>
        );
    }
});

export default CheckOut;
