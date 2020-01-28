import React from 'react';
import { List } from 'native-base';
import { Parcel } from '../../models/Parcel';
import ParcelListItem from './ParcelListItem';

export interface ParcelsListProps {
    parcels: Parcel[];
    onSelectParcel: (parcel: Parcel) => void;
    onRemind: (parcel: Parcel) => void;
}

const ParcelsList: React.SFC<ParcelsListProps> = ({ parcels, onSelectParcel, onRemind }) => {
    return (
        <List
            dataArray={parcels}
            keyExtractor={(parcel: Parcel) => parcel.barcode}
            renderRow={(parcel: Parcel) => (
                <ParcelListItem
                    parcel={parcel}
                    onSelect={() => onSelectParcel(parcel)}
                    onRemind={() => onRemind(parcel)}
                />
            )}
        />
    );
};

export default ParcelsList;
