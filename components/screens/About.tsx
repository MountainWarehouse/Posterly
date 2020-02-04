import React from 'react';
import { View, ListItem, Body, Text } from 'native-base';
import { NavigationStackScreenComponent } from 'react-navigation-stack';
const { version } = require('../../package.json');

const About: NavigationStackScreenComponent = () => {
    return (
        <View>
            <ListItem>
                <Body>
                    <Text>App Version</Text>
                    <Text note>{version}</Text>
                </Body>
            </ListItem>
        </View>
    );
};

About.navigationOptions = {
    title: 'Posterly',
    headerRight: null
};

export default About;
