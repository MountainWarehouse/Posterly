import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Root } from 'native-base';
import { MenuProvider } from 'react-native-popup-menu';
import realm from './database/Realm';
import AppNavigationContainer from './navigation/AppNavigationContainer';

const App: React.SFC = () => {
    const [appState, setAppState] = useState(AppState.currentState);

    //TODO: Figure out if it's necessary and/or if it's not time consuming
    const handleChangeAppState = (nextAppState: AppStateStatus) => {
        if (appState !== 'active' && nextAppState === 'active') {
            realm.open();
            console.log('app going active');
        } else if (appState === 'active' && nextAppState !== 'active') {
            realm.close();
            console.log(`app going ${nextAppState}`);
        }
        setAppState(nextAppState);
    };

    useEffect(() => {
        console.log('app mount');
        realm.open();
        AppState.addEventListener('change', handleChangeAppState);

        return () => {
            console.log('app unmount');
            AppState.removeEventListener('change', handleChangeAppState);
            realm.close();
        };
    }, []);

    return (
        <MenuProvider>
            <Root>
                <AppNavigationContainer />
            </Root>
        </MenuProvider>
    );
};

export default App;
