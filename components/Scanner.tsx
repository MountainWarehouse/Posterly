import React from "react";
import { StyleSheet, DeviceEventEmitter } from "react-native";
import {
    Container,
    Content,
    Card,
    Button,
    Text,
    Header,
    CardItem,
    Body,
    Title,
    Right,
    StyleProvider
} from "native-base";
import { IIntent } from "../models/dwproperties";
import dataWedgeService from "../services/DataWedgeService";
import getTheme from "../native-base-theme/components";
import commonColor from "../native-base-theme/variables/commonColor";

export interface ScannerProps {
    prompt: string;
    tip?: string;
    onScan: (code: string) => void;
}

export default class Scanner extends React.Component<ScannerProps> {
    static navigationOptions = {
        title: "Scanner"
    };

    constructor(props: ScannerProps) {
        super(props);

        DeviceEventEmitter.addListener("datawedge_broadcast_intent", this.handleBarcodeScanned);
        dataWedgeService.setBroadcastReceiver();
    }

    handleBarcodeScanned = (intent: IIntent) => {
        if (!intent.hasOwnProperty("RESULT_INFO")) {
            const scannedData = intent["com.symbol.datawedge.data_string"];
            if (scannedData) {
                DeviceEventEmitter.removeAllListeners();
                this.props.onScan(scannedData);
            }
        }
    };

    render() {
        const { prompt, tip } = this.props;
        return (
            <StyleProvider style={getTheme(commonColor)}>
                <Container style={{ backgroundColor: "#204132" }}>
                    <Header transparent style={{ backgroundColor: "#204132" }}>
                        <Right>
                            <Body>
                                <Title>Posterly</Title>
                            </Body>
                        </Right>
                    </Header>
                    <Content>
                        <Card transparent style={styles.maincard}>
                            <Title>{prompt}</Title>
                            <CardItem style={styles.card}>
                                <Button full style={styles.scanButton} onPress={dataWedgeService.sendScanButtonPressed}>
                                    <Text>Scan</Text>
                                </Button>
                            </CardItem>
                            {tip && <Text style={styles.tip}>{tip}</Text>}
                        </Card>
                    </Content>
                </Container>
            </StyleProvider>
        );
    }
}

const styles = StyleSheet.create({
    maincard: {
        flex: 3,
        alignItems: "center",
        justifyContent: "center"
    },
    card: {
        flex: 2,
        backgroundColor: "#204132"
    },
    scanButton: {
        flex: 1,
        borderRadius: 10,
        backgroundColor: "#8CC63F"
    },
    tip: {
        color: "grey",
        fontStyle: "italic"
    }
});
