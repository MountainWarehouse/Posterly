export class User {
    UserId: number;
    UserName: string;
    UserEmail: string;
    constructor(userName: string, userEmail: string, userId : number) {
        this.UserEmail = userEmail;
        this.UserName = userName;
        this.UserId = userId;

    }
}
