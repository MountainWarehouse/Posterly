import 'react-native-gesture-handler';
import React, { Component } from 'react';
import { AppState, Linking } from 'react-native';
import Scanner from './components/Scanner';
import Summary from './components/Summary';
import UserSelection from './components/UserSelection';
import UserForm from './components/UserForm';
import { database } from './database/database';
import { Package } from './models/package';
import { Root, Toast } from 'native-base';
import { User } from './models/user';
import { createAppContainer, NavigationContainerComponent, NavigationActions } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import Screen from './_shared/Screen';

export interface State {
    appState: string;
    databaseIsReady: boolean;
    countParcels: number;
    parcel: Package;
    user: User;
    users: User[];
}

class App extends Component<object, State> {
    constructor(props: any) {
        super(props);
        this.state = {
            appState: AppState.currentState,
            databaseIsReady: false,
            countParcels: 0,
            user: { UserId: -1, UserName: '', UserEmail: '' },
            users: [],
            parcel: {} as Package
        };

        this.handleAppStateChange = this.handleAppStateChange.bind(this);
    }

    appNavigator = createStackNavigator(
        {
            [Screen.Parcel]: {
                screen: () => (
                    <Scanner tip="Scan barcode of a parcel to check in or out" onScan={this.handleScanParcel} />
                ),
                navigationOptions: { title: 'Scan Parcel' }
            },
            [Screen.UserSelection]: {
                screen: () => (
                    <UserSelection
                        onSelectUser={this.handleSelectUser}
                        onCreateUser={() => this.navigateTo(Screen.UserCreation)}
                        users={this.state.users}
                    />
                ),
                navigationOptions: { title: 'Logging a new parcel' }
            },
            [Screen.UserCreation]: {
                screen: () => <UserForm onUserCreated={this.handleUserCreated} users={this.state.users} />,
                navigationOptions: { title: 'Create New Recipient' }
            },
            [Screen.Shelf]: {
                screen: () => (
                    <Scanner tip="Place the parcel on a shelf and scan shelf barcode" onScan={this.handleScanShelf} />
                ),
                navigationOptions: { title: 'Scan Shelf' }
            },
            [Screen.Summary]: {
                screen: () => (
                    <Summary
                        parcel={this.state.parcel}
                        user={this.state.user}
                        onConfirm={this.handleCheckIn}
                        onCancel={() => this.navigateTo(Screen.Parcel)}
                        confirmText="Notify"
                        tip="When 'Notify' is pressed the email for the parcel receiver will be generated"
                    />
                ),
                navigationOptions: { title: 'Check In Summary' }
            },
            [Screen.CheckOut]: {
                screen: () => (
                    <Summary
                        showSignature
                        parcel={this.state.parcel}
                        user={this.state.user}
                        onConfirm={this.handleCheckOut}
                        onCancel={() => this.navigateTo(Screen.Parcel)}
                        confirmText="Check Out"
                        tip="By pressing 'Check Out' you confirm that the provided person received the parcel"
                    />
                ),
                navigationOptions: { title: 'Check Out Parcel' }
            }
        },
        {
            initialRouteName: Screen.Parcel
        }
    );

    AppNavigationContainer = createAppContainer(this.appNavigator);

    navigator: NavigationContainerComponent | null = null;

    handleScanParcel = async (code: string) => {
        const result = await database.getPackageByBarocde(code);
        //goto CheckIN
        if (!result || result.length === 0) {
            const newParcel = new Package(code, this.state.countParcels + 1);
            return this.setState(
                {
                    parcel: newParcel,
                    countParcels: this.state.countParcels + 1,
                    appState: 'active'
                },
                () => this.navigateTo(Screen.UserSelection)
            );
        }

        // goto CheckOUT
        const parcel = result[0];
        const user = (await database.getUserByUserId(parcel.User_Id))[0];
        this.setState(
            {
                parcel,
                user
            },
            () => this.navigateTo(Screen.CheckOut)
        );
    };

    navigateTo = (screen: Screen) =>
        this.navigator && this.navigator.dispatch(NavigationActions.navigate({ routeName: screen }));

    handleUserCreated = (user: User) => {
        const users = [...this.state.users];
        users.push(user);
        this.setState({ users });
        this.handleSelectUser(user);
    };

    handleSelectUser = (user: User) => {
        const parcel = { ...this.state.parcel };
        parcel.User_Id = user.UserId;
        this.setState(
            {
                parcel,
                user
            },
            () => this.navigateTo(Screen.Shelf)
        );
    };

    handleScanShelf = (code: string) => {
        const parcel = { ...this.state.parcel };
        parcel.ShelfBarcode = code;
        this.setState({ parcel }, () => this.navigateTo(Screen.Summary));
    };

    handleCheckIn = async () => {
        const { ParcelBarcode, ShelfBarcode } = this.state.parcel;
        await database.createPackage(ParcelBarcode, ShelfBarcode, this.state.user, '');
        this.sendEmail();
        this.navigateTo(Screen.Parcel);
    };

    handleCheckOut = async (signature: string) => {
        const parcel = { ...this.state.parcel };
        await database.updatePackage(parcel.ParcelBarcode, signature);
        Toast.show({ text: 'Package has been checked out.' });
        this.navigateTo(Screen.Parcel);
    };

    public async componentDidMount() {
        // App is starting up
        await this.appIsNowRunningInForeground();
        const users = await database.getAllUsers();
        this.setState({
            appState: 'active',
            users
        });
        // Listen for app state changes
        AppState.addEventListener('change', this.handleAppStateChange);
    }
    public componentWillUnmount() {
        // Remove app state change listener
        AppState.removeEventListener('change', this.handleAppStateChange);
    }

    render = () => (
        <Root>
            <this.AppNavigationContainer ref={nav => (this.navigator = nav)} />
        </Root>
    );

    private sendEmail() {
        const subject = 'Your package is waiting for you!';
        const body =
            'Hello ' +
            this.state.user.UserName +
            ',\n' +
            'Your package nr: ' +
            this.state.parcel.ParcelId +
            ' is waiting in reception\n' +
            'Look it by the shelf nr: ' +
            this.state.parcel.ShelfBarcode +
            '\n';

        let url = `mailto:${this.state.user.UserEmail}?subject=${subject}&body=${body}`;
        // check if we can use this link
        const canOpen = Linking.canOpenURL(url);

        if (!canOpen) {
            throw new Error('Provided URL can not be handled');
        }

        Linking.openURL(url);
    }

    // Handle the app going from foreground to background, and vice versa.
    private handleAppStateChange(nextAppState: string) {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            // App has moved from the background (or inactive) into the foreground
            this.appIsNowRunningInForeground();
        } else if (this.state.appState === 'active' && nextAppState.match(/inactive|background/)) {
            // App has moved from the foreground into the background (or become inactive)
            this.appHasGoneToTheBackground();
        }
        this.setState({ appState: nextAppState });
    }

    // Code to run when app is brought to the foreground
    private appIsNowRunningInForeground() {
        console.log('App is now running in the foreground!');
        return database.open().then(() =>
            this.setState({
                databaseIsReady: true
            })
        );
    }

    // Code to run when app is sent to the background
    private appHasGoneToTheBackground() {
        console.log('App has gone to the background.');
        database.close();
    }
}

export default App;
