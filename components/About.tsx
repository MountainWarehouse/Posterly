import React from 'react';
import { View, ListItem, Body, Text, NativeBase } from 'native-base';
const { version } = require('../package.json');

export interface AboutProps extends NativeBase.View {}

const About: React.SFC<AboutProps> = ({ ...rest }) => {
    return (
        <View {...rest}>
            <ListItem>
                <Body>
                    <Text>App Version</Text>
                    <Text note>{version}</Text>
                </Body>
            </ListItem>
        </View>
    );
};

export default About;
