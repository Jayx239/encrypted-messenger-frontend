import axios, { Axios, AxiosInstance } from 'axios';

export interface IEncryptedMessengerClient {
    // register(registerRequest: IRegisterRequest): Promise<IRegisterResponse>;
    sendMessage(
        sendMessageRequest: ISendMessageClientRequest
    ): Promise<ISendMessageResponse>;
    getMessages(
        getMessagesRequest: IGetMessagesRequest
    ): Promise<IGetMessagesResponse>;
}

export interface IEncryptedMessengerClientProps {
    axios: AxiosInstance;
    baseUrl: string;
}

export class EncryptedMessengerClient implements IEncryptedMessengerClient {
    private _axios: AxiosInstance;
    private baseUrl: string;
    constructor(encryptedMessengerClientProps: IEncryptedMessengerClientProps) {
        this._axios = encryptedMessengerClientProps.axios;
        this.baseUrl = encryptedMessengerClientProps.baseUrl;
    }
    // async register(
    //     registerRequest: IRegisterRequest
    // ): Promise<IRegisterResponse> {
    //     return (await axios.post(`${this.baseUrl}/register`, registerRequest))
    //         .data;
    // }

    async sendMessage(
        sendMessageRequest: ISendMessageClientRequest
    ): Promise<ISendMessageResponse> {
        return (await axios.put(`${this.baseUrl}/message`, sendMessageRequest))
            .data;
    }

    async getMessages(getMessagesRequest: IGetMessagesRequest): Promise<any> {
        return await (
            await axios.post(`${this.baseUrl}/messages`, getMessagesRequest)
        ).data;
    }
}

export interface IRegisterRequest {
    userName: string;
}

export interface IRegisterResponse {
    userName: string;
    userId: string;
    status: string;
    message: string;
}

export interface ISendMessageRequest {
    toUserId: string;
    message: string;
}

export interface ISendMessageClientRequest {
    fromUserId: string;
    toUserId: string;
    message: number[];
}

export interface ISendMessageResponse {
    status: string;
    message: string;
    messageId: string;
}

export interface IGetMessagesRequest {
    userId: string;
}

export interface IGetMessagesResponse {}

export function getDefaultEncryptedMessengerClient() {
    return new EncryptedMessengerClient({
        axios,
        baseUrl: 'http://127.0.0.1:8080',
    });
}
