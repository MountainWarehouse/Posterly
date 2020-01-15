import * as React from 'react';
import Scanner from './Scanner';
import { Content, Button, Text, NativeBase, Icon, Item, Input } from 'native-base';
import styles from '../_shared/Styles';

export interface HomeProps extends NativeBase.Content {
    onScan: (code: string) => void;
    onSearchParcels: () => void;
}

const Home: React.SFC<HomeProps> = ({ onScan, onSearchParcels, ...rest }) => {
    return (
        <Content {...rest}>
            <Scanner tip="Scan barcode of a parcel to check in or out" onScan={onScan} />

            <Text style={{ marginTop: 25 }}>Search parcel by its barcode or recipient name</Text>
            <Item style={{ marginVertical: 5 }}>
                <Icon name="md-search" />
                <Input placeholder="Search" onChangeText={() => null} />
            </Item>
            <Text style={{ marginTop: 25 }}>Browse all registered parcels</Text>
            <Button block bordered iconLeft style={styles.button} onPress={onSearchParcels}>
                <Icon name="md-list-box" type="Ionicons" />
                <Text>Browse Parcels</Text>
            </Button>
        </Content>
    );
};

export default Home;
