export interface IUser {
    userName: string;
    userId: string;
}

export interface IBaseUserContext {
    user: IUser;
}

export interface IUserContext extends IBaseUserContext {
    encryptionKeyPair: CryptoKeyPair;
}

export interface IUserContextAES extends IBaseUserContext {
    encryptionKey: CryptoKey;
}
