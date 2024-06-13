import {
    IEncryptedMessengerClient,
    IGetMessagesResponse,
    ISendMessageRequest,
    ISendMessageResponse,
    ISendMessageClientRequest,
    IRegisterResponse,
} from './client';
import { bufferToNumberArray } from './util/encode';
import { IBaseUserContext } from './model/user';
import { IMessage, IRawMessage } from './model/message';

export interface IEncryptedMessenger {
    sendMessage(
        sendMessageRequest: ISendMessageRequest
    ): Promise<ISendMessageResponse>;
    getMessages(): Promise<IGetMessagesResponse>;
    register(userName: string): Promise<any>;
}

export interface IEncryptedMessengerProps<USER_CONTEXT> {
    client: IEncryptedMessengerClient;
    userContext?: USER_CONTEXT;
}
export interface IEncryptSendMessageResult {
    message: number[];
    iv?: ArrayBuffer;
}
export abstract class EncryptedMessenger<USER_CONTEXT extends IBaseUserContext>
    implements IEncryptedMessenger
{
    client: IEncryptedMessengerClient;
    userContext?: USER_CONTEXT;

    constructor(
        encrpytedMessengerProps: IEncryptedMessengerProps<USER_CONTEXT>
    ) {
        this.client = encrpytedMessengerProps.client;
        this.userContext = encrpytedMessengerProps.userContext;
    }

    protected abstract encryptSendMessage(
        sendMessageRequest
    ): Promise<IEncryptSendMessageResult>;

    async sendMessage(
        sendMessageRequest: ISendMessageRequest
    ): Promise<ISendMessageResponse> {
        if (!this.userContext) {
            return Promise.reject('You need to register first');
        }

        let encryptMessageResult = await this.encryptSendMessage(
            sendMessageRequest
        );
        const fromUserId = this.userContext.user.userId;

        const message = encryptMessageResult.message;

        const iv = encryptMessageResult.iv
            ? bufferToNumberArray(encryptMessageResult.iv)
            : undefined;

        const encryptedSendMessageRequest: ISendMessageClientRequest = {
            fromUserId,
            toUserId: sendMessageRequest.toUserId,
            message,
            iv,
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
        } catch (e) {
            console.error(`Error getting messages: ${e}`);
            throw e;
        }
    }
    async register(userName: string): Promise<IRegisterResponse> {
        return await this.client.register({ userName });
    }

    protected async _handleRawMessages(
        rawMessages: Object
    ): Promise<IMessage[]> {
        let output: any = {};
        for (let value of Object.entries(rawMessages)) {
            const decryptedMessage = await this._decryptMessage(value[1]);
            output[value[0]] = {
                ...value[1],
                body: decryptedMessage,
            };
        }

        return output;
    }

    protected async _onSendMessageResponse(response): Promise<void> {
        return Promise.resolve();
    }

    protected abstract _decryptMessage(message: IRawMessage): Promise<string>;
}

// export abstract class EncryptedMessengerRSA extends EncryptedMessenger<IUserContext> {
//     public readonly version: string = 'RSA.1';

//     constructor(
//         encrpytedMessengerProps: IEncryptedMessengerProps<IUserContext>
//     ) {
//         super(encrpytedMessengerProps);
//     }

//     /**
//      * Gets the encryption key for encrypting outbound messages.
//      * @param sendMessageRequest request to get encryption key for, should get encryption key of recipient.
//      * @returns public key
//      */
//     protected abstract _getSendMessageEncryptionKey(
//         sendMessageRequest: ISendMessageRequest
//     ); /*: Promise<CryptoKey> {
//         // Note: This should be overriden, every message sent from this impl encrypts with your own key.
//         return this.userContext!.encryptionKeyPair.publicKey;
//     } */

//     protected async _handleRawMessages(
//         rawMessages: Object
//     ): Promise<IMessage[]> {
//         let output: any = {};
//         for (let value of Object.entries(rawMessages)) {
//             // console.log(`Body ${value[1].body}`);
//             const decryptedMessage = await this._decryptMessage(value[1]);
//             output[value[0]] = {
//                 ...value[1],
//                 body: decryptedMessage,
//             };
//         }
//         // );

//         return output;
//     }

//     protected async _onSendMessageResponse(response): Promise<void> {
//         return Promise.resolve();
//     }

//     protected async _decryptMessage(message: any): Promise<string> {
//         return await decryptMessageAsString(
//             message,
//             this.userContext!.encryptionKeyPair.privateKey
//         );
//     }
// }

// export abstract class EncryptedMessengerAES extends EncryptedMessenger<IUserContextAES> {
//     client: IEncryptedMessengerClient;
//     public readonly version: string = 'AES.1';

//     constructor(
//         encrpytedMessengerProps: IEncryptedMessengerProps<IUserContextAES>
//     ) {
//         super(encrpytedMessengerProps);
//         this.client = encrpytedMessengerProps.client;
//         this.userContext = encrpytedMessengerProps.userContext;
//     }

//     /**
//      * Gets the encryption key for encrypting outbound messages.
//      * @param sendMessageRequest request to get encryption key for, should get encryption key of recipient.
//      * @returns public key
//      */
//     protected abstract _getSendMessageEncryptionKey(
//         sendMessageRequest: ISendMessageRequest
//     ); /*: Promise<CryptoKey> {
//         // Note: This should be overriden, every message sent from this impl encrypts with your own key.
//         return this.userContext!.encryptionKeyPair.publicKey;
//     } */

//     protected async _handleRawMessages(
//         rawMessages: Object
//     ): Promise<IMessage[]> {
//         let output: any = {};
//         for (let value of Object.entries(rawMessages)) {
//             // console.log(`Body ${value[1].body}`);
//             const decryptedMessage = await this._decryptMessage(value[1]);
//             output[value[0]] = {
//                 ...value[1],
//                 body: decryptedMessage,
//             };
//         }
//         // );

//         return output;
//     }

//     protected async _onSendMessageResponse(response): Promise<void> {
//         return Promise.resolve();
//     }

//     protected async _decryptMessage(message: IRawMessage): Promise<string> {
//         return await decryptMessageAsString(
//             message.body,
//             this.userContext!.encryptionKey
//         );
//     }
// }

// export async function getEncryptedMessenger(user: IUser) {
//     const keyPair = await getKeyPair();
//     return new EncryptedMessengerRSA({
//         client: getDefaultEncryptedMessengerClient(),
//         userContext: {
//             encryptionKeyPair: keyPair,
//             user,
//         },
//     });
// }
