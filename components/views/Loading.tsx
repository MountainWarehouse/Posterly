import React from 'react';
import { View, Spinner, Text, H1 } from 'native-base';

export type LoadingProps = {
    header?: string;
    text: string;
};

const Loading: React.SFC<LoadingProps> = ({ header, text }) => {
    return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
            {header && <H1 style={{ textAlign: 'center' }}>{header}</H1>}
            <Spinner color="blue" />
            <Text style={{ textAlign: 'center' }}>{text}</Text>
        </View>
    );
};

export default Loading;
