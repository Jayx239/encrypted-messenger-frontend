import {
    ISendMessageRequest,
    getDefaultEncryptedMessengerClient,
} from '../client';
import { IMessageStore, IMessageStoreMessage } from '../message-store';
import {
    IEncryptSendMessageResult,
    IEncryptedMessenger,
    IEncryptedMessengerProps,
} from '../messenger';
import { IMessage, IRawMessage, MessageIO } from '../model/message';
import { IUser, IUserContext, IUserContextAES } from '../model/user';
import { bufferToNumberArray, numberArrayToBufer } from '../util/encode';
import { IEncryptMessageResult } from '../util/encryption';
import {
    decryptArrayBufferAsString,
    decryptMessageAsString,
    encryptMessage,
    getEncryptionKeyAES,
} from '../util/encryption-aes';
import { IFriendsStore } from './friends-store';
import { GhostMessenger } from './ghost-messenger';

export interface IGhostMessengerAES extends IEncryptedMessenger {}

export interface IGhostManagerAESProps
    extends IEncryptedMessengerProps<IUserContextAES> {
    existingMessageStore?: IMessageStore<IMessageStoreMessage>;
    existingFriendsStore?: IFriendsStore;
}

export class GhostMessengerAES
    extends GhostMessenger<IUserContextAES>
    implements IGhostMessengerAES
{
    constructor(props: IGhostManagerAESProps) {
        super(props);
    }

    protected async _handleRegisterResponse(response: any): Promise<void> {
        let encryptionKey = await getEncryptionKeyAES();
        const userContext: IUserContextAES = {
            user: {
                userId: response.userId ?? response.user_id,
                userName: response.userName ?? response.user_name, // TODO: fix serialization of key name from rust code.
            },
            encryptionKey,
        };

        this.userContext = userContext;

        await this._addFriend({
            publicKey: encryptionKey,
            user: userContext.user,
        });
    }

    protected async encryptSendMessage(
        sendMessageRequest
    ): Promise<IEncryptSendMessageResult> {
        let encryptionKey = await this._getSendMessageEncryptionKey(
            sendMessageRequest
        );
        const encryptMessageResult = await encryptMessage(
            sendMessageRequest.message,
            encryptionKey
        );

        let message = bufferToNumberArray(encryptMessageResult.message);
        return {
            message,
            iv: encryptMessageResult.iv,
        };
    }

    protected async _getSendMessageEncryptionKey(
        sendMessageRequest: ISendMessageRequest
    ): Promise<CryptoKey> {
        return this._friends.getFriendById(sendMessageRequest.toUserId)!
            .publicKey;
    }

    protected async _encryptMessageForStorage(
        message: IMessage
    ): Promise<IEncryptMessageResult> {
        return await encryptMessage(
            message.body,
            this.userContext!.encryptionKey
        );
    }

    protected async decryptMessageFromStorageAsString(
        message: IMessageStoreMessage
    ): Promise<string> {
        return await decryptArrayBufferAsString(
            message.message,
            this.userContext!.encryptionKey,
            message.iv!
        );
    }

    protected async _decryptMessage(message: IRawMessage): Promise<string> {
        return await decryptMessageAsString(
            message.body,
            this.userContext!.encryptionKey,
            numberArrayToBufer(message.iv!)
        );
    }
}

export async function getGhostMessengerAES() {
    return new GhostMessengerAES({
        client: getDefaultEncryptedMessengerClient(),
    });
}
