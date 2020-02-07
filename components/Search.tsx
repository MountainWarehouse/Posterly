import React from 'react';
import { Item, Icon, Input, Button } from 'native-base';

export interface SearchProps {
    onSearch: (search: string) => void;
    placeholder?: string;
    value: string;
}

const Search: React.SFC<SearchProps> = ({ onSearch, placeholder = 'Search', value }) => {
    return (
        <Item>
            <Icon name="md-search" />
            <Input placeholder={placeholder} value={value} onChangeText={onSearch} />
            {value ? (
                <Button icon transparent onPress={() => onSearch('')}>
                    <Icon style={{ color: '#9E9E9E' }} name="md-close" />
                </Button>
            ) : null}
        </Item>
    );
};

export default Search;
