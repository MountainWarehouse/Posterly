import { Linking } from 'react-native';
import { Parcel } from '../models/Parcel';

export function sendEmail(email: string, subject: string, body: string): Promise<any> {
    let url = `mailto:${email}?subject=${subject}&body=${body}`;
    // check if we can use this link
    const canOpen = Linking.canOpenURL(url);

    if (!canOpen) {
        throw new Error('Provided URL can not be handled');
    }

    return Linking.openURL(url);
}

export function sendParcelNotification(parcel: Parcel): Promise<any> {
    const asReminder = parcel.notificationCount > 0;
    const subject = `${asReminder ? '[REMINDER] ' : ''}Your parcel is${asReminder ? ' still' : ''} waiting for you!`;
    const shelfInfo = parcel.shelfBarcode ? `Look it by the shelf no: ${parcel.shelfBarcode}.\n` : '';
    const body =
        `Hello ${parcel.recipient.name},\n` +
        `Your parcel no: ${parcel.barcode} is${asReminder ? ' still' : ''} waiting in reception.\n` +
        shelfInfo +
        '\nHave a great day!';
    return sendEmail(parcel.recipient.email, subject, body);
}

export function sendParcelsNotification(parcels: Parcel[]): Promise<any> {
    if (parcels.length === 0) {
        throw Error('No parcels to notify');
    }

    const { recipient } = parcels[0];

    if (parcels.filter(p => p.recipient.email !== parcels[0].recipient.email).length > 0) {
        throw Error('Cannot send a notification to multiple recipients.');
    }

    const asReminder = parcels.filter(p => !p.notificationCount).length === 0;
    const plural = parcels.length > 1;

    const awaitingHeader =
        (plural ? parcels.length.toString() : 'Your') +
        ` parcel${plural ? 's are' : ' is'}${asReminder ? ' still' : ''} waiting`;

    const subject = `${asReminder ? '[REMINDER] ' : ''}${awaitingHeader} for you!`;

    const parcelInfo = plural
        ? parcels
              .map(p => `Parcel No: ${p.barcode}${p.shelfBarcode ? `, on shelf: ${p.shelfBarcode}` : ''}`)
              .join('\n') + '\n'
        : `Parcel No: ${parcels[0].barcode}${
              parcels[0].shelfBarcode ? `\nLook it by the shelf no: ${parcels[0].shelfBarcode}.` : ''
          }\n`;

    const body = `Hello ${recipient.name},\n\n${awaitingHeader} in reception:\n${parcelInfo}\nHave a great day!`;

    return sendEmail(recipient.email, subject, body);
}
