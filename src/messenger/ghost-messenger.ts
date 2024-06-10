import {
    ISendMessageRequest,
    ISendMessageResponse,
    IGetMessagesResponse,
    IRegisterResponse,
    getDefaultEncryptedMessengerClient,
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
import { IMessage, IRawMessage, MessageIO } from '../model/message';
import { IUser, IUserContext } from '../model/user';
import {
    decryptArrayBufferAsString,
    decryptMessage,
    decryptMessageAsString,
    encryptMessage,
    getKeyPair,
} from '../util/encryption';
import { FriendStore, IFriendsStore } from './friends-store';

export interface IGhostMessenger extends IEncryptedMessenger {}

export interface IGhostManagerProps extends IEncryptedMessengerProps {
    existingMessageStore?: IMessageStore<IMessageStoreMessage>;
    existingFriendsStore?: IFriendsStore;
}

export class GhostMessenger
    extends EncryptedMessenger
    implements IGhostMessenger
{
    private readonly _messageStore: IMessageStore<IMessageStoreMessage>;
    private readonly _friends: IFriendsStore;
    constructor(props: IGhostManagerProps) {
        super(props);
        this._messageStore = props.existingMessageStore ?? new MessageStore(); //TODO: call constructor of actual impl class once created for default
        this._friends = props.existingFriendsStore ?? new FriendStore();
    }

    async sendMessage(
        sendMessageRequest: ISendMessageRequest
    ): Promise<ISendMessageResponse> {
        const response = await super.sendMessage(sendMessageRequest);
        // this._messageStore.addMessage();
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
        const userContext: IUserContext = {
            user: {
                userId: response.user_id,
                userName: response.user_name, // TODO: fix serialization of key name from rust code.
            },
            encryptionKeyPair: encryptionKeys,
        };

        this.userContext = userContext;

        this._friends.addFriend({
            publicKey: userContext.encryptionKeyPair.publicKey,
            user: userContext.user,
        });

        return response;
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
                body: await decryptArrayBufferAsString(
                    message.message,
                    this.userContext!.encryptionKeyPair.privateKey
                ),
            });
        }

        return output;
    }

    protected async _getSendMessageEncryptionKey(
        sendMessageRequest: ISendMessageRequest
    ): Promise<CryptoKey> {
        return this._friends.getFriendById(sendMessageRequest.toUserId)!
            .publicKey;
    }

    private async _storeSendMessage(
        sendMessageRequest: ISendMessageRequest,
        sendMessageResponse: ISendMessageResponse
    ): Promise<void> {
        const { message, toUserId } = sendMessageRequest;
        const toFriend = this._friends.getFriendById(toUserId);
        const userContext = this.userContext!;

        const encryptedMessage = await encryptMessage(
            userContext.encryptionKeyPair.publicKey,
            message
        );
        const messageStoreMessage: IMessageStoreMessage = {
            sentAt: Date.now(), // TODO: Pull from response
            messageId: sendMessageResponse.messageId,
            message: encryptedMessage,
            toUser: toFriend!.user,
            fromUser: userContext.user,
            io: MessageIO.outbound,
        };

        this._messageStore.addMessage(messageStoreMessage);
    }

    private async _storeGetMessages(messages: IMessage[]): Promise<void> {
        const userContext = this.userContext!;
        console.log(`Messages in store get messages ${messages}`);
        // for (const message of messages) {
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            const encryptedMessage = await encryptMessage(
                userContext.encryptionKeyPair.publicKey,
                message.body
            );
            const messageStoreMessage: IMessageStoreMessage = {
                sentAt: message.sentAt,
                io: MessageIO.inbound,
                messageId: message.messageId,
                message: encryptedMessage,
                toUser: userContext.user,
                fromUser: this._friends.getFriendById(message.fromUserId)!.user,
            };
            this._messageStore.addMessage(messageStoreMessage);
        }
    }
    // protected async _decryptMessage(message: any): Promise<string> {
    //     return await decryptArrayBufferAsString(
    //         message,
    //         this.userContext!.encryptionKeyPair.privateKey
    //     );
    // }
}

export async function getGhostMessenger() {
    const keyPair = await getKeyPair();
    return new GhostMessenger({
        client: getDefaultEncryptedMessengerClient(),
    });
}
