import React, { useState, useEffect } from 'react';
import { Button, H3, Text, List, ListItem, Icon, Body, Item, Input, NativeBase, View, Fab } from 'native-base';
import { Recipient } from '../models/Recipient';

export interface RecipientSelectionProps extends NativeBase.View {
    onCreateRecipient: () => void;
    onSelectRecipient: (recipient: Recipient) => void;
    onEditRecipient: (recipient: Recipient) => void;
    recipients: Recipient[];
}

const RecipientSelection: React.SFC<RecipientSelectionProps> = ({
    recipients: propsRecipients,
    onCreateRecipient,
    onSelectRecipient,
    onEditRecipient,
    ...rest
}) => {
    const [search, setSearch] = useState('');
    const [recipients, setRecipients] = useState(propsRecipients);
    useEffect(() => {
        setRecipients(propsRecipients);
    }, [propsRecipients]);

    const filteredRecipients = recipients.filter(
        u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <View {...rest} style={{ flex: 1 }}>
            <H3>Who is this parcel for?</H3>
            <Text>Select parcel recipient or create a new one</Text>
            <Item style={{ marginVertical: 5 }}>
                <Icon name="md-search" />
                <Input placeholder="Search" onChangeText={setSearch} />
                <Icon name="md-people" />
            </Item>
            <List
                dataArray={filteredRecipients}
                keyExtractor={(recipient: Recipient) => recipient.id.toString()}
                renderRow={(recipient: Recipient) => (
                    <ListItem icon onPress={() => onSelectRecipient(recipient)}>
                        <Body>
                            <Text>{recipient.name}</Text>
                            <Text style={{ fontSize: 12, fontStyle: 'italic' }}>{recipient.email}</Text>
                        </Body>
                        <Button transparent onPress={() => onEditRecipient(recipient)}>
                            <Icon name="md-create" type="Ionicons" />
                        </Button>
                    </ListItem>
                )}
            />
            <Fab
                style={{ backgroundColor: '#3f51b5' }}
                containerStyle={{ flex: 1 }}
                position="bottomRight"
                onPress={onCreateRecipient}
            >
                <Icon name="md-add" />
            </Fab>
        </View>
    );
};

export default RecipientSelection;
