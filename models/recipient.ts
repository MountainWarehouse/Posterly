export class Recipient {
    id: number;
    name: string;
    email: string;
    //TODO: Check id in the ctor
    constructor(name: string, email: string, id: number) {
        this.email = email;
        this.name = name;
        this.id = id;
    }
}
