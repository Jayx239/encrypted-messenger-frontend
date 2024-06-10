import { IUser } from '../model/user';

export interface IFriend {
    user: IUser;
    publicKey: CryptoKey;
}

export interface IFriendsStore {
    addFriend(addFriendProps: IFriend): void;
    getFriendById(friendId: string): IFriend | undefined;
}

export class FriendStore implements IFriendsStore {
    private readonly _messages: Map<string, IFriend>;

    constructor() {
        this._messages = new Map<string, IFriend>();
    }

    addFriend(friend: IFriend) {
        this._messages.set(friend.user.userId, friend);
    }

    getFriendById(friendId: string): IFriend | undefined {
        return this._messages.get(friendId);
    }
}
