import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Root } from 'native-base';
import { MenuProvider } from 'react-native-popup-menu';
import db from './database/Db';
import AppNavigationContainer from './navigation/AppNavigationContainer';

const App: React.SFC = () => {
    useEffect(() => {
        db.open();

        return () => {
            db.close();
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
