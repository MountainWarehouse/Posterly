import React from 'react';
import { List } from 'native-base';
import { Parcel } from '../../models/Parcel';
import ParcelListItem from './ParcelListItem';

export interface ParcelsListProps {
    parcels: Parcel[];
    onSelectParcel: (parcel: Parcel) => void;
}

const ParcelsList: React.SFC<ParcelsListProps> = ({ parcels, onSelectParcel }) => {
    return (
        <List
            dataArray={parcels}
            keyExtractor={(parcel: Parcel) => parcel.id.toString()}
            renderRow={(parcel: Parcel) => <ParcelListItem parcel={parcel} onSelect={() => onSelectParcel(parcel)} />}
        />
    );
};

export default ParcelsList;
