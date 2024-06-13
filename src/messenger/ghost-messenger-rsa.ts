import {
    ISendMessageRequest,
    getDefaultEncryptedMessengerClient,
} from '../client';
import {
    IMessageStore,
    IMessageStoreMessage,
    MessageStore,
} from '../message-store';
import {
    IEncryptSendMessageResult,
    IEncryptedMessenger,
    IEncryptedMessengerProps,
} from '../messenger';
import { IMessage, IRawMessage, MessageIO } from '../model/message';
import { IUserContext } from '../model/user';
import { bufferToNumberArray } from '../util/encode';
import {
    IEncryptMessageResult,
    decryptArrayBufferAsString,
    decryptMessageAsString,
    encryptMessage,
    getKeyPair,
} from '../util/encryption';
import { IFriendsStore } from './friends-store';
import { GhostMessenger } from './ghost-messenger';

export interface IGhostMessenger extends IEncryptedMessenger {}

export interface IGhostManagerRSAProps
    extends IEncryptedMessengerProps<IUserContext> {
    existingMessageStore?: IMessageStore<IMessageStoreMessage>;
    existingFriendsStore?: IFriendsStore;
}

export class GhostMessengerRSA
    extends GhostMessenger<IUserContext>
    implements IGhostMessenger
{
    constructor(props: IGhostManagerRSAProps) {
        super(props);
    }

    protected async _handleRegisterResponse(response: any): Promise<void> {
        let encryptionKeys = await getKeyPair();
        const userContext: IUserContext = {
            user: {
                userId: response.userId ?? response.user_id,
                userName: response.userName ?? response.user_name, // TODO: fix serialization of key name from rust code.
            },
            encryptionKeyPair: encryptionKeys,
        };

        this.userContext = userContext;

        await this._addFriend({
            publicKey: userContext.encryptionKeyPair.publicKey,
            user: userContext.user,
        });
    }

    protected async encryptSendMessage(
        sendMessageRequest
    ): Promise<IEncryptSendMessageResult> {
        let encryptionKey = await this._getSendMessageEncryptionKey(
            sendMessageRequest
        );

        const encryptedMessage = await encryptMessage(
            encryptionKey,
            sendMessageRequest.message
        );

        let message = bufferToNumberArray(encryptedMessage);
        return {
            message,
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
        return {
            message: await encryptMessage(
                this.userContext!.encryptionKeyPair.publicKey,
                message
            ),
        };
    }

    protected async decryptMessageFromStorageAsString(
        message: IMessageStoreMessage
    ): Promise<string> {
        return await decryptArrayBufferAsString(
            message.message,
            this.userContext!.encryptionKeyPair.privateKey
        );
    }

    protected async _decryptMessage(message: IRawMessage): Promise<string> {
        return await decryptMessageAsString(
            message.body,
            this.userContext!.encryptionKeyPair.privateKey
        );
    }
}

export async function getGhostMessengerRSA() {
    const keyPair = await getKeyPair();
    return new GhostMessengerRSA({
        client: getDefaultEncryptedMessengerClient(),
    });
}
