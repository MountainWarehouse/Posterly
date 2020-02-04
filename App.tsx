import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Root } from 'native-base';
import { MenuProvider } from 'react-native-popup-menu';
import realm from './database/Realm';
import AppNavigationContainer from './navigation/AppNavigationContainer';

const App: React.SFC = () => {
    useEffect(() => {
        realm.open();

        return () => {
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
