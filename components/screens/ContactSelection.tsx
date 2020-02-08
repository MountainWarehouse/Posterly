import React, { useState, useEffect } from 'react';
import { Button, H3, Text, List, ListItem, Icon, Body, View, Fab, Right } from 'native-base';
import { NavigationStackScreenComponent } from 'react-navigation-stack';
import { Parcel } from '../../models/Parcel';
import db from '../../database/Db';
import Loading from '../views/Loading';
import Screen from '../../navigation/Screen';
import PreferenceService from '../../services/PreferenceService';
import Search from '../Search';
import Contacts, { Contact } from 'react-native-contacts';
import { DisplayContact, toDisplayContact } from '../../models/DisplayContact';
import { sortArray } from '../../utils/ArrayUtil';

export interface RecipientSelectionParams {
    parcel: Parcel;
    search?: string;
}

const RecipientSelection: NavigationStackScreenComponent<RecipientSelectionParams> = ({ navigation }) => {
    const search = navigation.getParam('search', '');
    const [contacts, setContacts] = useState([] as DisplayContact[]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        db.getAllContacts().then(contacts => {
            setContacts(contacts);
            setIsLoading(false);
        });
    }, []);

    const lSearch = search.toLowerCase();
    const filteredContacts = contacts.filter(
        c => c.displayName.toLowerCase().includes(lSearch) || c.emailsText.toLowerCase().includes(lSearch)
    );

    const handleEditContact = (contact: Contact) => Contacts.openExistingContact(contact, handleSaveContact);
    const handleAddContact = () => Contacts.openContactForm({} as Contact, handleSaveContact);

    const handleSaveContact = async (error: any, contact: Contact | null) => {
        if (error) throw error;
        if (!contact) return;
        const index = contacts.findIndex(c => c.recordID === contact.recordID);
        const updatedContacts = [...contacts];
        if (index >= 0) {
            updatedContacts[index] = toDisplayContact(contact);
        } else {
            updatedContacts.push(toDisplayContact(contact));
            sortArray(updatedContacts, c => c.displayName);
        }
        setContacts(updatedContacts);
        handleSelectContact(contact);
    };

    const handleSelectContact = async (contact: Contact) => {
        const parcel = navigation.getParam('parcel');
        parcel.recipientRecordID = contact.recordID;
        parcel.recipient = toDisplayContact(contact);

        const { useShelf } = await PreferenceService.getAll();
        const nextScreen = useShelf ? Screen.Shelf : Screen.CheckIn;
        navigation.navigate(nextScreen, { parcel });
    };

    if (isLoading) return <Loading text="Loading contacts..." />;

    return (
        <View padder style={{ flex: 1 }}>
            <H3>Logging a new parcel</H3>
            <Text>Select parcel recipient or create a new one</Text>
            {contacts.length === 0 && <Text>No contacts found. Please create a new contact.</Text>}
            <List
                dataArray={filteredContacts}
                keyExtractor={(contact: DisplayContact) => contact.recordID}
                renderRow={(contact: DisplayContact) => (
                    <ListItem icon onPress={() => handleSelectContact(contact)}>
                        <Body>
                            <Text>{contact.displayName}</Text>
                            <Text note style={{ fontSize: 12 }}>
                                {contact.emailsText}
                            </Text>
                        </Body>
                        <Right>
                            <Button transparent onPress={() => handleEditContact(contact)}>
                                <Icon name="md-create" type="Ionicons" />
                            </Button>
                        </Right>
                    </ListItem>
                )}
            />
            <Fab
                style={{ backgroundColor: '#3f51b5' }}
                containerStyle={{ flex: 1 }}
                position="bottomRight"
                onPress={handleAddContact}
            >
                <Icon name="md-add" />
            </Fab>
        </View>
    );
};

RecipientSelection.navigationOptions = ({ navigation }) => ({
    headerTitle: (
        <Search onSearch={search => navigation.setParams({ search })} value={navigation.getParam('search', '')} />
    )
});

export default RecipientSelection;
