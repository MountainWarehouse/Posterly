import React, { useState } from 'react';
import { Button, Content, Form, Text, Toast, NativeBase } from 'native-base';
import { Recipient } from '../models/recipient';
import { database } from '../database/database';
import { OutlinedTextField } from 'react-native-material-textfield';
import Joi from 'joi';
import styles from '../_shared/styles';

export interface RecipientFormProps extends NativeBase.Content {
    onRecipientCreated: (recipient: Recipient) => void;
    recipients: Recipient[];
}

const RecipientForm: React.SFC<RecipientFormProps> = ({ onRecipientCreated, recipients, ...rest }) => {
    const [data, setData]: [any, (data: any) => void] = useState({
        name: '',
        email: ''
    });
    const [errors, setErrors]: [any, (errors: any) => void] = useState({});

    const schema: any = {
        name: Joi.string()
            .required()
            .invalid(recipients.map(recipient => recipient.name))
            .insensitive()
            .error(ers =>
                ers.map(e => {
                    if (e.type === 'any.invalid') e.message = 'This name already exists';
                    return e;
                })
            )
            .label('Name'),
        email: Joi.string()
            .email({ minDomainAtoms: 2 })
            .required()
            .invalid(recipients.map(recipient => recipient.email))
            .insensitive()
            .error(ers =>
                ers.map(e => {
                    if (e.type === 'any.invalid') e.message = 'This email already exists';
                    return e;
                })
            )
            .label('Email')
    };

    const handleChange = (name: string, text: string) => {
        const newErrors = { ...errors };
        const newData = { ...data };
        const errorMessage = validateProperty(name, text);
        newErrors[name] = errorMessage;
        newData[name] = text;
        setData(newData);
        setErrors(newErrors);
    };

    const handleSubmit = async () => {
        const errors = validate();

        if (errors) return setErrors(errors);

        const recipient = await database.createRecipient(data.name, data.email);
        Toast.show({ text: `Recipient ${data.name} created!` });
        onRecipientCreated(recipient);
    };

    const validate = () => {
        const { error } = Joi.validate(data, schema, { abortEarly: false, stripUnknown: true });

        if (!error) return null;

        const errors: any = {};

        for (const item of error.details) {
            errors[item.path[0]] = item.message;
        }

        return errors;
    };

    const validateProperty = (name: string, value: string) => {
        const obj = { [name]: value };
        const propertySchema = { [name]: schema[name] };

        const { error } = Joi.validate(obj, propertySchema);

        return error ? error.details[0].message : null;
    };

    const isChanged = data.name || data.email ? true : false;
    const isValid = !validate();
    const disabled = !isChanged || !isValid;

    return (
        <Content {...rest}>
            <Form>
                <OutlinedTextField
                    label="Name"
                    value={data.name}
                    onChangeText={text => handleChange('name', text)}
                    error={errors.name}
                />
                <OutlinedTextField
                    label="Email"
                    value={data.email}
                    onChangeText={text => handleChange('email', text)}
                    error={errors.email}
                    title="Can be a distribution list if you want to inform multiple people"
                />
                <Button block success disabled={disabled} onPress={handleSubmit} style={styles.button}>
                    <Text>Create</Text>
                </Button>
            </Form>
        </Content>
    );
};

export default RecipientForm;
