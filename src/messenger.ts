import { arrayBuffer } from 'stream/consumers';
import {
    EncryptedMessengerClient,
    IEncryptedMessengerClient,
    IGetMessagesResponse,
    ISendMessageRequest,
    ISendMessageResponse,
    ISendMessageClientRequest,
    getDefaultEncryptedMessengerClient,
    IRegisterResponse,
} from './client';
import {
    decodeMessage,
    decryptMessage,
    decryptMessageAsString,
    encryptMessage,
    getKeyPair,
} from './util/encryption';
import {
    bufferToNumberArray,
    numberArrayToBufer,
    convertBufferToString,
} from './util/encode';
import { IUser, IUserContext } from './model/user';
import { IMessage, IRawMessage } from './model/message';

export interface IEncryptedMessenger {
    sendMessage(
        sendMessageRequest: ISendMessageRequest
    ): Promise<ISendMessageResponse>;
    getMessages(): Promise<IGetMessagesResponse>;
    register(userName: string): Promise<any>;
}

export interface IEncryptedMessengerProps {
    client: IEncryptedMessengerClient;
    userContext?: IUserContext;
}

export class EncryptedMessenger implements IEncryptedMessenger {
    client: IEncryptedMessengerClient;
    userContext?: IUserContext;
    public readonly version: number = 1;

    constructor(encrpytedMessengerProps: IEncryptedMessengerProps) {
        this.client = encrpytedMessengerProps.client;
        this.userContext = encrpytedMessengerProps.userContext;
    }

    async sendMessage(
        sendMessageRequest: ISendMessageRequest
    ): Promise<ISendMessageResponse> {
        if (!this.userContext) {
            return Promise.reject('You need to register first');
        }
        let encryptionKey = await this._getSendMessageEncryptionKey(
            sendMessageRequest
        ); //this.userContext.encryptionKeyPair.publicKey
        const encryptedMessage = await encryptMessage(
            encryptionKey,
            sendMessageRequest.message
        );

        let message = bufferToNumberArray(encryptedMessage);

        const fromUserId = this.userContext.user.userId;

        const encryptedSendMessageRequest: ISendMessageClientRequest = {
            fromUserId,
            toUserId: sendMessageRequest.toUserId,
            message,
        };
        const response = await this.client.sendMessage(
            encryptedSendMessageRequest
        );

        await this._onSendMessageResponse(response);
        // TODO: store
        return response;
    }

    async getMessages(): Promise<any> {
        try {
            console.log('Getting messages');
            const messages = await this.client.getMessages({
                userId: this.userContext!.user.userId,
            });
            console.log(
                `Called getMessages and got ${JSON.stringify(messages)}`
            );
            console.log('Decrypting messages');
            let output: any = {};
            const reader = new FileReader();

            return await this._handleRawMessages(messages);

            // for (let value of rawMessages) {
            //     // console.log(`Body ${value[1].body}`);
            //     const decryptedMessage = await this._decryptMessage(
            //         value[1].body
            //     );
            //     output[value[0]] = {
            //         ...value[1],
            //         body: decryptedMessage,
            //     };
            // }
            // // );

            // return output;
        } catch (e) {
            console.error(`Error getting messages: ${e}`);
            // console.error(e);
            throw e;
        }
    }
    async register(userName: string): Promise<IRegisterResponse> {
        return await this.client.register({ userName });
    }

    /**
     * Gets the encryption key for encrypting outbound messages.
     * @param sendMessageRequest request to get encryption key for, should get encryption key of recipient.
     * @returns public key
     */
    protected async _getSendMessageEncryptionKey(
        sendMessageRequest: ISendMessageRequest
    ): Promise<CryptoKey> {
        // Note: This should be overriden, every message sent from this impl encrypts with your own key.
        return this.userContext!.encryptionKeyPair.publicKey;
    }

    protected async _handleRawMessages(
        rawMessages: Object
    ): Promise<IMessage[]> {
        let output: any = {};
        for (let value of Object.entries(rawMessages)) {
            // console.log(`Body ${value[1].body}`);
            const decryptedMessage = await this._decryptMessage(value[1].body);
            output[value[0]] = {
                ...value[1],
                body: decryptedMessage,
            };
        }
        // );

        return output;
    }

    protected async _onSendMessageResponse(response): Promise<void> {
        return Promise.resolve();
    }

    private async _decryptMessage(message: any): Promise<string> {
        return await decryptMessageAsString(
            message,
            this.userContext!.encryptionKeyPair.privateKey
        );
    }
}

export async function getEncryptedMessenger(user: IUser) {
    const keyPair = await getKeyPair();
    return new EncryptedMessenger({
        client: getDefaultEncryptedMessengerClient(),
        userContext: {
            encryptionKeyPair: keyPair,
            user,
        },
    });
}
