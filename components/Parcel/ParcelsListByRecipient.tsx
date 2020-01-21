import React from 'react';
import { Text, ListItem } from 'native-base';
import { ParcelsListProps } from './ParcelsList';
import ParcelListItem from './ParcelListItem';

const ParcelsListByRecipient: React.SFC<ParcelsListProps> = ({ parcels }) => {
    const orderedParcels = parcels.sort((a, b) => {
        const aName = a.recipient?.name || '';
        const bName = b.recipient?.name || '';

        if (aName > bName) {
            return 1;
        }
        if (aName < bName) {
            return -1;
        }
        return 0;
    });

    return (
        <React.Fragment>
            {orderedParcels.map((parcel, index, a) => (
                <React.Fragment key={index}>
                    {a.findIndex(p => p.recipient?.name === parcel.recipient?.name) === index && (
                        <ListItem itemDivider>
                            <Text>{parcel.recipient?.name}</Text>
                        </ListItem>
                    )}
                    <ParcelListItem parcel={parcel} hideRecipient />
                </React.Fragment>
            ))}
        </React.Fragment>
    );
};

export default ParcelsListByRecipient;
