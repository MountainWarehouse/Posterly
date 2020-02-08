import * as React from 'react';
import { NavigationStackScreenComponent } from 'react-navigation-stack';
import { View, Text, Grid, Col, Button, Toast } from 'native-base';
import { ParcelInfoParams } from './ParcelInfo';
import ParcelView from '../views/Parcel/ParcelView';
import HeaderCancelButton from '../HeaderCancelButton';
import Screen from '../../navigation/Screen';
import db from '../../database/Db';
import * as emailService from '../../services/EmailService';

const CheckIn: NavigationStackScreenComponent<ParcelInfoParams> = ({ navigation }) => {
    const parcel = navigation.getParam('parcel');
    return (
        <View padder>
            <ParcelView parcel={parcel} checkIn />
            <Text note>When 'Save & Notify' is pressed the email for the parcel receiver will be generated.</Text>
        </View>
    );
};

CheckIn.navigationOptions = ({ navigation }) => ({
    headerLeft: <HeaderCancelButton onPress={() => navigation.navigate(Screen.Home)} />,
    headerTitle: <Text>Check In</Text>,
    headerRight: () => {
        const handleCheckIn = async (notify: boolean) => {
            const parcel = navigation.getParam('parcel');
            parcel.checkInDate = new Date();
            await db.createParcel(parcel);

            if (notify) {
                await emailService.sendParcelNotification(parcel);
                parcel.notificationCount++;
                await db.updateParcel(parcel);
            } else {
            }

            navigation.navigate(Screen.Home);
            Toast.show({ text: 'Parcel has been checked in', duration: 1000 });
        };
        return (
            <Grid>
                <Col>
                    <Button hasText transparent onPress={() => handleCheckIn(false)}>
                        <Text>Save</Text>
                    </Button>
                </Col>
                <Col>
                    <Button hasText transparent onPress={() => handleCheckIn(true)}>
                        <Text>Save & Notify</Text>
                    </Button>
                </Col>
            </Grid>
        );
    }
});

export default CheckIn;
