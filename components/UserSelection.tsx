import React from 'react';
import { Button, Content, H3, Text, List, ListItem, Left, Right, Icon } from 'native-base';
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
                <Text>Create New Recipient</Text>
            </Button>
            <List
                dataArray={users}
                renderRow={(user: User) => (
                    <ListItem button onPress={() => onSelectUser(user)}>
                        <Text>{user.UserName}</Text>
                    </ListItem>
                )}
                keyExtractor={(user: User) => user.UserId.toString()}
            />
        </Content>
    );
};

export default UserSelection;
