import React, { useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { Content, Button, Text, NativeBase } from 'native-base';
import { IDataWedgeIntent } from '../DataWedge/DataWedgeProperties';
import dataWedgeService from '../services/DataWedgeService';
import styles from '../_shared/Styles';

export interface ScannerProps extends NativeBase.Content {
    tip: string;
    onScan: (code: string) => void;
}

const Scanner: React.SFC<ScannerProps> = ({ tip, onScan, ...rest }) => {
    const handleBarcodeScanned = (intent: IDataWedgeIntent) => {
        if (!intent.hasOwnProperty('RESULT_INFO')) {
            const scannedData = intent['com.symbol.datawedge.data_string'];
            if (scannedData) {
                DeviceEventEmitter.removeAllListeners();
                onScan(scannedData);
            }
        }
    };

    useEffect(() => {
        DeviceEventEmitter.addListener('datawedge_broadcast_intent', handleBarcodeScanned);
        dataWedgeService.setBroadcastReceiver();
    }, []);

    return (
        <Content {...rest}>
            <Text>{tip}</Text>
            <Button block style={styles.button} onPress={dataWedgeService.sendScanButtonPressed}>
                <Text>Scan</Text>
            </Button>
        </Content>
    );
};

export default Scanner;
