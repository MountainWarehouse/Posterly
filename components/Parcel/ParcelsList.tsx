import * as React from 'react';
import { Parcel } from '../../models/Parcel';
import * as arrayUtil from '../../utils/ArrayUtil';
import { Accordion, Text, View, Card, CardItem } from 'native-base';
import ParcelListItem from './ParcelListItem';

export interface ParcelsListProps {
    parcels: Parcel[];
    onSelectParcel: (parcel: Parcel) => void;
    onRemind: (parcel: Parcel) => void;
    groupByKeyGetter: (parcel: Parcel) => any;
    groupByTitleGetter: (key: any) => string;
    thenByKeyGetter: (parcel: Parcel) => any;
    thenByTitleGetter: (key: any) => string;
    reverseSort?: boolean;
    thenByReverseSort?: boolean;
    expanded?: number;
}

const ParcelsList: React.SFC<ParcelsListProps> = ({
    parcels,
    onSelectParcel,
    onRemind,
    groupByKeyGetter,
    groupByTitleGetter,
    thenByKeyGetter,
    thenByTitleGetter,
    reverseSort,
    thenByReverseSort,
    expanded
}) => {
    if (parcels.length === 0) return <Text style={{ marginTop: 10 }}>There are no parcels registered yet.</Text>;

    const grouped = arrayUtil.groupBy(parcels, groupByKeyGetter);

    const accordionData: { group: any; title: string; content: Parcel[] }[] = [];
    grouped.forEach((value, key) =>
        accordionData.push({
            group: key,
            title: groupByTitleGetter(key),
            content: value
        })
    );
    arrayUtil.sortArray(accordionData, i => i.group, reverseSort);

    return (
        <Accordion
            dataArray={accordionData}
            expanded={accordionData.length === 1 ? 0 : expanded}
            headerStyle={{ backgroundColor: '#BBDEFB' }}
            renderContent={({ content }) => {
                const subGroups = arrayUtil.groupBy(content, thenByKeyGetter);
                const subData: { group: any; subTitle: string; items: Parcel[] }[] = [];
                subGroups.forEach((items, group) => subData.push({ group, subTitle: thenByTitleGetter(group), items }));

                arrayUtil.sortArray(subData, i => i.group, thenByReverseSort);

                return (
                    <View>
                        {subData.map(({ subTitle, items }, index) => (
                            <Card key={index}>
                                <CardItem style={{ backgroundColor: '#E3F2FD' }}>
                                    <Text>{subTitle}</Text>
                                </CardItem>
                                {items.map((parcel: Parcel) => (
                                    <ParcelListItem
                                        key={parcel.barcode}
                                        parcel={parcel}
                                        onSelect={() => onSelectParcel(parcel)}
                                        onRemind={() => onRemind(parcel)}
                                    />
                                ))}
                            </Card>
                        ))}
                    </View>
                );
            }}
        />
    );
};

export default ParcelsList;
