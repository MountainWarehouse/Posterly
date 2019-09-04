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
                this.props.onScan(scannedData);
            }
        }
    };

    handleMockBarcode = () => {
        var barcodes = ["0705632441947", "977123456703", "416000336108", "416000336123423408", "41600033610342348"];
        var barcode: string = barcodes[Math.floor(Math.random() * barcodes.length)];
        this.props.onScan(barcode);
    };

    // dataWedgeService.sendScanButtonPressed

    render() {
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
                            <Title>{this.props.prompt}</Title>
                            <CardItem style={styles.card}>
                                <Button full style={styles.scanButton} onPress={this.handleMockBarcode}>
                                    <Text>Tan</Text>
                                </Button>
                            </CardItem>
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
    }
});
