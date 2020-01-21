import React from 'react';
import { List } from 'native-base';
import { Parcel } from '../../models/Parcel';
import ParcelListItem from './ParcelListItem';

export interface ParcelsListProps {
    parcels: Parcel[];
}

const ParcelsList: React.SFC<ParcelsListProps> = ({ parcels }) => {
    return (
        <List
            dataArray={parcels}
            keyExtractor={(parcel: Parcel) => parcel.id.toString()}
            renderRow={(parcel: Parcel) => <ParcelListItem parcel={parcel} />}
        />
    );
};

export default ParcelsList;
