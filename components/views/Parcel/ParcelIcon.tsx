import * as React from 'react';
import { Icon } from 'native-base';

export interface ParcelIconProps {
    checkedOut?: boolean;
    size?: number;
}

const ParcelIcon: React.SFC<ParcelIconProps> = ({ checkedOut, size }) => {
    const style: any = { color: checkedOut ? '#27a844' : '#17a2b7' };
    if (size) {
        style.fontSize = size;
    }

    return (
        <Icon
            name={checkedOut ? 'package-variant' : 'package-variant-closed'}
            style={style}
            type="MaterialCommunityIcons"
        />
    );
};

export default ParcelIcon;
