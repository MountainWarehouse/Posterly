export interface Recipient {
    id: number;
    name: string;
    email: string;
}

export const recipientSchema = {
    name: 'Recipient',
    primaryKey: 'id',
    properties: {
        id: 'int',
        name: 'string',
        email: 'string'
    }
};
