import React, { useState, useEffect } from 'react';
import { View, ListItem, CheckBox, Body, Text } from 'native-base';
import IPreferences from '../../_shared/IPreferences';
import { NavigationStackScreenComponent } from 'react-navigation-stack';
import PreferenceService from '../../services/PreferenceService';

const Preferences: NavigationStackScreenComponent = () => {
    const [preferences, setPreferences] = useState({} as IPreferences);

    useEffect(() => {
        PreferenceService.getAll().then(prefs => setPreferences(prefs));
    }, []);

    const toggleUseShelf = async () => {
        const newPreferences = { ...preferences };
        newPreferences.useShelf = !preferences.useShelf;
        await PreferenceService.setAll(newPreferences);
        setPreferences(newPreferences);
    };

    return (
        <View>
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

Preferences.navigationOptions = {
    title: 'Settings',
    headerRight: null
};

export default Preferences;
