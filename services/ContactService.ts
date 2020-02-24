import db from '../database/Db';
import { Alert } from 'react-native';
import { toDisplayContact } from '../models/DisplayContact';
import { openContactForm, Contact } from 'react-native-contacts';
import { Parcel } from '../models/Parcel';

const restoreRecipient = (parcel: Parcel): Promise<Parcel | undefined> => {
    return new Promise(resolve => {
        Alert.alert('Contact not found', 'The contact was not found.\nPlease restore contact information.', [
            {
                text: 'Later',
                style: 'cancel'
            },
            {
                text: 'OK',
                onPress: () => {
                    openContactForm({} as Contact, async (error, contact) => {
                        if (error) throw error;
                        if (!contact) return resolve(undefined);
                        await db.restoreRecipient(parcel.recipientRecordID, contact.recordID);
                        parcel.recipientRecordID = contact.recordID;
                        parcel.recipient = toDisplayContact(contact);
                        resolve(parcel);
                    });
                }
            }
        ]);
    });
};

export default {
    restoreRecipient
};
