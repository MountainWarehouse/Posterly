import React, { useState, useEffect } from 'react';
import { Content, Text, Icon, Item, Input, NativeBase, Spinner, Picker, Button } from 'native-base';
import { Parcel } from '../../models/Parcel';
import styles from '../../_shared/Styles';
import ParcelIcon from './ParcelIcon';
import ParcelsListByRecipient from './ParcelsListByRecipient';
import ParcelsList from './ParcelsList';
import realm from '../../database/Realm';

enum Show {
    All,
    In,
    Out
}

export interface ParcelBrowserProps extends NativeBase.Content {
    search: string;
    onSelectParcel: (parcel: Parcel) => void;
}

const ParcelBrowser: React.SFC<ParcelBrowserProps> = ({ search: propsSearch, onSelectParcel, ...rest }) => {
    const [search, setSearch] = useState(propsSearch);
    const [isLoading, setIsLoading] = useState(true);
    const [parcels, setParcels] = useState([] as Parcel[]);
    const [show, setShow] = useState(Show.All);
    const [groupByRecipient, setGroupByRecipient] = useState(true);

    useEffect(() => {
        realm.getAllParcels().then(parcels => {
            setParcels(parcels);
            setIsLoading(false);
        });
    }, []);

    const lowerSearch = search.toLowerCase();

    const isCheckedOut = (parcel: Parcel): boolean => (parcel.checkOutPerson ? true : false);

    const filteredParcels = parcels.filter(parcel => {
        const shouldBeShown =
            show === Show.All ||
            (show === Show.Out && isCheckedOut(parcel)) ||
            (show === Show.In && !isCheckedOut(parcel));
        const searchResult =
            parcel.barcode.toLowerCase().includes(lowerSearch) ||
            parcel.recipient?.name.toLocaleLowerCase().includes(lowerSearch);

        return shouldBeShown && searchResult;
    });

    const list =
        parcels.length > 0 ? (
            groupByRecipient ? (
                <ParcelsListByRecipient parcels={filteredParcels} onSelectParcel={onSelectParcel} />
            ) : (
                <ParcelsList parcels={filteredParcels} onSelectParcel={onSelectParcel} />
            )
        ) : (
            <Text style={{ marginTop: 10 }}>There are no parcels registered yet.</Text>
        );

    return (
        <Content {...rest}>
            <Item>
                <Icon name="md-search" type="Ionicons" />
                <Input placeholder="Search" onChangeText={setSearch} value={search} />
            </Item>
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
                    <Button
                        bordered={!groupByRecipient}
                        full
                        style={styles.button}
                        onPress={() => setGroupByRecipient(!groupByRecipient)}
                    >
                        <Text>By Recipient</Text>
                    </Button>
                </Content>
            </Item>
            {isLoading ? <Spinner color="blue" /> : list}
        </Content>
    );
};

export default ParcelBrowser;
