import React, { useState, useEffect } from "react";
import { View, Text, Dimensions, StyleSheet, TextInput, BackHandler, TouchableOpacity } from "react-native";
import { 
    Container, 
    Content, 
    Card, 
    Button, 
    Header, 
    Item,
    Input,
    CardItem, 
    Body, 
    Title,
    Right, 
    StyleProvider, 
    Left 
} from "native-base";
import { Package } from "../models/package";
import { User } from "../models/user";

export interface SummaryProps {
    parcel: Package;
    user: User;
    onConfirm: (signature: string) => void;
    onCancel: () => void;
    showSignature?: boolean;
    title: string;
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
            signature: ""
        };
    }

    handleConfirm = (signature: string) => {
        this.props.onConfirm(signature);
        //TODO:
        // this.setState({
        //     signature: signaText
        // });
    };

    render() {
        const { parcel, user, onCancel, showSignature, confirmText, title, tip } = this.props;
        const { signature } = this.state;
        const confirmDisabled = showSignature && !signature;
        return (
            <Content padder>
                <Header>
                    <Body>
                        <Title>{title}</Title>
                    </Body>
                </Header>
                <Content>
                    <Card>
                        <CardItem>
                            <Text>Parcel No: </Text>
                            <Text>{parcel.ParcelBarcode}</Text>
                        </CardItem>
                        <CardItem>
                            <Text>Name: </Text>
                            <Text>{user.UserName}</Text>
                        </CardItem>
                        <CardItem>
                            <Text>E-Mail: </Text>
                            <Text>{user.UserEmail}</Text>
                        </CardItem>
                        <CardItem>
                            <Text>Shelf No: </Text>
                            <Text>{parcel.ShelfBarcode}</Text>
                        </CardItem>
                        {showSignature && (
                            <CardItem>
                                <Content>
                                        <Text>Parcel Recipient: </Text>
                                    <Item>
                                        <Input
                                            onChangeText={text => this.setState({ signature: text })}
                                            value={signature}
                                            placeholder="Type recipient name"
                                            placeholderTextColor="grey"
                                        />
                                    </Item>
                                </Content>
                            </CardItem>
                        )}
                        <CardItem />
                        <CardItem>
                            <Button 
                                style={styles.button}
                                disabled={confirmDisabled}
                                full
                                success={!confirmDisabled}
                                onPress={() => this.handleConfirm(signature)}
                            >
                                <Text>{confirmText}</Text>
                            </Button>
                        </CardItem>
                        <CardItem>
                            <Button style={styles.button} full danger onPress={onCancel}>
                                <Text>Cancel</Text>
                            </Button>
                        </CardItem>
                    </Card>
                </Content>
                {tip && <Text style={styles.tip}>{tip}</Text>}
            </Content>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    buttonContainer: {
        flex: 1
    },
    button: {
        flex: 1,
        borderRadius: 10
    },
    tip: {
        color: "grey",
        fontStyle: "italic"
    }
});
