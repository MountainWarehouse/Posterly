import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import Screen from './Screen';
import Home from '../components/screens/Home';
import ContactSelection from '../components/screens/ContactSelection';
import Shelf from '../components/screens/Shelf';
import CheckIn from '../components/screens/CheckIn';
import CheckOut from '../components/screens/CheckOut';
import Preferences from '../components/screens/Preferences';
import ParcelBrowser from '../components/screens/ParcelBrowser';
import ParcelInfo from '../components/screens/ParcelInfo';
import About from '../components/screens/About';
import { Button, Icon, Text } from 'native-base';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import styles from '../_shared/Styles';

const appNavigator = createStackNavigator(
    {
        [Screen.Home]: Home,
        [Screen.ContactSelection]: ContactSelection,
        [Screen.Shelf]: Shelf,
        [Screen.CheckIn]: CheckIn,
        [Screen.CheckOut]: CheckOut,
        [Screen.Preferences]: Preferences,
        [Screen.ParcelBrowser]: ParcelBrowser,
        [Screen.ParcelInfo]: ParcelInfo,
        [Screen.About]: About
    },
    {
        initialRouteName: Screen.Home,
        defaultNavigationOptions: ({ navigation }) => ({
            headerRight: (
                <Button dark transparent>
                    <Menu>
                        <MenuTrigger>
                            <Icon name="md-more" />
                        </MenuTrigger>
                        <MenuOptions>
                            <MenuOption onSelect={() => navigation.navigate(Screen.Preferences)}>
                                <Text style={styles.margin}>Settings</Text>
                            </MenuOption>
                            <MenuOption onSelect={() => navigation.navigate(Screen.About)}>
                                <Text style={styles.margin}>About</Text>
                            </MenuOption>
                        </MenuOptions>
                    </Menu>
                </Button>
            )
        })
    }
);

const AppNavigationContainer = createAppContainer(appNavigator);

export default AppNavigationContainer;
