import * as React from 'react';
import { Parcel } from '../../models/Parcel';
import * as arrayUtil from '../../utils/ArrayUtil';
import { Accordion, Text, ListItem, List } from 'native-base';
import ParcelListItem from './ParcelListItem';

export interface GroupedParcelsListProps {
    parcels: Parcel[];
    onSelectParcel: (parcel: Parcel) => void;
    onRemind: (parcel: Parcel) => void;
    groupByKeyGetter: (parcel: Parcel) => string;
    thenByKeyGetter: (parcel: Parcel) => string;
    reverseSort?: boolean;
    thenByReverseSort?: boolean;
    expanded?: number;
}

const GroupedParcelsList: React.SFC<GroupedParcelsListProps> = ({
    parcels,
    onSelectParcel,
    onRemind,
    groupByKeyGetter,
    thenByKeyGetter,
    reverseSort,
    thenByReverseSort,
    expanded
}) => {
    if (parcels.length === 0) return <Text style={{ marginTop: 10 }}>There are no parcels registered yet.</Text>;

    const grouped = arrayUtil.groupBy(parcels, groupByKeyGetter);

    const accordionData: { title: string; content: Parcel[] }[] = [];
    grouped.forEach((value, key) =>
        accordionData.push({
            title: key,
            content: value
        })
    );
    arrayUtil.sortArray(accordionData, i => i.title, reverseSort);

    return (
        <Accordion
            dataArray={accordionData}
            expanded={accordionData.length === 1 ? 0 : expanded}
            headerStyle={{ backgroundColor: '#BBDEFB' }}
            renderContent={({ content }) => {
                const subGroups = arrayUtil.groupBy(content, thenByKeyGetter);
                const subData: { subTitle: string; items: Parcel[] }[] = [];
                subGroups.forEach((items, subTitle) => subData.push({ subTitle, items }));

                arrayUtil.sortArray(subData, i => i.subTitle, thenByReverseSort);

                return (
                    <List>
                        {subData.map(({ subTitle, items }, index) => (
                            <React.Fragment key={index}>
                                <ListItem itemDivider style={{ backgroundColor: '#E3F2FD' }}>
                                    <Text>{subTitle}</Text>
                                </ListItem>
                                {items.map((parcel: Parcel) => (
                                    <ParcelListItem
                                        key={parcel.barcode}
                                        parcel={parcel}
                                        onSelect={() => onSelectParcel(parcel)}
                                        onRemind={() => onRemind(parcel)}
                                    />
                                ))}
                            </React.Fragment>
                        ))}
                    </List>
                );
            }}
        />
    );
};

export default GroupedParcelsList;
