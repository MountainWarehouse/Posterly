import React, { Component } from 'react';
import { Button, Content, Form, Item, Input, Label, Text, Toast } from 'native-base';
import { User } from '../models/user';
import { database } from '../database/database';
import styles from '../_shared/styles';

export interface UserFormProps {
    onUserCreated: (user: User) => void;
    users: User[];
}

export interface UserFormState {
    name: string;
    email: string;
}

export default class UserForm extends Component<UserFormProps, UserFormState> {
    constructor(props: UserFormProps) {
        super(props);
        this.state = {
            name: '',
            email: ''
        };
    }

    handleSubmit = async () => {
        const { name, email } = this.state;
        const user = await database.createUser(name, email);
        Toast.show({ text: `Recipient ${name} created!` });
        this.props.onUserCreated(user);
    };

    isValid = (): boolean => {
        // TODO: Provide validation for the user name and email and unique
        const { name, email } = this.state;
        return !(!name || !email);
    };

    render() {
        const { name, email } = this.state;

        return (
            <Content padder>
                <Form>
                    <Item stackedLabel>
                        <Label>Name</Label>
                        <Input value={name} onChangeText={(text: string) => this.setState({ name: text })} />
                    </Item>
                    <Item stackedLabel>
                        <Label>Email</Label>
                        <Label style={{ fontStyle: 'italic' }}>
                            Can be a distribution list if you want to inform multiple people
                        </Label>
                        <Input value={email} onChangeText={(text: string) => this.setState({ email: text })} />
                    </Item>
                    <Button block success disabled={!this.isValid()} onPress={this.handleSubmit} style={styles.button}>
                        <Text>Create</Text>
                    </Button>
                </Form>
            </Content>
        );
    }
}
