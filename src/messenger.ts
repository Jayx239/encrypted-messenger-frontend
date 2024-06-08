import { arrayBuffer } from 'stream/consumers';
import {
    EncryptedMessengerClient,
    IEncryptedMessengerClient,
    IGetMessagesResponse,
    ISendMessageRequest,
    ISendMessageResponse,
    ISendMessageClientRequest,
    getDefaultEncryptedMessengerClient,
} from './client';
import {
    decodeMessage,
    decryptMessage,
    encodeMessage,
    encryptMessage,
    getKeyPair,
} from './encryption';

export interface IEncryptedMessenger {
    sendMessage(
        sendMessageRequest: ISendMessageRequest
    ): Promise<ISendMessageResponse>;
    getMessages(): Promise<IGetMessagesResponse>;
    // register(userName: string): Promise<any>;
}

export interface IUserContext {
    encryptionKeyPair: CryptoKeyPair;
    user: IUser;
}

export interface IEncryptedMessengerProps {
    client: IEncryptedMessengerClient;
    userContext: IUserContext;
}

export class EncryptedMessenger implements IEncryptedMessenger {
    client: IEncryptedMessengerClient;
    userContext: IUserContext;

    constructor(encrpytedMessengerProps: IEncryptedMessengerProps) {
        this.client = encrpytedMessengerProps.client;
        this.userContext = encrpytedMessengerProps.userContext;
    }

    async sendMessage(
        sendMessageRequest: ISendMessageRequest
    ): Promise<ISendMessageResponse> {
        const encryptedMessage = await encryptMessage(
            this.userContext.encryptionKeyPair.publicKey,
            sendMessageRequest.message
        );
        const fromUserId = this.userContext.user.userId;
        const encryptedSendMessageRequest: ISendMessageClientRequest = {
            fromUserId,
            toUserId: sendMessageRequest.toUserId,
            message: bufferToNumberArray(encryptedMessage),
        };
        const response = await this.client.sendMessage(
            encryptedSendMessageRequest
        );
        // TODO: store
        return response;
    }
    async getMessages(): Promise<any> {
        try {
            console.log('Getting messages');
            const messages = await this.client.getMessages({
                userId: this.userContext.user.userId,
            });
            console.log(
                `Called getMessages and got ${JSON.stringify(messages)}`
            );
            console.log('Decrypting messages');
            let output: any = {};
            const reader = new FileReader();
            let rawMessages = Object.entries(messages);
            for (let value of rawMessages) {
                // forEach(
                //     async (value: [string, IRawMessage]) => {
                //         // const mappedMessage = base64DecodeStringToBuffer(
                //         //     value[1].body
                //         // );
                console.log(`Body ${value[1].body}`);
                const blob = numberArrayToBufer(value[1].body);
                const mappedMessage = blob; //reader.readAsArrayBuffer(blob);
                console.log(`MappedMessage: ${mappedMessage}`);
                const decryptedMessage = await decryptMessage(
                    this.userContext.encryptionKeyPair.privateKey,
                    mappedMessage
                );
                console.log(`Raw decrypted: ${decodeMessage}`);
                let decryptedString = convertBufferToString(decryptedMessage);
                console.log(`Decrypted string: ${decryptedString}`);
                output[value[0]] = {
                    ...value[1],
                    body: convertBufferToString(decryptedMessage),
                };
            }
            // );

            return output;
        } catch (e) {
            console.error(`Error getting messages: ${e}`);
            // console.error(e);
            throw e;
        }
    }
    // register(userName: string): Promise<any> {
    //     throw new Error('Method not implemented.');
    // }
}

interface IBaseMessage {
    sentAt: number;
    toUserId: string;
    fromUserId: string;
    messageId: string;
    io: string;
}

interface IRawMessage extends IBaseMessage {
    body: number[];
}

interface IMessage extends IBaseMessage {
    body: string;
}

function convertBufferToString(arrayBuffer: ArrayBuffer) {
    return new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
    );
}

export function base64EncodeBuffer(arrayBuffer: ArrayBuffer) {
    return btoa(convertBufferToString(arrayBuffer));
}

export function bufferToNumberArray(buffer: ArrayBuffer): number[] {
    const u8 = new Uint8Array(buffer);
    return Array.from(u8);
}

export function numberArrayToBufer(array: number[]): ArrayBuffer {
    return new Uint8Array(array);
}

function base64DecodeStringToArrayBuffer(message: string) {
    const buff = new Uint8Array(message.length);
    for (var i = 0; i < message.length; i++) {
        buff[i] = message.charCodeAt(i);
    }

    return buff;
}
function base64DecodeStringToBlob(message: string) {
    return new Blob([base64DecodeStringToArrayBuffer(message)]);
}

export interface IUser {
    userName: string;
    userId: string;
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
