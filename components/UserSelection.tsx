import React from 'react';
import { Button, Content, H3, Text, List, ListItem, Icon, Body } from 'native-base';
import { User } from '../models/user';
import styles from '../_shared/styles';

export interface UserSelectionProps {
    onCreateUser: () => void;
    onSelectUser: (user: User) => void;
    users: User[];
}

const UserSelection: React.SFC<UserSelectionProps> = ({ users, onCreateUser, onSelectUser }) => {
    return (
        <Content padder>
            <H3>Who is this parcel for?</H3>
            <Text>Select parcel recipient or create a new one</Text>
            <Button block bordered style={styles.button} onPress={onCreateUser}>
                <Icon name="md-person-add" />
                <Text>Create New Recipient </Text>
            </Button>
            <List
                dataArray={users}
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
