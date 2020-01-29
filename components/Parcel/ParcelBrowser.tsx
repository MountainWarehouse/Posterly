import React, { useState, useEffect } from 'react';
import { Content, Text, Icon, Item, Input, NativeBase, Spinner, Picker, Button, View } from 'native-base';
import { Parcel } from '../../models/Parcel';
import ParcelIcon from './ParcelIcon';
import realm from '../../database/Realm';
import ParcelsList from './ParcelsList';
import * as dateUtil from '../../utils/DateUtil';

enum Show {
    All,
    In,
    Out
}

export interface ParcelBrowserProps extends NativeBase.View {
    search: string;
    onSelectParcel: (parcel: Parcel) => void;
    onRemind: (parcel: Parcel) => void;
}

const ParcelBrowser: React.SFC<ParcelBrowserProps> = ({ search: propsSearch, onSelectParcel, onRemind, ...rest }) => {
    const [search, setSearch] = useState(propsSearch);
    const [isLoading, setIsLoading] = useState(true);
    const [parcels, setParcels] = useState([] as Parcel[]);
    const [show, setShow] = useState(Show.All);
    const [groupByRecipient, setGroupByRecipient] = useState(false);

    useEffect(() => {
        realm.getAllParcels().then(parcels => {
            setParcels(parcels);
            setIsLoading(false);
        });
    }, []);

    const lowerSearch = search.toLowerCase();

    const isCheckedOut = (parcel: Parcel): boolean => !!parcel.checkOutPerson;

    const filteredParcels = parcels.filter(parcel => {
        const shouldBeShown =
            show === Show.All ||
            (show === Show.Out && isCheckedOut(parcel)) ||
            (show === Show.In && !isCheckedOut(parcel));
        const searchResult =
            parcel.barcode.toLowerCase().includes(lowerSearch) ||
            parcel.recipient.name.toLocaleLowerCase().includes(lowerSearch);

        return shouldBeShown && searchResult;
    });

    return (
        <View {...rest}>
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
                    <Button iconLeft info block onPress={() => setGroupByRecipient(!groupByRecipient)}>
                        <Icon name={groupByRecipient ? 'md-person' : 'md-calendar'} />
                        <Text>{groupByRecipient ? 'By Recipient' : 'By Date'}</Text>
                    </Button>
                </Content>
            </Item>
            {isLoading ? (
                <Spinner color="blue" />
            ) : (
                <ParcelsList
                    parcels={filteredParcels}
                    onSelectParcel={onSelectParcel}
                    expanded={!groupByRecipient ? 0 : undefined}
                    onRemind={onRemind}
                    groupByKeyGetter={parcel =>
                        groupByRecipient ? parcel.recipient.name : dateUtil.getDateString(parcel.checkInDate)
                    }
                    groupByTitleGetter={key => (groupByRecipient ? key : dateUtil.formatDate(new Date(key)))}
                    thenByKeyGetter={parcel =>
                        groupByRecipient ? dateUtil.getDateString(parcel.checkInDate) : parcel.recipient.name
                    }
                    thenByTitleGetter={key => (groupByRecipient ? dateUtil.formatDate(new Date(key)) : key)}
                    reverseSort={!groupByRecipient}
                    thenByReverseSort={groupByRecipient}
                />
            )}
        </View>
    );
};

export default ParcelBrowser;
