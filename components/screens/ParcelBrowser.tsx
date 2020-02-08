import React, { useState, useEffect } from 'react';
import { Content, Text, Icon, Item, Input, Picker, Button, View, Container, Header } from 'native-base';
import { Parcel } from '../../models/Parcel';
import ParcelIcon from '../views/Parcel/ParcelIcon';
import ParcelsList from '../views/Parcel/ParcelsList';
import ParcelNotifyActions from '../views/Parcel/ParcelNotifyActions';
import * as dateUtil from '../../utils/DateUtil';
import * as emailService from '../../services/EmailService';
import db from '../../database/Db';
import { NavigationStackScreenComponent } from 'react-navigation-stack';
import Screen from '../../navigation/Screen';
import Loading from '../views/Loading';
import Search from '../Search';

enum Show {
    All,
    In,
    Out
}

export interface ParcelBrowserParams {
    search: string;
}

const ParcelBrowser: NavigationStackScreenComponent<ParcelBrowserParams> = ({ navigation }) => {
    const search = navigation.getParam('search', '');
    const [isLoading, setIsLoading] = useState(true);
    const [parcels, setParcels] = useState([] as Parcel[]);
    const [show, setShow] = useState(Show.All);
    const [groupByRecipient, setGroupByRecipient] = useState(false);

    useEffect(() => {
        db.getAllParcels().then(parcels => {
            setParcels(parcels);
            setIsLoading(false);
        });
    }, []);

    const handleNotify = async (parcelsToNotify: Parcel[]) => {
        await emailService.sendParcelsNotification(parcelsToNotify);
        parcelsToNotify.forEach(parcel => parcel.notificationCount++);
        await db.updateParcels(parcelsToNotify);
        setParcels([...parcels]);
    };

    const lowerSearch = search.toLowerCase();

    const isCheckedOut = (parcel: Parcel): boolean => !!parcel.checkOutPerson;

    const filteredParcels = parcels.filter(parcel => {
        const shouldBeShown =
            show === Show.All ||
            (show === Show.Out && isCheckedOut(parcel)) ||
            (show === Show.In && !isCheckedOut(parcel));
        const searchResult =
            parcel.barcode.toLowerCase().includes(lowerSearch) ||
            parcel.recipient?.displayName.toLowerCase().includes(lowerSearch) ||
            parcel.checkOutPerson?.toLowerCase().includes(lowerSearch);

        return shouldBeShown && searchResult;
    });

    const getName = ({ recipient, recipientRecordID }: Parcel) =>
        recipient?.displayName ? recipient?.displayName : `(not found) (${recipientRecordID})`;
    const getCheckInDate = (parcel: Parcel) => dateUtil.getDateString(parcel.checkInDate);

    const notifyActions = (parcels: Parcel[]) => <ParcelNotifyActions parcels={parcels} onNotify={handleNotify} />;

    return (
        <View padder style={{ flex: 1 }}>
            <Item>
                {show === Show.All ? (
                    <Icon name="package-variant-closed" style={{ color: 'lightgrey' }} type="MaterialCommunityIcons" />
                ) : (
                    <ParcelIcon checkedOut={show === Show.Out} />
                )}
                <Picker mode="dropdown" selectedValue={show} onValueChange={setShow}>
                    <Picker.Item label="All" value={Show.All} />
                    <Picker.Item label="Checked In" value={Show.In} />
                    <Picker.Item label="Checked Out" value={Show.Out} />
                </Picker>
                <Content>
                    <Button iconLeft info block onPress={() => setGroupByRecipient(!groupByRecipient)}>
                        <Icon name={groupByRecipient ? 'md-person' : 'md-calendar'} />
                        <Text>{groupByRecipient ? 'By Recipient' : 'By Date'}</Text>
                    </Button>
                </Content>
            </Item>
            {isLoading ? (
                <Loading text="Loading parcels..." />
            ) : (
                <ParcelsList
                    parcels={filteredParcels}
                    onSelectParcel={parcel =>
                        navigation.navigate(parcel.checkOutPerson ? Screen.ParcelInfo : Screen.CheckOut, { parcel })
                    }
                    expanded={!groupByRecipient ? 0 : undefined}
                    onNotify={parcel => handleNotify([parcel])}
                    groupByKeyGetter={parcel => (groupByRecipient ? getName(parcel) : getCheckInDate(parcel))}
                    groupByTitleGetter={key => (groupByRecipient ? key : dateUtil.formatDate(new Date(key)))}
                    thenByKeyGetter={parcel => (groupByRecipient ? getCheckInDate(parcel) : getName(parcel))}
                    thenByTitleGetter={key => (groupByRecipient ? dateUtil.formatDate(new Date(key)) : key)}
                    reverseSort={!groupByRecipient}
                    thenByReverseSort={groupByRecipient}
                    contentActions={groupByRecipient ? notifyActions : undefined}
                    subcontentActions={!groupByRecipient ? notifyActions : undefined}
                />
            )}
        </View>
    );
};

ParcelBrowser.navigationOptions = ({ navigation }) => ({
    headerTitle: (
        <Search onSearch={search => navigation.setParams({ search })} value={navigation.getParam('search', '')} />
    )
});

export default ParcelBrowser;
