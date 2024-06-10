import { IOType } from 'child_process';
import { IRawMessage, MessageIO } from './model/message';
import { IUser } from './model/user';

export interface IMessageStoreMessage {
    sentAt: number;
    messageId: string;
    message: ArrayBuffer;
    toUser: IUser;
    fromUser: IUser;
    /**
     * If sent or received
     */
    io: MessageIO;
}

export interface IMessageStore<MESSAGE_TYPE> {
    addMessage(message: MESSAGE_TYPE): void;
    getAllMessages(): IMessageStoreMessage[];
}

export class MessageStore implements IMessageStore<IMessageStoreMessage> {
    private readonly _messages: Map<string, IMessageStoreMessage>;

    constructor() {
        this._messages = new Map<string, IMessageStoreMessage>();
    }

    addMessage(message: IMessageStoreMessage) {
        this._messages.set(message.messageId, message);
    }

    getAllMessages(): IMessageStoreMessage[] {
        const response: IMessageStoreMessage[] = [];
        for (const message of this._messages) {
            response.push(message[1]);
        }

        return response;
    }
}
