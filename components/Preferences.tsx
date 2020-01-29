import React, { useState, useEffect } from 'react';
import { View, ListItem, CheckBox, Body, Text, NativeBase } from 'native-base';
import IPreferences from '../_shared/IPreferences';

export interface PreferencesProps extends NativeBase.View {
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
        <View {...rest}>
            <ListItem>
                <CheckBox checked={preferences.useShelf} onPress={toggleUseShelf} />
                <Body>
                    <Text>Register Storage Shelf</Text>
                    <Text note>Check to scan & register shelf no.</Text>
                </Body>
            </ListItem>
        </View>
    );
};

export default Preferences;
