import React, { Component, Fragment } from "react";
import { AppState, StyleSheet, SafeAreaView, Linking } from "react-native";
import Scanner from "./components/Scanner";
import Summary from "./components/Summary";
import UserSelection from "./components/UserSelection";
import { database } from "./database/database";
import { Package } from "./models/package";
import { Root, Toast } from "native-base";
import { User } from "./models/user";

export interface State {
    appState: string;
    databaseIsReady: boolean;
    screen: Screen;
    countParcels: number;
    parcel: Package;
    user: User;
}

enum Screen {
    Parcel,
    User,
    Shelf,
    Summary,
    CheckOut
}

class App extends Component<object, State> {
    constructor(props: any) {
        super(props);
        this.state = {
            appState: AppState.currentState,
            databaseIsReady: false,
            screen: Screen.Parcel,
            countParcels: 0,
            user: { UserId: -1, UserName: "", UserEmail: "" },
            parcel: {} as Package
        };
        this.handleAppStateChange = this.handleAppStateChange.bind(this);
    }
    handleScanParcel = async (code: string) => {
        const result = await database.getPackageByBarocde(code);
        //goto CheckIN
        if (!result || result.length === 0) {
            const newParcel = new Package(code, this.state.countParcels + 1);
            return this.setState({
                screen: Screen.User,
                parcel: newParcel,
                countParcels: this.state.countParcels + 1,
                appState: "active"
            });
        }

        // goto CheckOUT
        const parcel = result[0];
        const user = (await database.getUserByUserId(parcel.User_Id))[0];
        this.setState({
            parcel,
            user,
            screen: Screen.CheckOut
        });
    };

    handleSelectUser = (user: User) => {
        const parcel = { ...this.state.parcel };
        parcel.User_Id = user.UserId;
        this.setState({
            parcel,
            user,
            screen: Screen.Shelf
        });
    };

    handleScanShelf = (code: string) => {
        const parcel = { ...this.state.parcel };
        parcel.ShelfBarcode = code;
        this.setState({ parcel, screen: Screen.Summary });
    };

    handleCheckIn = async () => {
        const { ParcelBarcode, ShelfBarcode } = this.state.parcel;
        await database.createPackage(ParcelBarcode, ShelfBarcode, this.state.user, "");
        this.sendEmail();
        this.setState({ screen: Screen.Parcel });
    };

    handleCheckOut = async (signature: string) => {
        const parcel = { ...this.state.parcel };
        await database.updatePackage(parcel.ParcelBarcode, signature);
        Toast.show({text: "Package has been checked out."})
        this.setState({ screen: Screen.Parcel });
    };

    public componentDidMount() {
        // App is starting up
        this.appIsNowRunningInForeground();
        this.setState({
            appState: "active"
        });
        // Listen for app state changes
        AppState.addEventListener("change", this.handleAppStateChange);
    }
    public componentWillUnmount() {
        // Remove app state change listener
        AppState.removeEventListener("change", this.handleAppStateChange);
    }

    render() {
        const { screen, parcel, user } = this.state;

        switch (screen) {
            case Screen.Parcel:
                return (
                    <Root>
                        <Scanner 
                            prompt="Scan Parcel..."
                            tip="Scan barcode of an incoming parcel."
                            onScan={this.handleScanParcel} 
                        />
                    </Root>
                );
            case Screen.User:
                return (
                    <Root>
                        <UserSelection onSelectUser={this.handleSelectUser} />
                    </Root>
                );
            case Screen.Shelf:
                return (
                    <Root>
                        <Scanner
                            prompt="Scan Shelf..."
                            tip="Place the parcel on a shelf and scan shelf barcode."
                            onScan={this.handleScanShelf}
                        />
                    </Root>
                );
            case Screen.Summary:
                return (
                    <Root>
                        <Summary
                            parcel={parcel}
                            user={user}
                            onConfirm={this.handleCheckIn}
                            onCancel={() => this.setState({ screen: Screen.Parcel })}
                            confirmText="Notify"
                            title="Check In Summary"
                            tip="When 'Notify' is pressed the email for the parcel receiver will be generated."
                        />
                    </Root>
                );
            case Screen.CheckOut:
                return (
                    <Root>
                        <Summary
                            showSignature
                            parcel={parcel}
                            user={user}
                            onConfirm={this.handleCheckOut}
                            onCancel={() => this.setState({ screen: Screen.Parcel })}
                            confirmText="Check Out"
                            title="Check Out Parcel"
                            tip="By pressing 'Check Out' you confirm that the provided person received the parcel."
                        />
                    </Root>
                );
        }
    }

    private  sendEmail() {
        const subject = "Your package is waiting for you!"
        const body = "Hello " + this.state.user.UserName + ",\n" +
            "Your package nr: " + this.state.parcel.ParcelId + " is waiting in reception\n" +
            "Look it by the shelf nr: " + this.state.parcel.ShelfBarcode + "\n";

        let url  = `mailto:${this.state.user.UserEmail}?subject=${subject}&body=${body}`;
        // check if we can use this link
        const canOpen = Linking.canOpenURL(url);

        if (!canOpen) {
            throw new Error("Provided URL can not be handled");
        }

        Linking.openURL(url);
    }

    // Handle the app going from foreground to background, and vice versa.
    private handleAppStateChange(nextAppState: string) {
        if (this.state.appState.match(/inactive|background/) && nextAppState === "active") {
            // App has moved from the background (or inactive) into the foreground
            this.appIsNowRunningInForeground();
        } else if (this.state.appState === "active" && nextAppState.match(/inactive|background/)) {
            // App has moved from the foreground into the background (or become inactive)
            this.appHasGoneToTheBackground();
        }
        this.setState({ appState: nextAppState });
    }

    // Code to run when app is brought to the foreground
    private appIsNowRunningInForeground() {
        console.log("App is now running in the foreground!");
        return database.open().then(() =>
            this.setState({
                databaseIsReady: true
            })
        );
    }

    // Code to run when app is sent to the background
    private appHasGoneToTheBackground() {
        console.log("App has gone to the background.");
        database.close();
    }
}

export default App;
