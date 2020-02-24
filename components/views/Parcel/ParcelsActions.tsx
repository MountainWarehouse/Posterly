import React from 'react';
import { Text, Icon, Button, View, Toast, Badge } from 'native-base';
import { Parcel } from '../../../models/Parcel';
import { StyleSheet, ViewStyle } from 'react-native';

export interface ParcelsActionsProps {
    parcels: Parcel[];
    onNotify: (parcels: Parcel[]) => void;
    onRestoreRecipient: () => void;
}

const ParcelsActions: React.SFC<ParcelsActionsProps> = ({ parcels, onNotify, onRestoreRecipient }) => {
    const awaitingParcels = parcels.filter(p => !p.checkOutPerson);

    const unnotifiedParcels = awaitingParcels.filter(p => !p.notificationCount);
    const allNotificationsBadge: ViewStyle = { ...styles.iconBadge };
    allNotificationsBadge.backgroundColor = '#42A5F5';

    const unknownRecipient = parcels.filter(p => p.recipient).length === 0;

    return (
        <View style={{ flexDirection: 'row' }}>
            {unknownRecipient && (
                <Button
                    small
                    dark
                    bordered
                    rounded
                    style={styles.button}
                    onPress={onRestoreRecipient}
                    onLongPress={() => Toast.show({ text: 'Restore contact information' })}
                >
                    <Icon name="md-person" />
                    <Badge style={styles.iconBadge}>
                        <Text style={styles.iconBadgeText}> ! </Text>
                    </Badge>
                </Button>
            )}
            {awaitingParcels.length > unnotifiedParcels.length && (
                <Button
                    small
                    info
                    rounded
                    style={styles.button}
                    onPress={() => onNotify(awaitingParcels)}
                    onLongPress={() => Toast.show({ text: 'Send a notification about all awaiting parcels' })}
                >
                    <Icon name="md-mail" />
                    <Badge style={allNotificationsBadge}>
                        <Text style={styles.iconBadgeText}>{awaitingParcels.length}</Text>
                    </Badge>
                </Button>
            )}
            {unnotifiedParcels.length > 0 && (
                <Button
                    small
                    rounded
                    style={styles.button}
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
    button: {
        marginLeft: 5
    },
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

export default ParcelsActions;
