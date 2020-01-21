import 'react-native-gesture-handler';
import React, { Component } from 'react';
import { AppState, Alert } from 'react-native';
import Home from './components/Home';
import Scanner from './components/Scanner';
import Summary from './components/Summary';
import RecipientSelection from './components/RecipientSelection';
import RecipientForm from './components/RecipientForm';
import { database } from './database/Database';
import { Parcel } from './models/Parcel';
import { Root, Toast, Button, Icon, Text } from 'native-base';
import { Recipient } from './models/Recipient';
import { createAppContainer, NavigationContainerComponent, NavigationActions } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import Screen from './_shared/Screen';
import CheckOut from './components/CheckOut';
import * as emailService from './services/EmailService';
import Preferences from './components/Preferences';
import IPreferences from './_shared/IPreferences';
import PreferenceService from './services/PreferenceService';
import { MenuProvider, Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import ParcelBrowser from './components/Parcel/ParcelBrowser';

export interface State {
    appState: string;
    parcel: Parcel;
    recipients: Recipient[];
    preferences: IPreferences;
    parcelSearch: string;
}

class App extends Component<object, State> {
    constructor(props: any) {
        super(props);
        this.state = {
            appState: AppState.currentState,
            recipients: [],
            parcel: {} as Parcel,
            preferences: {} as IPreferences,
            parcelSearch: ''
        };
    }

    public async componentDidMount() {
        await database.open();
        const [recipients, preferences] = await Promise.all([database.getAllRecipients(), PreferenceService.getAll()]);
        this.setState({
            appState: 'active',
            recipients,
            preferences
        });

        // Listen for app state changes
        AppState.addEventListener('change', this.handleAppStateChange);
    }
    public componentWillUnmount() {
        // Remove app state change listener
        AppState.removeEventListener('change', this.handleAppStateChange);
    }

    handleCheckIn = async () => {
        const parcel = { ...this.state.parcel };
        const recipient = parcel.recipient ? parcel.recipient : ({} as Recipient);
        await database.createParcel(parcel);
        parcel.checkInDate = new Date();

        const shelfInfo = parcel.shelfBarcode ? `Look it by the shelf no: ${parcel.shelfBarcode}.\n` : '';
        const body =
            `Hello ${recipient.name},\n` +
            `Your parcel no: ${parcel.barcode} is waiting in reception.\n` +
            shelfInfo +
            '\nHave a great day!';
        emailService.sendEmail(recipient.email as string, 'Your parcel is waiting for you!', body);
        this.setState({ parcel: {} as Parcel });
        this.navigateTo(Screen.Home);
    };

    handleCheckOut = async () => {
        const { parcel } = this.state;
        const recipient = parcel.recipient ? parcel.recipient : ({} as Recipient);

        if (parcel.checkOutPerson === recipient.name) return this.checkOutParcel();

        Alert.alert(
            'Notify?',
            'Person collecting parcel is different than the parcel recipient.\n' +
                'Do you want to notify the original recipient that the parcel has been received?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'No',
                    onPress: this.checkOutParcel
                },
                {
                    text: 'Yes',
                    onPress: () => {
                        const body =
                            `Hello ${recipient.name},\n` +
                            `Your parcel no: ${parcel.barcode} has been checked out by ${parcel.checkOutPerson}.\n\n` +
                            'Have a great day!';
                        emailService.sendEmail(recipient.email, 'Your parcel has been checked out', body);
                        this.checkOutParcel();
                    }
                }
            ],
            { cancelable: false }
        );
    };

    checkOutParcel = async () => {
        const parcel = { ...this.state.parcel };
        if (!parcel.checkOutPerson) {
            return Alert.alert(
                'Error',
                'You need to specify person who collected parcel in order to proceed with checkout.'
            );
        }

        parcel.checkOutDate = new Date();
        await database.updateParcel(parcel);
        Toast.show({ text: 'Parcel has been checked out.' });
        this.setState({ parcel: {} as Parcel });
        this.navigateTo(Screen.Home);
    };

    cancelHeaderButton = (
        <Button transparent onPress={() => this.navigateTo(Screen.Home)}>
            <Icon name="md-close" />
        </Button>
    );

    appNavigator = createStackNavigator(
        {
            [Screen.Home]: {
                screen: () => <Home padder onScan={this.handleScanParcel} onSearchParcels={this.handleSearchParcels} />,
                navigationOptions: { title: 'Scan Parcel' }
            },
            [Screen.RecipientSelection]: {
                screen: () => (
                    <RecipientSelection
                        padder
                        onSelectRecipient={this.handleSelectRecipient}
                        onCreateRecipient={() => this.navigateTo(Screen.RecipientCreation)}
                        recipients={this.state.recipients}
                    />
                ),
                navigationOptions: { title: 'Logging a new parcel' }
            },
            [Screen.RecipientCreation]: {
                screen: () => (
                    <RecipientForm
                        padder
                        onRecipientCreated={this.handleRecipientCreated}
                        recipients={this.state.recipients}
                    />
                ),
                navigationOptions: { title: 'Create New Recipient' }
            },
            [Screen.Shelf]: {
                screen: () => (
                    <Scanner
                        padder
                        tip="Place the parcel on a shelf and scan shelf barcode"
                        onScan={this.handleScanShelf}
                    />
                ),
                navigationOptions: { title: 'Scan Shelf' }
            },
            [Screen.Summary]: {
                screen: () => (
                    <Summary
                        padder
                        parcel={this.state.parcel}
                        tip="When 'Notify' is pressed the email for the parcel receiver will be generated"
                    />
                ),
                navigationOptions: {
                    headerLeft: this.cancelHeaderButton,
                    headerTitle: <Text>Check In Summary</Text>,
                    headerRight: () => (
                        <Button hasText transparent onPress={this.handleCheckIn}>
                            <Text>Notify</Text>
                        </Button>
                    )
                }
            },
            [Screen.CheckOut]: {
                screen: () => (
                    <CheckOut
                        padder
                        parcel={this.state.parcel}
                        onChangeCheckoutPerson={this.handleChangeCheckOutPerson}
                        tip="By pressing 'Check Out' you confirm that the person has collected the parcel"
                    />
                ),
                navigationOptions: {
                    headerLeft: (
                        <Button transparent onPress={() => this.navigateTo(Screen.Home)}>
                            <Icon name="md-close" />
                        </Button>
                    ),
                    headerTitle: <Text>Check Out Parcel</Text>,
                    headerRight: () => (
                        <Button
                            hasText
                            transparent
                            onPress={this.handleCheckOut}
                            disabled={!this.state.parcel.checkOutPerson}
                        >
                            <Text>Check Out</Text>
                        </Button>
                    )
                }
            },
            [Screen.Preferences]: {
                screen: () => (
                    <Preferences
                        preferences={this.state.preferences}
                        onPreferencesChanged={this.handlePreferencesChanged}
                    />
                ),
                navigationOptions: { title: 'Settings', headerRight: null }
            },
            [Screen.ParcelBrowser]: {
                screen: () => (
                    <ParcelBrowser search={this.state.parcelSearch} onSelectParcel={this.handleSelectParcel} />
                ),
                navigationOptions: { title: 'Browse Parcels' }
            }
        },
        {
            initialRouteName: Screen.Home,
            defaultNavigationOptions: {
                headerRight: (
                    <Button dark transparent>
                        <Menu>
                            <MenuTrigger>
                                <Icon name="md-more" />
                            </MenuTrigger>
                            <MenuOptions>
                                <MenuOption onSelect={() => this.navigateTo(Screen.Preferences)} text="Settings" />
                            </MenuOptions>
                        </Menu>
                    </Button>
                )
            }
        }
    );

    AppNavigationContainer = createAppContainer(this.appNavigator);

    navigator: NavigationContainerComponent | null = null;

    handleSearchParcels = (search: string) => {
        this.setState({ parcelSearch: search }, () => this.navigateTo(Screen.ParcelBrowser));
    };

    handleChangeCheckOutPerson = (checkOutPerson: string) => {
        const parcel = { ...this.state.parcel };
        parcel.checkOutPerson = checkOutPerson;
        this.setState({ parcel });
    };

    handleScanParcel = async (barcode: string) => {
        let parcel = await database.getParcelByBarcode(barcode, true);
        //goto CheckIN
        if (!parcel) {
            parcel = {
                barcode,
                id: 0,
                checkInDate: new Date(),
                recipientId: 0,
                recipient: {
                    id: 0,
                    name: '',
                    email: ''
                }
            };
            return this.setState({ parcel }, () => this.navigateTo(Screen.RecipientSelection));
        }

        // goto CheckOUT
        this.setState({ parcel }, () => this.navigateTo(Screen.CheckOut));
    };

    handleSelectParcel = (parcel: Parcel) => {
        this.setState({ parcel }, () => this.navigateTo(Screen.CheckOut));
    };

    navigateTo = (screen: Screen) =>
        this.navigator && this.navigator.dispatch(NavigationActions.navigate({ routeName: screen }));

    handleRecipientCreated = (recipient: Recipient) => {
        const recipients = [...this.state.recipients];
        recipients.push(recipient);
        this.setState({ recipients });
        this.handleSelectRecipient(recipient);
    };

    handleSelectRecipient = (recipient: Recipient) => {
        const parcel = { ...this.state.parcel };
        parcel.recipientId = recipient.id;
        parcel.recipient = recipient;
        const nextScreen = this.state.preferences.useShelf ? Screen.Shelf : Screen.Summary;
        this.setState({ parcel }, () => this.navigateTo(nextScreen));
    };

    handleScanShelf = (code: string) => {
        const parcel = { ...this.state.parcel };
        parcel.shelfBarcode = code;
        this.setState({ parcel }, () => this.navigateTo(Screen.Summary));
    };

    handlePreferencesChanged = async (preferences: IPreferences) => {
        const currentPreferences = { ...this.state.preferences };

        PreferenceService.setAll(preferences)
            .then(() => this.setState({ preferences }))
            .catch(() => this.setState({ preferences: currentPreferences }));
    };

    render = () => (
        <MenuProvider>
            <Root>
                <this.AppNavigationContainer ref={nav => (this.navigator = nav)} />
            </Root>
        </MenuProvider>
    );

    // Handle the app going from foreground to background, and vice versa.
    handleAppStateChange = (nextAppState: string) => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            // App has moved from the background (or inactive) into the foreground
            database.open();
        } else if (this.state.appState === 'active' && nextAppState.match(/inactive|background/)) {
            // App has moved from the foreground into the background (or become inactive)
            database.close();
        }
        this.setState({ appState: nextAppState });
    };
}

export default App;
