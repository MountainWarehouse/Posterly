import 'react-native-gesture-handler';
import React, { Component } from 'react';
import { AppState, Alert } from 'react-native';
import Home from './components/Home';
import Scanner from './components/Scanner';
import Summary from './components/Summary';
import RecipientSelection from './components/RecipientSelection';
import RecipientForm from './components/RecipientForm';
import { Parcel } from './models/Parcel';
import { Root, Toast, Button, Icon, Text, Grid, Col } from 'native-base';
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
import realm from './database/Realm';
import About from './components/About';
import styles from './_shared/Styles';
import * as arrayUtil from './utils/ArrayUtil';

export interface State {
    appState: string;
    parcel: Parcel;
    recipients: Recipient[];
    recipient: Recipient;
    preferences: IPreferences;
    parcelSearch: string;
}

class App extends Component<object, State> {
    constructor(props: any) {
        super(props);
        this.state = {
            appState: AppState.currentState,
            recipients: [],
            recipient: { id: 0, name: '', email: '' },
            parcel: {} as Parcel,
            preferences: {} as IPreferences,
            parcelSearch: ''
        };
    }

    public async componentDidMount() {
        await realm.open();

        const [recipients, preferences] = await Promise.all([realm.getAllRecipients(), PreferenceService.getAll()]);

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

        realm.close();
    }

    handleCheckIn = async (notify: boolean) => {
        const parcel = { ...this.state.parcel };
        parcel.checkInDate = new Date();
        await realm.createParcel(parcel);

        if (notify) {
            await emailService.sendParcelNotification(parcel);
            parcel.notificationCount++;
            await realm.updateParcel(parcel);
        } else {
            Toast.show({ text: 'Parcel has been checked in.' });
        }

        this.setState({ parcel: {} as Parcel }, () => this.navigateTo(Screen.Home));
    };

    handleCheckOut = async () => {
        const { parcel } = this.state;

        if (parcel.checkOutPerson === parcel.recipient.name) return this.checkOutParcel();

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
                            `Hello ${parcel.recipient.name},\n` +
                            `Your parcel no: ${parcel.barcode} has been checked out by ${parcel.checkOutPerson}.\n\n` +
                            'Have a great day!';
                        emailService.sendEmail(parcel.recipient.email, 'Your parcel has been checked out', body);
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
        await realm.updateParcel(parcel);
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
                        onCreateRecipient={this.handleCreateOrEditRecipient}
                        onEditRecipient={this.handleCreateOrEditRecipient}
                        recipients={this.state.recipients}
                    />
                ),
                navigationOptions: { title: 'Logging a new parcel' }
            },
            [Screen.RecipientForm]: {
                screen: () => (
                    <RecipientForm
                        padder
                        onRecipientSaved={this.handleRecipientSaved}
                        recipients={this.state.recipients}
                        recipient={this.state.recipient}
                    />
                ),
                navigationOptions: {
                    headerTitle: () => <Text>{this.state.recipient.id ? 'Edit' : 'Create New'} Recipient</Text>
                }
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
                        tip="When 'Save & Notify' is pressed the email for the parcel receiver will be generated."
                    />
                ),
                navigationOptions: {
                    headerLeft: this.cancelHeaderButton,
                    headerTitle: <Text>Check In Summary</Text>,
                    headerRight: () => (
                        <Grid>
                            <Col>
                                <Button hasText transparent onPress={() => this.handleCheckIn(false)}>
                                    <Text>Save</Text>
                                </Button>
                            </Col>
                            <Col>
                                <Button hasText transparent onPress={() => this.handleCheckIn(true)}>
                                    <Text>Save & Notify</Text>
                                </Button>
                            </Col>
                        </Grid>
                    )
                }
            },
            [Screen.CheckOut]: {
                screen: () => (
                    <CheckOut
                        padder
                        parcel={this.state.parcel}
                        onChangeCheckoutPerson={this.handleChangeCheckOutPerson}
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
                        <Grid>
                            <Col>
                                <Button hasText transparent onPress={this.handleNotify}>
                                    <Text>{this.state.parcel.notificationCount ? 'Remind' : 'Notify'}</Text>
                                </Button>
                            </Col>
                            <Col>
                                <Button
                                    hasText
                                    transparent
                                    onPress={this.handleCheckOut}
                                    disabled={!this.state.parcel.checkOutPerson}
                                >
                                    <Text>Check Out</Text>
                                </Button>
                            </Col>
                        </Grid>
                    )
                }
            },
            [Screen.Preferences]: {
                screen: () => (
                    <Preferences
                        padder
                        preferences={this.state.preferences}
                        onPreferencesChanged={this.handlePreferencesChanged}
                    />
                ),
                navigationOptions: { title: 'Settings', headerRight: null }
            },
            [Screen.ParcelBrowser]: {
                screen: () => (
                    <ParcelBrowser padder search={this.state.parcelSearch} onSelectParcel={this.handleSelectParcel} />
                ),
                navigationOptions: { title: 'Browse Parcels' }
            },
            [Screen.ParcelInfo]: {
                screen: () => <CheckOut padder parcel={this.state.parcel} />,
                navigationOptions: {
                    title: 'Parcel Info'
                }
            },
            [Screen.About]: {
                screen: () => <About padder />,
                navigationOptions: { title: 'Posterly', headerRight: null }
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
                                <MenuOption onSelect={() => this.navigateTo(Screen.Preferences)}>
                                    <Text style={styles.margin}>Settings</Text>
                                </MenuOption>
                                <MenuOption onSelect={() => this.navigateTo(Screen.About)}>
                                    <Text style={styles.margin}>About</Text>
                                </MenuOption>
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
        let parcel = await realm.findParcel(barcode);

        if (parcel) return this.handleSelectParcel(parcel);
        parcel = {
            barcode,
            checkInDate: new Date(),
            notificationCount: 0,
            recipient: {
                id: 0,
                name: '',
                email: ''
            }
        };
        return this.setState({ parcel }, () => this.navigateTo(Screen.RecipientSelection));
    };

    handleSelectParcel = (parcel: Parcel) => {
        this.setState({ parcel }, () => this.navigateTo(parcel.checkOutPerson ? Screen.ParcelInfo : Screen.CheckOut));
    };

    navigateTo = (screen: Screen) =>
        this.navigator && this.navigator.dispatch(NavigationActions.navigate({ routeName: screen }));

    handleRecipientSaved = (recipient: Recipient) => {
        const recipients = [...this.state.recipients];
        const index = recipients.findIndex(r => r.id === recipient.id);
        if (index < 0) {
            recipients.push(recipient);
        } else {
            recipients[index] = recipient;
        }
        arrayUtil.sortArray(recipients, r => r.name);

        this.setState({ recipients });
        this.handleSelectRecipient(recipient);
    };

    handleSelectRecipient = (recipient: Recipient) => {
        const parcel = { ...this.state.parcel };
        parcel.recipient = recipient;
        const nextScreen = this.state.preferences.useShelf ? Screen.Shelf : Screen.Summary;
        this.setState({ parcel }, () => this.navigateTo(nextScreen));
    };

    handleCreateOrEditRecipient = (recipient?: Recipient) => {
        this.setState({ recipient: recipient ? recipient : { id: 0, name: '', email: '' } }, () =>
            this.navigateTo(Screen.RecipientForm)
        );
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

    handleNotify = async () => {
        const parcel = { ...this.state.parcel };
        await emailService.sendParcelNotification(parcel);
        parcel.checkOutPerson = undefined;
        parcel.notificationCount++;
        await realm.updateParcel(parcel);
        this.setState({ parcel: {} as Parcel }, () => this.navigateTo(Screen.Home));
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
            realm.open();
        } else if (this.state.appState === 'active' && nextAppState.match(/inactive|background/)) {
            // App has moved from the foreground into the background (or become inactive)
            realm.close();
        }
        this.setState({ appState: nextAppState });
    };
}

export default App;
