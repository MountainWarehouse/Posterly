import React from 'react';
import { DeviceEventEmitter } from 'react-native';
import { Content, Button, Text } from 'native-base';
import { IIntent } from '../models/dwproperties';
import dataWedgeService from '../services/DataWedgeService';
import styles from '../_shared/styles';

export interface ScannerProps {
    tip: string;
    onScan: (code: string) => void;
}

export default class Scanner extends React.Component<ScannerProps> {
    constructor(props: ScannerProps) {
        super(props);

        DeviceEventEmitter.addListener('datawedge_broadcast_intent', this.handleBarcodeScanned);
        dataWedgeService.setBroadcastReceiver();
    }

    handleBarcodeScanned = (intent: IIntent) => {
        if (!intent.hasOwnProperty('RESULT_INFO')) {
            const scannedData = intent['com.symbol.datawedge.data_string'];
            if (scannedData) {
                DeviceEventEmitter.removeAllListeners();
                this.props.onScan(scannedData);
            }
        }
    };

    render() {
        const { tip } = this.props;
        return (
            <Content padder>
                <Text>{tip}</Text>
                <Button block style={styles.button} onPress={dataWedgeService.sendScanButtonPressed}>
                    <Text>Scan</Text>
                </Button>
            </Content>
        );
    }
}
