export interface IUser {
    userName: string;
    userId: string;
}

export interface IUserContext {
    encryptionKeyPair: CryptoKeyPair;
    user: IUser;
}
