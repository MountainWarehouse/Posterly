import React from 'react';
import { Text, Icon, Button, View, Toast, Badge } from 'native-base';
import { Parcel } from '../../../models/Parcel';
import { StyleSheet, ViewStyle } from 'react-native';

export interface ParcelNotifyActionsProps {
    parcels: Parcel[];
    onNotify: (parcels: Parcel[]) => void;
}

const ParcelNotifyActions: React.SFC<ParcelNotifyActionsProps> = ({ parcels, onNotify }) => {
    const awaitingParcels = parcels.filter(p => !p.checkOutPerson);

    if (awaitingParcels.length === 0) return <React.Fragment />;
    const unnotifiedParcels = awaitingParcels.filter(p => !p.notificationCount);
    const allNotificationsBadge: ViewStyle = { ...styles.iconBadge };
    allNotificationsBadge.backgroundColor = '#42A5F5';

    return (
        <View style={{ flexDirection: 'row' }}>
            <Button
                small
                info
                rounded
                onPress={() => onNotify(awaitingParcels)}
                onLongPress={() => Toast.show({ text: 'Send a notification about all awaiting parcels' })}
            >
                <Icon name="md-mail" />
                <Badge success style={allNotificationsBadge}>
                    <Text style={styles.iconBadgeText}>{awaitingParcels.length}</Text>
                </Badge>
            </Button>
            <Text> </Text>
            {unnotifiedParcels.length > 0 && (
                <Button
                    small
                    rounded
                    onPress={() => onNotify(unnotifiedParcels)}
                    onLongPress={() => Toast.show({ text: 'Send a notification about new awaiting parcels' })}
                >
                    <Icon name="md-mail-unread" />

                    <Badge warning style={styles.iconBadge}>
                        <Text style={styles.iconBadgeText}>{unnotifiedParcels.length}</Text>
                    </Badge>
                </Button>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    iconBadge: {
        position: 'absolute',
        top: -2,
        right: 0,
        transform: [{ scale: 0.7 }]
    },
    iconBadgeText: {
        fontSize: 16
    }
});

export default ParcelNotifyActions;
