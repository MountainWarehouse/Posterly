import { Contact } from 'react-native-contacts';

export interface DisplayContact extends Contact {
    readonly displayName: string;
    emailsText: string;
}

export function toDisplayContact(contact: Contact): DisplayContact {
    const { givenName, middleName, familyName, emailAddresses, ...rest } = contact;
    return {
        givenName,
        middleName,
        familyName,
        emailAddresses,
        displayName: [givenName, middleName, familyName].filter(t => t).join(' '),
        emailsText: emailAddresses.length > 0 ? emailAddresses.map(a => a.email).join(', ') : '',
        ...rest
    };
}
