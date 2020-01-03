import { Linking } from 'react-native';

export const sendEmail = (email: string, subject: string, body: string) => {
    let url = `mailto:${email}?subject=${subject}&body=${body}`;
    // check if we can use this link
    const canOpen = Linking.canOpenURL(url);

    if (!canOpen) {
        throw new Error('Provided URL can not be handled');
    }

    Linking.openURL(url);
};
