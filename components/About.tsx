import React from 'react';
import { Content, ListItem, Body, Text, NativeBase } from 'native-base';
const { version } = require('../package.json');

export interface AboutProps extends NativeBase.Content {}

const About: React.SFC<AboutProps> = ({ ...rest }) => {
    return (
        <Content {...rest}>
            <ListItem>
                <Body>
                    <Text>App Version</Text>
                    <Text note>{version}</Text>
                </Body>
            </ListItem>
        </Content>
    );
};

export default About;
