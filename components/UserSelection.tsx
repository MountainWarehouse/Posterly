import React, { Component } from 'react';
import { StyleSheet, Alert, View, TouchableOpacity } from 'react-native';
import { Button, Text, Toast } from 'native-base';
import { User } from '../models/user';
import Autocomplete from 'react-native-autocomplete-input';
import { database } from '../database/database';

export interface UserSelectionProps {
    onSelectUser: (user: User) => void;
}

export interface UserSelectionState {
    id?: number;
    name: string;
    email: string;
    users: User[];
}

export default class UserSelection extends Component<UserSelectionProps, UserSelectionState> {
    constructor(props: UserSelectionProps) {
        super(props);
        this.state = {
            name: '',
            email: '',
            users: []
        };
    }

    async componentDidMount() {
        const users = await database.getAllUsers();
        this.setState({users});
    }

    handleSubmit = () => {
        if (this.isNewUser())
            return this.confirmAndCreateNewUser();
        
        //TODO: Provide some validation or handle the user creation in here
        const { id, name, email } = this.state;

        const user: User = {
            UserId: id ? id : -1,
            UserName: name,
            UserEmail: email
        };

        this.props.onSelectUser(user);
    };

    confirmAndCreateNewUser = () => {
        Alert.alert(
            'Create new user',
            'Are you sure you want to create a new user?',
            [{ text: 'OK', onPress: this.createNewUser }, { text: 'Cancel', onPress: () => {}, style: 'cancel' }],
            { cancelable: false }
        );
    };

    createNewUser = async () => {
        const { name, email } = this.state;
        const user = await database.createUser(name, email);
        Toast.show({ text: `User ${name} created!`});
        this.props.onSelectUser(user);
    }

    selectUser = (user: User) => {
        this.setState({
            id: user.UserId,
            name: user.UserName,
            email: user.UserEmail
        });
    };

    isNewUser = (): boolean => {
        const { name, email, users } = this.state;
        return users.findIndex(u => u.UserName === name && u.UserEmail === email) < 0;
    }

    isValid = (): boolean => {
        // TODO: Provide validation for the user name and email
        const { name, email } = this.state;
        return !(!name || !email);
    }

    render() {
        const { name, email, users } = this.state;
        const filteredUsers = users.filter(
            u =>
                (name ? u.UserName.toLowerCase().indexOf(name.toLowerCase()) >= 0 : true) &&
                (email ? u.UserEmail.toLowerCase().indexOf(email.toLowerCase()) >= 0 : true)
        );

        return (
            <View>
                <Text>Enter Name and E-mail</Text>
                <View style={styles.nameContainer}>
                    <Autocomplete
                        placeholder="Name"
                        data={
                            !name || (filteredUsers.length === 1 && filteredUsers[0].UserName.toLowerCase().trim() === name.toLowerCase())
                                ? []
                                : filteredUsers
                        }
                        containerStyle={styles.nameAutocompleteContainer}
                        defaultValue={name}
                        onChangeText={(text: string) => this.setState({ name: text })}
                        renderItem={({ item: user }: { item: User }) => (
                            <TouchableOpacity style={styles.autoCompleteListItem} onPress={() => this.selectUser(user)}>
                                <Text style={styles.itemText}>{user.UserName}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
                <View style={styles.emailContainer}>
                    <Autocomplete
                        placeholder="Email"
                        data={
                            !email || (filteredUsers.length === 1 && filteredUsers[0].UserEmail.toLowerCase().trim() === email.toLowerCase())
                                ? []
                                : filteredUsers
                        }
                        containerStyle={styles.emailAutocompleteContainer}
                        defaultValue={email}
                        onChangeText={(text: string) => this.setState({ email: text })}
                        renderItem={({ item: user }: { item: User }) => (
                            <TouchableOpacity style={styles.autoCompleteListItem} onPress={() => this.selectUser(user)}>
                                <Text style={styles.itemText}>{user.UserEmail}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
                <Button 
                    info={this.isValid() && !this.isNewUser()}
                    success={this.isValid() &&this.isNewUser()}
                    full
                    onPress={this.handleSubmit}
                    disabled={!this.isValid()}
                >
                    <Text>{this.isNewUser() ? 'Create' : 'Select'}</Text>
                </Button>
                <Text style={styles.tip}>Create a new user or select an existing one to notify about incoming parcel.</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    nameContainer: {
        flex: 1,
        paddingTop: 25
    },
    emailContainer: {
        flex: 2,
        paddingTop: 150
    },
    nameAutocompleteContainer: {
        flex: 1,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 100
    },
    emailAutocompleteContainer: {
        flex: 2,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 100,
        zIndex: 100
    },
    itemText: {
        fontSize: 20,
        margin: 2
    },
    autoCompleteListItem: {
        zIndex: 100
    },
    tip: {
        color: "grey",
        fontStyle: "italic"
    }
});
