import React from 'react';
import { Accordion } from 'native-base';
import { ParcelsListProps } from './ParcelsList';
import ParcelListItem from './ParcelListItem';
import { Parcel } from '../../models/Parcel';
import groupBy from '../../utils/ArrayUtil';

const ParcelsListByRecipient: React.SFC<ParcelsListProps> = ({ parcels }) => {
    const grouped = groupBy(parcels, p => (p.recipient?.name ? p.recipient?.name : ''));

    const accordionData: { title: string; content: Parcel[] }[] = [];
    grouped.forEach((value, key) =>
        accordionData.push({
            title: key,
            content: value
        })
    );

    accordionData.sort((a, b) => (a.title > b.title ? 1 : -1));

    return (
        <Accordion
            dataArray={accordionData}
            renderContent={({ content }) =>
                content.map((parcel: Parcel) => <ParcelListItem key={parcel.id} parcel={parcel} hideRecipient />)
            }
        />
    );
};

export default ParcelsListByRecipient;
