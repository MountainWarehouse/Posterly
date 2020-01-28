import React, { useState, useEffect } from 'react';
import { Content, ListItem, CheckBox, Body, Text, NativeBase } from 'native-base';
import styles from '../_shared/Styles';
import IPreferences from '../_shared/IPreferences';

export interface PreferencesProps extends NativeBase.Content {
    preferences: IPreferences;
    onPreferencesChanged: (preferences: IPreferences) => void;
}

const Preferences: React.SFC<PreferencesProps> = props => {
    const { preferences: propsPreferences, onPreferencesChanged, ...rest } = props;
    const [preferences, setPreferences] = useState(propsPreferences);

    useEffect(() => setPreferences(() => propsPreferences), [propsPreferences]);

    const toggleUseShelf = () => {
        const newPreferences = { ...preferences };
        newPreferences.useShelf = !preferences.useShelf;
        setPreferences(newPreferences);
        onPreferencesChanged(newPreferences);
    };

    return (
        <Content {...rest}>
            <ListItem>
                <CheckBox checked={preferences.useShelf} onPress={toggleUseShelf} />
                <Body>
                    <Text>Register Storage Shelf</Text>
                </Body>
            </ListItem>
            <Text note>
                If checked the shelf barcode needs to be scanned as well to register where the parcel was left.
            </Text>
        </Content>
    );
};

export default Preferences;
