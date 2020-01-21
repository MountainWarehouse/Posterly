import DataWedgeIntents from 'react-native-datawedge-intents';
import { BarcodeConfig, IntentConfig } from '../DataWedge/DataWedgeProperties';

const DataWedgeService = {
    sendScanButtonPressed(): void {
        sendBroadcastWithExtras('com.symbol.datawedge.api.SOFT_SCAN_TRIGGER', 'TOGGLE_SCANNING');
    },
    setBroadcastReceiver(): void {
        setDecoders();
        registerBroadcastReceiver();
    }
};

const sendBroadcastWithExtras = (extraName: string, extraValue: any): void => {
    var broadcastExtras: any = {};
    broadcastExtras[extraName] = extraValue;
    broadcastExtras['SEND_RESULT'] = false;
    DataWedgeIntents.sendBroadcastWithExtras({
        action: 'com.symbol.datawedge.api.ACTION',
        extras: broadcastExtras
    });
};

const sendCommand = (extraName: string, extraValue: any) => {
    var broadcastExtras: any = {};
    broadcastExtras[extraName] = extraValue;
    broadcastExtras['SEND_RESULT'] = false;
    DataWedgeIntents.sendBroadcastWithExtras({
        action: 'com.symbol.datawedge.api.ACTION',
        extras: broadcastExtras
    });
};

const setDecoders = () => {
    sendCommand('com.symbol.datawedge.api.CREATE_PROFILE', 'posterly');
    //  Configure the created profile (associated app and keyboard plugin)
    sendCommand('com.symbol.datawedge.api.SET_CONFIG', BarcodeConfig);
    //  Configure the created profile (intent plugin)
    sendCommand('com.symbol.datawedge.api.SET_CONFIG', IntentConfig);
    //  Give some time for the profile to settle then query its value
    setTimeout(() => {
        sendCommand('com.symbol.datawedge.api.GET_ACTIVE_PROFILE', '');
    }, 1000);
};

const registerBroadcastReceiver = () => {
    DataWedgeIntents.registerBroadcastReceiver({
        filterActions: ['com.zebra.posterly.ACTION', 'com.symbol.datawedge.api.RESULT_ACTION'],
        filterCategories: ['android.intent.category.DEFAULT']
    });
};

export default DataWedgeService;
