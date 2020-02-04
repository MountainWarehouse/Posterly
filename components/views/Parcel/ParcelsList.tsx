import * as React from 'react';
import { Parcel } from '../../../models/Parcel';
import * as arrayUtil from '../../../utils/ArrayUtil';
import { Accordion, Text, View, Card, CardItem, Icon, Left, Right } from 'native-base';
import ParcelListItem from './ParcelListItem';

export interface ParcelsListProps {
    parcels: Parcel[];
    onSelectParcel: (parcel: Parcel) => void;
    onNotify: (parcel: Parcel) => void;
    groupByKeyGetter: (parcel: Parcel) => any;
    groupByTitleGetter: (key: any) => string;
    thenByKeyGetter: (parcel: Parcel) => any;
    thenByTitleGetter: (key: any) => string;
    reverseSort?: boolean;
    thenByReverseSort?: boolean;
    expanded?: number;
    contentActions?: (parcels: Parcel[]) => JSX.Element;
    subcontentActions?: (parcels: Parcel[]) => JSX.Element;
}

const ParcelsList: React.SFC<ParcelsListProps> = ({
    parcels,
    onSelectParcel,
    onNotify,
    groupByKeyGetter,
    groupByTitleGetter,
    thenByKeyGetter,
    thenByTitleGetter,
    reverseSort,
    thenByReverseSort,
    expanded,
    contentActions,
    subcontentActions
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
            renderHeader={(item, expanded) => {
                return (
                    <View
                        style={{
                            flexDirection: 'row',
                            padding: 10,
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: '#BBDEFB'
                        }}
                    >
                        <Left>
                            <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
                        </Left>
                        {contentActions && contentActions(item.content)}
                        <Icon name={expanded ? 'chevron-up' : 'chevron-down'} type="MaterialCommunityIcons" />
                    </View>
                );
            }}
            renderContent={({ content }) => {
                const subGroups = arrayUtil.groupBy(content, thenByKeyGetter);
                const subData: { group: any; subTitle: string; items: Parcel[] }[] = [];
                subGroups.forEach((items, group) => subData.push({ group, subTitle: thenByTitleGetter(group), items }));

                arrayUtil.sortArray(subData, i => i.group, thenByReverseSort);

                return (
                    <View>
                        {/* {contentActions && contentActions(content)} */}
                        {subData.map(({ subTitle, items }, index) => (
                            <Card key={index}>
                                <CardItem
                                    style={{
                                        backgroundColor: '#E3F2FD',
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Left>
                                        <Text>{subTitle}</Text>
                                    </Left>
                                    {subcontentActions && <Right>{subcontentActions(items)}</Right>}
                                </CardItem>
                                {items.map((parcel: Parcel) => (
                                    <ParcelListItem
                                        key={parcel.barcode}
                                        parcel={parcel}
                                        onSelect={() => onSelectParcel(parcel)}
                                        onNotify={() => onNotify(parcel)}
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
