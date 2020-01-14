import React, { useState, useEffect } from 'react';
import { Content, ListItem, CheckBox, Body, Text } from 'native-base';
import styles from '../_shared/styles';
import IPreferences from '../_shared/IPreferences';

export interface PreferencesProps {
    preferences: IPreferences;
    onPreferencesChanged: (preferences: IPreferences) => void;
}

const Preferences: React.SFC<PreferencesProps> = props => {
    const [preferences, setPreferences] = useState(props.preferences);

    useEffect(() => setPreferences(() => props.preferences), [props.preferences]);

    const toggleUseShelf = () => {
        const newPreferences = { ...preferences };
        newPreferences.useShelf = !preferences.useShelf;
        setPreferences(newPreferences);
        props.onPreferencesChanged(newPreferences);
    };

    return (
        <Content padder>
            <ListItem>
                <CheckBox checked={preferences.useShelf} onPress={toggleUseShelf} />
                <Body>
                    <Text>Register Storage Shelf</Text>
                </Body>
            </ListItem>
            <Text style={styles.tip}>
                If checked the shelf barcode needs to be scanned as well to register where the parcel was left.
            </Text>
        </Content>
    );
};

export default Preferences;
