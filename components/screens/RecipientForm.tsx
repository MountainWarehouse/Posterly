import React, { useState } from 'react';
import { Button, View, Form, Text, Toast } from 'native-base';
import { Recipient } from '../../models/Recipient';
import { TextField } from 'react-native-material-textfield';
import Joi from 'joi';
import styles from '../../_shared/Styles';
import realm from '../../database/Realm';
import { NavigationStackScreenComponent } from 'react-navigation-stack';

export interface RecipientFormParams {
    recipients: Recipient[];
    recipient: Recipient;
    onRecipientSaved: (recipient: Recipient) => void;
}

const RecipientForm: NavigationStackScreenComponent<RecipientFormParams> = ({ navigation }) => {
    const recipient = navigation.getParam('recipient');
    const onRecipientSaved = navigation.getParam('onRecipientSaved');
    const [data, setData]: [Recipient, (data: Recipient) => void] = useState({ ...recipient });
    const [errors, setErrors]: [any, (errors: any) => void] = useState({});

    const otherRecipients = navigation.getParam('recipients', []).filter(r => r.id !== recipient.id);
    const schema: any = {
        name: Joi.string()
            .required()
            .invalid(otherRecipients.map(recipient => recipient.name))
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
            .invalid(otherRecipients.map(recipient => recipient.email))
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
        const newData: any = { ...data };
        const errorMessage = validateProperty(name, text);
        newErrors[name] = errorMessage;
        newData[name] = text;
        setData(newData);
        setErrors(newErrors);
    };

    const handleSubmit = async () => {
        const errors = validate();

        if (errors) return setErrors(errors);

        const submittedRecipient = data.id
            ? await realm.updateRecipient(data)
            : await realm.createRecipient(data.name, data.email);
        Toast.show({ text: `Recipient ${data.name} saved.` });
        onRecipientSaved(submittedRecipient);
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

    const isChanged = data.name !== recipient.name || data.email !== recipient.email;
    const isValid = !validate();
    const disabled = !isChanged || !isValid;

    return (
        <View padder>
            <Form>
                <TextField
                    label="Name"
                    value={data.name}
                    onChangeText={text => handleChange('name', text)}
                    placeholder="Type name"
                    error={errors.name}
                />
                <TextField
                    label="Email"
                    placeholder="Type email"
                    value={data.email}
                    onChangeText={text => handleChange('email', text)}
                    error={errors.email}
                    title="Can be a distribution list if you want to inform multiple people"
                />
                <Button block success disabled={disabled} onPress={handleSubmit} style={styles.button}>
                    <Text>Save</Text>
                </Button>
            </Form>
        </View>
    );
};

RecipientForm.navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('recipient', {} as Recipient).id ? 'Edit Recipient' : 'Create New Recipient'
});

export default RecipientForm;
