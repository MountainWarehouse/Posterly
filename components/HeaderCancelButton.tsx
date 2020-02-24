import * as React from 'react';
import { Button, Icon } from 'native-base';

export interface HeaderCancelButtonProps {
    onPress: () => void;
}

const HeaderCancelButton: React.SFC<HeaderCancelButtonProps> = ({ onPress }) => {
    return (
        <Button transparent onPress={onPress}>
            <Icon name="md-close" />
        </Button>
    );
};

export default HeaderCancelButton;
