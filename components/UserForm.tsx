import React, { Component } from 'react';
import { Button, Content, Form, Text, Toast } from 'native-base';
import { User } from '../models/user';
import { database } from '../database/database';
import { OutlinedTextField } from 'react-native-material-textfield';
import Joi from 'joi';
import styles from '../_shared/styles';

export interface UserFormProps {
    onUserCreated: (user: User) => void;
    users: User[];
}

export interface UserFormState {
    data: {
        name: string;
        email: string;
    };
    errors: any;
}

export default class UserForm extends Component<UserFormProps, UserFormState> {
    constructor(props: UserFormProps) {
        super(props);
        this.state = {
            data: {
                name: '',
                email: ''
            },
            errors: {}
        };
    }

    schema: any = {
        name: Joi.string()
            .required()
            .label('Name'),
        email: Joi.string()
            .email({ minDomainAtoms: 2 })
            .required()
            .label('Email')
    };

    handleChange = (name: string, text: string) => {
        const errors = { ...this.state.errors };
        const errorMessage = this.validateProperty(name, text);
        errors[name] = errorMessage;

        const data: any = { ...this.state.data };
        data[name] = text;
        this.setState({ data, errors });
    };

    handleSubmit = async () => {
        const errors = this.validate();

        if (errors) {
            return this.setState({ errors });
        }
        const { name, email } = this.state.data;
        const user = await database.createUser(name, email);
        Toast.show({ text: `Recipient ${name} created!` });
        this.props.onUserCreated(user);
    };

    validate = () => {
        const { error } = Joi.validate(this.state.data, this.schema, { abortEarly: false, stripUnknown: true });

        if (!error) return null;

        const errors: any = {};

        for (const item of error.details) {
            errors[item.path[0]] = item.message;
        }

        return errors;
    };

    validateProperty = (name: string, value: string) => {
        const obj = { [name]: value };
        const schema = { [name]: this.schema[name] };

        const { error } = Joi.validate(obj, schema);

        return error ? error.details[0].message : null;
    };

    render() {
        const { name, email } = this.state.data;
        const { errors } = this.state;
        const isChanged = name || email ? true : false;
        const isValid = !this.validate();
        const disabled = !isChanged || !isValid;

        return (
            <Content padder>
                <Form>
                    <OutlinedTextField
                        label="Name"
                        value={name}
                        onChangeText={text => this.handleChange('name', text)}
                        error={errors.name}
                    />
                    <OutlinedTextField
                        label="Email"
                        value={email}
                        onChangeText={text => this.handleChange('email', text)}
                        error={errors.email}
                    />
                    <Text style={{ fontStyle: 'italic', color: 'grey', fontSize: 14 }}>
                        Can be a distribution list if you want to inform multiple people
                    </Text>
                    <Button block success disabled={disabled} onPress={this.handleSubmit} style={styles.button}>
                        <Text>Create</Text>
                    </Button>
                </Form>
            </Content>
        );
    }
}
