import {
    ISendMessageRequest,
    ISendMessageResponse,
    IGetMessagesResponse,
    IRegisterResponse,
} from '../client';
import {
    IMessageStore,
    IMessageStoreMessage,
    MessageStore,
} from '../message-store';
import {
    EncryptedMessenger,
    IEncryptedMessenger,
    IEncryptedMessengerProps,
} from '../messenger';
import { IMessage, MessageIO } from '../model/message';
import { IBaseUserContext } from '../model/user';
import { IEncryptMessageResult, getKeyPair } from '../util/encryption';
import { FriendStore, IFriend, IFriendsStore } from './friends-store';

export interface IGhostMessenger extends IEncryptedMessenger {}

export interface IGhostManagerProps<USER_CONTEXT extends IBaseUserContext>
    extends IEncryptedMessengerProps<USER_CONTEXT> {
    existingMessageStore?: IMessageStore<IMessageStoreMessage>;
    existingFriendsStore?: IFriendsStore;
}

export abstract class GhostMessenger<USER_CONTEXT extends IBaseUserContext>
    extends EncryptedMessenger<USER_CONTEXT>
    implements IGhostMessenger
{
    protected readonly _messageStore: IMessageStore<IMessageStoreMessage>;
    protected readonly _friends: IFriendsStore;
    constructor(props: IGhostManagerProps<USER_CONTEXT>) {
        super(props);
        this._messageStore = props.existingMessageStore ?? new MessageStore(); //TODO: call constructor of actual impl class once created for default
        this._friends = props.existingFriendsStore ?? new FriendStore();
    }

    async sendMessage(
        sendMessageRequest: ISendMessageRequest
    ): Promise<ISendMessageResponse> {
        const response = await super.sendMessage(sendMessageRequest);
        await this._storeSendMessage(sendMessageRequest, response);
        return response;
    }

    async getMessages(): Promise<IGetMessagesResponse> {
        const response = await super.getMessages();
        await this._storeGetMessages(response);
        return response;
    }

    async register(userName: string): Promise<IRegisterResponse> {
        if (this.userContext) {
            throw new Error(
                'You cannot register because you are already registered!'
            );
        }
        let encryptionKeys = await getKeyPair();
        const response = (await super.register(userName)) as any;
        this._handleRegisterResponse(response, encryptionKeys);

        return response;
    }
    protected abstract _handleRegisterResponse(
        response: any,
        encryptionKeys: CryptoKeyPair
    ): Promise<void>;

    protected async _addFriend(friend: IFriend): Promise<void> {
        await this._friends.addFriend(friend);
    }

    async getCachedMessages(): Promise<IMessage[]> {
        const rawMessages = this._messageStore.getAllMessages();

        const output: IMessage[] = [];
        for (let message of rawMessages) {
            output.push({
                messageId: message.messageId,
                io: message.io,
                sentAt: message.sentAt,
                toUserId: message.toUser.userId,
                fromUserId: message.fromUser.userId,
                body: await this.decryptMessageFromStorageAsString(message),
            });
        }

        return output;
    }

    private async _storeSendMessage(
        sendMessageRequest: ISendMessageRequest,
        sendMessageResponse: ISendMessageResponse
    ): Promise<void> {
        const { message, toUserId } = sendMessageRequest;
        const toFriend = this._friends.getFriendById(toUserId);
        const userContext = this.userContext!;
        const messageId =
            sendMessageResponse.messageId ?? sendMessageResponse['message_id']; //TODO fix once serialization is fixed on rust code
        const messageToStore: IMessage = {
            sentAt: Date.now(), // TODO: Pull from response
            messageId,
            body: message,
            toUserId: toFriend!.user.userId,
            fromUserId: userContext.user.userId,
            io: MessageIO.outbound,
        };

        const encryptedMessage = await this._encryptMessageForStorage(
            messageToStore
        );

        // await encryptMessage(
        //     userContext.encryptionKeyPair.publicKey,
        //     message
        // );
        const messageStoreMessage: IMessageStoreMessage = {
            sentAt: messageToStore.sentAt, // TODO: Pull from response
            messageId,
            message: encryptedMessage.message,
            toUser: toFriend!.user,
            fromUser: userContext.user,
            io: MessageIO.outbound,
            iv: encryptedMessage.iv,
        };

        this._messageStore.addMessage(messageStoreMessage);
    }

    private async _storeGetMessages(messages: IMessage[]): Promise<void> {
        const userContext = this.userContext!;
        console.log(`Messages in store get messages ${messages}`);
        // for (const message of messages) {
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            const encryptedMessage = await this._encryptMessageForStorage(
                message
            );
            const messageStoreMessage: IMessageStoreMessage = {
                sentAt: message.sentAt,
                io: MessageIO.inbound,
                messageId: message.messageId,
                message: encryptedMessage.message,
                toUser: userContext.user,
                fromUser: this._friends.getFriendById(message.fromUserId)!.user,
                iv: message.iv,
            };
            this._messageStore.addMessage(messageStoreMessage);
        }
    }

    protected abstract _encryptMessageForStorage(
        message: IMessage
    ): Promise<IEncryptMessageResult>;

    protected abstract decryptMessageFromStorageAsString(
        message: IMessageStoreMessage
    ): Promise<string>;
}
