import React, { useState } from 'react';
import { Content, Button, Text } from 'native-base';
import { Package } from '../models/package';
import { User } from '../models/user';
import { TextField } from 'react-native-material-textfield';
import styles from '../_shared/styles';

export interface SummaryProps {
    parcel: Package;
    user: User;
    onConfirm: (signature: string) => void;
    onCancel: () => void;
    showSignature?: boolean;
    confirmText: string;
    tip?: string;
}

export interface SummaryState {
    signature: string;
}

export default class Summary extends React.Component<SummaryProps, SummaryState> {
    constructor(props: SummaryProps) {
        super(props);

        this.state = {
            signature: ''
        };
    }

    handleConfirm = (signature: string) => {
        this.props.onConfirm(signature);
    };

    render() {
        const { parcel, user, onCancel, showSignature, confirmText, tip } = this.props;
        const { signature } = this.state;
        const confirmDisabled = showSignature && !signature;
        return (
            <Content padder>
                <TextField label="Parcel No" value={parcel.ParcelBarcode} editable={false} />
                <TextField label="Recipient Name" value={user.UserName} editable={false} />
                <TextField label="Recipient Email" value={user.UserEmail} editable={false} />
                <TextField label="Shelf No" value={parcel.ShelfBarcode} editable={false} />
                {showSignature && (
                    <TextField
                        label="Person collecting parcel"
                        onChangeText={text => this.setState({ signature: text })}
                        value={signature}
                        placeholder="Type name of the person"
                    />
                )}
                {tip && <Text style={styles.tip}>{tip}</Text>}
                <Button
                    style={styles.button}
                    disabled={confirmDisabled}
                    block
                    success={!confirmDisabled}
                    onPress={() => this.handleConfirm(signature)}
                >
                    <Text>{confirmText}</Text>
                </Button>
                <Button style={styles.button} bordered block danger onPress={onCancel}>
                    <Text>Cancel</Text>
                </Button>
            </Content>
        );
    }
}
