import React, { useState, useEffect } from 'react';
import { Button, H3, Text, List, ListItem, Icon, Body, Item, Input, View, Fab, Right } from 'native-base';
import { Recipient } from '../../models/Recipient';
import { NavigationStackScreenComponent } from 'react-navigation-stack';
import { Parcel } from '../../models/Parcel';
import realm from '../../database/Realm';
import Loading from '../views/Loading';
import Screen from '../../navigation/Screen';
import PreferenceService from '../../services/PreferenceService';

export interface RecipientSelectionParams {
    parcel: Parcel;
}

const RecipientSelection: NavigationStackScreenComponent<RecipientSelectionParams> = ({ navigation }) => {
    const [search, setSearch] = useState('');
    const [recipients, setRecipients] = useState([] as Recipient[]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        realm.getAllRecipients().then(recipients => {
            setRecipients(recipients);
            setIsLoading(false);
        });
    }, []);

    const filteredRecipients = recipients.filter(
        u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelectRecipient = async (recipient: Recipient) => {
        const parcel = { ...navigation.getParam('parcel') };
        parcel.recipient = recipient;
        const { useShelf } = await PreferenceService.getAll();
        const nextScreen = useShelf ? Screen.Shelf : Screen.CheckIn;
        navigation.navigate(nextScreen, { parcel });
    };

    const handleCreateOrEditRecipient = (recipient?: Recipient) =>
        navigation.navigate(Screen.RecipientForm, {
            recipients,
            recipient: recipient ? recipient : { id: 0, name: '', email: '' },
            onRecipientSaved: (r: Recipient) => handleSelectRecipient(r)
        });

    return (
        <View padder style={{ flex: 1 }}>
            <H3>Who is this parcel for?</H3>
            <Text>Select parcel recipient or create a new one</Text>
            <Item style={{ marginVertical: 5 }}>
                <Icon name="md-search" />
                <Input placeholder="Search" onChangeText={setSearch} />
                <Icon name="md-people" />
            </Item>
            {isLoading ? (
                <Loading text="Loading recipients..." />
            ) : (
                <React.Fragment>
                    <List
                        dataArray={filteredRecipients}
                        keyExtractor={(recipient: Recipient) => recipient.id.toString()}
                        renderRow={(recipient: Recipient) => (
                            <ListItem icon onPress={() => handleSelectRecipient(recipient)}>
                                <Body>
                                    <Text>{recipient.name}</Text>
                                    <Text note>{recipient.email}</Text>
                                </Body>
                                <Right>
                                    <Button transparent onPress={() => handleCreateOrEditRecipient(recipient)}>
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
                        onPress={handleCreateOrEditRecipient}
                    >
                        <Icon name="md-add" />
                    </Fab>
                </React.Fragment>
            )}
        </View>
    );
};

RecipientSelection.navigationOptions = { title: 'Logging a new parcel' };

export default RecipientSelection;
