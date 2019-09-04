export interface IProperties {
    PROFILE_NAME: string;
    PROFILE_ENABLED: string;
    CONFIG_MODE: string;
    PLUGIN_CONFIG: {
        PLUGIN_NAME: string;
        RESET_CONFIG: string;
        PARAM_LIST: {
            intent_output_enabled?: string;
            intent_action?: string;
            intent_delivery?: string;
        };
    };
    APP_LIST?: [
        {
            PACKAGE_NAME: string;
            ACTIVITY_LIST: Array<string>;
        }
    ];
}

export interface IIntent {
    "com.symbol.datawedge.data_string": string;
    "com.symbol.datawedge.label_type": string;
    "com.symbol.datawedge.source": string;
    v2API: boolean;
}

export var BarcodeConfig: IProperties = {
    PROFILE_NAME: "posterly",
    PROFILE_ENABLED: "true",
    CONFIG_MODE: "UPDATE",
    PLUGIN_CONFIG: {
        PLUGIN_NAME: "BARCODE",
        RESET_CONFIG: "true",
        PARAM_LIST: {}
    },
    APP_LIST: [
        {
            PACKAGE_NAME: "com.posterly",
            ACTIVITY_LIST: ["*"]
        }
    ]
};

export var IntentConfig: IProperties = {
    PROFILE_NAME: "posterly",
    PROFILE_ENABLED: "true",
    CONFIG_MODE: "UPDATE",
    PLUGIN_CONFIG: {
        PLUGIN_NAME: "INTENT",
        RESET_CONFIG: "true",
        PARAM_LIST: {
            intent_output_enabled: "true",
            intent_action: "com.zebra.posterly.ACTION",
            intent_delivery: "2"
        }
    }
};
