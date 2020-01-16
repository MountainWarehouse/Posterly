import React, { useState } from 'react';
import { Button, Content, H3, Text, List, ListItem, Icon, Body, Item, Input, NativeBase } from 'native-base';
import { Recipient } from '../models/Recipient_';
import styles from '../_shared/Styles';

export interface RecipientSelectionProps extends NativeBase.Content {
    onCreateRecipient: () => void;
    onSelectRecipient: (recipient: Recipient) => void;
    recipients: Recipient[];
}

const RecipientSelection: React.SFC<RecipientSelectionProps> = ({
    recipients,
    onCreateRecipient,
    onSelectRecipient,
    ...rest
}) => {
    const [search, setSearch] = useState('');

    const filteredRecipients = recipients.filter(
        u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Content {...rest}>
            <H3>Who is this parcel for?</H3>
            <Text>Select parcel recipient or create a new one</Text>
            <Button block bordered style={styles.button} onPress={onCreateRecipient}>
                <Icon name="md-person-add" />
                <Text>Create New Recipient </Text>
            </Button>
            <Item style={{ marginVertical: 5 }}>
                <Icon name="md-search" />
                <Input placeholder="Search" onChangeText={setSearch} />
                <Icon name="md-people" />
            </Item>
            <List
                dataArray={filteredRecipients}
                keyExtractor={(recipient: Recipient) => recipient.id.toString()}
                renderRow={(recipient: Recipient) => (
                    <ListItem onPress={() => onSelectRecipient(recipient)}>
                        <Body>
                            <Text>{recipient.name}</Text>
                            <Text style={{ fontSize: 12, fontStyle: 'italic' }}>{recipient.email}</Text>
                        </Body>
                    </ListItem>
                )}
            />
        </Content>
    );
};

export default RecipientSelection;
