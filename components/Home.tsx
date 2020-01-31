import React, { useState } from 'react';
import Scanner from './Scanner';
import { View, Button, Text, NativeBase, Icon, Item, Input } from 'native-base';
import styles from '../_shared/Styles';

export interface HomeProps extends NativeBase.View {
    onScan: (code: string) => void;
    onSearchParcels: (search: string) => void;
}

const Home: React.SFC<HomeProps> = ({ onScan, onSearchParcels, ...rest }) => {
    const [search, setSearch] = useState('');

    return (
        <View {...rest}>
            <Scanner tip="Scan barcode of a parcel to check in or out" onScan={onScan} />

            <Text style={{ marginTop: 25 }}>Search parcel by its barcode or recipient name</Text>
            <Item style={{ marginVertical: 5 }}>
                <Icon name="md-search" />
                <Input
                    placeholder="Search"
                    onChangeText={setSearch}
                    value={search}
                    onEndEditing={() => onSearchParcels(search)}
                />
            </Item>
            <Text style={{ marginTop: 25 }}>Browse all registered parcels</Text>
            <Button block bordered iconLeft style={styles.button} onPress={() => onSearchParcels('')}>
                <Icon name="md-list-box" type="Ionicons" />
                <Text>Browse Parcels</Text>
            </Button>
        </View>
    );
};

export default Home;
