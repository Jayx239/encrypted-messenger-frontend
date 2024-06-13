export interface IBaseMessage<T> {
    sentAt: number;
    toUserId: string;
    fromUserId: string;
    messageId: string;
    io: string;
    body: T;
}

export interface IRawMessage extends IBaseMessage<number[]> {
    iv?: number[];
}

export interface IMessage extends IBaseMessage<string> {
    iv?: BufferSource;
}

export enum MessageIO {
    inbound = 'Inbound',
    outbound = 'Outbound',
}
