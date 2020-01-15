import React, { useState } from 'react';
import { Button, Content, H3, Text, List, ListItem, Icon, Body, Item, Input, NativeBase } from 'native-base';
import { User } from '../models/user';
import styles from '../_shared/styles';

export interface UserSelectionProps extends NativeBase.Content {
    onCreateUser: () => void;
    onSelectUser: (user: User) => void;
    users: User[];
}

const UserSelection: React.SFC<UserSelectionProps> = ({ users, onCreateUser, onSelectUser, ...rest }) => {
    const [search, setSearch] = useState('');

    const filteredUsers = users.filter(
        u =>
            u.UserName.toLowerCase().includes(search.toLowerCase()) ||
            u.UserEmail.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Content {...rest}>
            <H3>Who is this parcel for?</H3>
            <Text>Select parcel recipient or create a new one</Text>
            <Button block bordered style={styles.button} onPress={onCreateUser}>
                <Icon name="md-person-add" />
                <Text>Create New Recipient </Text>
            </Button>
            <Item style={{ marginVertical: 5 }}>
                <Icon name="md-search" />
                <Input placeholder="Search" onChangeText={setSearch} />
                <Icon name="md-people" />
            </Item>
            <List
                dataArray={filteredUsers}
                keyExtractor={(user: User) => user.UserId.toString()}
                renderRow={(user: User) => (
                    <ListItem onPress={() => onSelectUser(user)}>
                        <Body>
                            <Text>{user.UserName}</Text>
                            <Text style={{ fontSize: 12, fontStyle: 'italic' }}>{user.UserEmail}</Text>
                        </Body>
                    </ListItem>
                )}
            />
        </Content>
    );
};

export default UserSelection;
