export interface IBaseMessage {
    sentAt: number;
    toUserId: string;
    fromUserId: string;
    messageId: string;
    io: string;
}

export interface IRawMessage extends IBaseMessage {
    body: number[];
}

export interface IMessage extends IBaseMessage {
    body: string;
}

export enum MessageIO {
    inbound = 'Inbound',
    outbound = 'Outbound',
}
