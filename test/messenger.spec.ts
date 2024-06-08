import { webcrypto } from 'crypto';
import { TextEncoder, TextDecoder } from 'util';
import { Blob } from 'buffer';
import { IEncryptedMessengerClient, ISendMessageResponse } from '../src/client';
import { encryptMessage, getKeyPair } from '../src/encryption';
import {
    EncryptedMessenger,
    IUser,
    IUserContext,
    base64EncodeBuffer,
    bufferToNumberArray,
} from '../src/messenger';

Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
});

Object.defineProperty(globalThis, 'TextEncoder', {
    value: TextEncoder,
});

Object.defineProperty(globalThis, 'TextDecoder', {
    value: TextDecoder,
});

Object.defineProperty(globalThis, 'Blob', {
    value: Blob,
});

// Object.defineProperty(globalThis, 'crypto', {
//     value: {
//         subtle: {
//             value: webcrypto,
//         },
//     },
// });

// const window = {
//     crypto: {
//         subtle: webcrypto,
//     },
// };

// Mocking the client for testing purposes
const mockClient: any = {
    sendMessage: jest.fn(),
    getMessages: jest.fn(),
};

const mockUser: IUser = {
    userName: 'Jason',
    userId: 'e6e14857-1bc0-41d3-9dc5-e45122bd6167',
};

const rawMessage = 'Hello Jason';
const sendMessageRequest = {
    fromUserId: 'e6e14857-1bc0-41d3-9dc5-e45122bd6167',
    toUserId: 'e6e14857-1bc0-41d3-9dc5-e45122bd6167',
    message: rawMessage,
};

const sendMessageResponse: ISendMessageResponse = {
    status: 'Pending',
    message: 'Message pending',
    messageId: '75d0ed89-c00f-4b9a-be4d-d5a3fe474a9e',
};

const encryptedResponse = {
    fromUserId: 'e6e14857-1bc0-41d3-9dc5-e45122bd6167',
    toUserId: 'e6e14857-1bc0-41d3-9dc5-e45122bd6167',
    message:
        'ï¿½ï¿½ï¿½ï¿½~ï¿½ï¿½|Dï¿½\u0001ï¿½\tï¿½ï¿½Þ¼|ï¿½\bï¿½ï¿½FJï¿½9\u0001ï¿½ï¿½ï¿½oOï¿½\u001aï¿½ï¿½.V\f\fï¿½yLsí“µï¿½eï¿½sNï¿½ï¿½r\u0011ï¿½ï¿½pb\u0016J\u0005ï¿½#yOq\u0007ï¿½\u0019ï¿½Ö°@ß±ï¿½5ÙŸa%\u0002ï¿½9ï¿½ï¿½|2G{ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½*ï¿½!Sï¿½ï¿½ï¿½ï¿½|;ï¿½ï¿½ï¿½|ï¿½\u000bMï¿½ï¿½3<ï¿½Aï¿½ï¿½\fï¿½ï¿½ï¿½eÜ‹ï¿½ï¿½ï¿½9\t3ï¿½ï¿½\u0001ï¿½^ï¿½ï¿½=Iï¿½ï¿½ï¿½l]ï¿½\\ï¿½ï¿½ï¿½Nï¿½ï¿½F>ï¿½\u0004Ð„ï¿½ï¿½ï¿½ï¿½oï¿½ï¿½ï¿½ï¿½ï¿½ï¿½1ï¿½P#\u0013ï¿½\u0018ï¿½/Ì…ï¿½ï¿½ï¿½];}O)ï¿½ï¿½pï¿½ï¿½ ï¿½ï¿½ï¿½*Vï¿½ï¿½ï¿½ï¿½Z\u001aoï¿½Éƒï¿½ï¿½vï¿½Zf#ï¿½-C~ï¿½.ï¿½E\u0015ï¿½ï¿½`8ï¿½\u0001Aaï¿½ï¿½\u0019\u0019ï¿½ ï¿½]ï¿½\u000fm\\ï¿½>XSï¿½ï¿½ï¿½ï¿½ï¿½ï¿½Î‡IDW\u0012i.kï¿½Ä¢%9ï¿½ï¿½:ï¿½$ï¿½ï¿½V3qdï¿½#\\ï¿½SSï¿½ï¿½3ï¿½~ï¿½ï¿½Sï¿½6ï¿½ï¿½\u0011ï¿½ï¿½ï¿½eï¿½ï¿½ï¿½ï¿½3ï¿½\u001a\u001cfï¿½ï¿½ï¿½ï¿½tp\u000eï¿½ï¿½\u0011z1ï¿½\u0014ï¿½sï¿½ï¿½X=HPï¿½nI:\nï¿½ï¿½iï¿½3ï¿½.\rï¿½I7ï¿½#ï¿½Ã¶ï¿½+iï¿½ï¿½ï¿½ï¿½;ï¿½\u0019ï¿½ï¿½ï¿½9ï¿½oï¿½ï¿½ï¿½H\u0001\u001f\u000bÒ£l.Ñº*ï¿½ï¿½Í¥ï¿½ï¿½î±Œï¿½ï¿½Eï¿½\r\u001cÛƒgÛ¸\u0007ï¿½ï¿½×¯ï¿½:kï¿½ï¿½ï¿½ï¿½wHï¿½ï¿½ï¿½[-\u0018ï¿½Sï¿½ï¿½\u0017K\r/ï¿½\u0017ï¿½ï¿½ï¿½]ï¿½_,ï¿½;\u0010\u0018ï¿½h\u0006Tï¿½ï¿½ï¿½\u001eï¿½\u0001ï¿½"ï¿½ï¿½|ï¿½ï¿½jï¿½|ï¿½\u0007Uï¿½.ï¿½ï¿½ï¿½rï¿½XLï¿½ï¿½kXï¿½ï¿½ï¿½ï¿½ï¿½ï¿½oï¿½\f%ï¿½5',
};

const rawGetMessagesResponse = {
    '75d0ed89-c00f-4b9a-be4d-d5a3fe474a9e': {
        sent_at: 1717871236,
        to_user_id: 'e6e14857-1bc0-41d3-9dc5-e45122bd6167',
        from_user_id: 'e6e14857-1bc0-41d3-9dc5-e45122bd6167',
        message_id: '75d0ed89-c00f-4b9a-be4d-d5a3fe474a9e',
        io: 'Inbound',
        body: 'ï¿½ï¿½ï¿½ï¿½~ï¿½ï¿½|Dï¿½\u0001ï¿½\tï¿½ï¿½Þ¼|ï¿½\bï¿½ï¿½FJï¿½9\u0001ï¿½ï¿½ï¿½oOï¿½\u001aï¿½ï¿½.V\f\fï¿½yLsí“µï¿½eï¿½sNï¿½ï¿½r\u0011ï¿½ï¿½pb\u0016J\u0005ï¿½#yOq\u0007ï¿½\u0019ï¿½Ö°@ß±ï¿½5ÙŸa%\u0002ï¿½9ï¿½ï¿½|2G{ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½*ï¿½!Sï¿½ï¿½ï¿½ï¿½|;ï¿½ï¿½ï¿½|ï¿½\u000bMï¿½ï¿½3<ï¿½Aï¿½ï¿½\fï¿½ï¿½ï¿½eÜ‹ï¿½ï¿½ï¿½9\t3ï¿½ï¿½\u0001ï¿½^ï¿½ï¿½=Iï¿½ï¿½ï¿½l]ï¿½\\ï¿½ï¿½ï¿½Nï¿½ï¿½F>ï¿½\u0004Ð„ï¿½ï¿½ï¿½ï¿½oï¿½ï¿½ï¿½ï¿½ï¿½ï¿½1ï¿½P#\u0013ï¿½\u0018ï¿½/Ì…ï¿½ï¿½ï¿½];}O)ï¿½ï¿½pï¿½ï¿½ ï¿½ï¿½ï¿½*Vï¿½ï¿½ï¿½ï¿½Z\u001aoï¿½Éƒï¿½ï¿½vï¿½Zf#ï¿½-C~ï¿½.ï¿½E\u0015ï¿½ï¿½`8ï¿½\u0001Aaï¿½ï¿½\u0019\u0019ï¿½ ï¿½]ï¿½\u000fm\\ï¿½>XSï¿½ï¿½ï¿½ï¿½ï¿½ï¿½Î‡IDW\u0012i.kï¿½Ä¢%9ï¿½ï¿½:ï¿½$ï¿½ï¿½V3qdï¿½#\\ï¿½SSï¿½ï¿½3ï¿½~ï¿½ï¿½Sï¿½6ï¿½ï¿½\u0011ï¿½ï¿½ï¿½eï¿½ï¿½ï¿½ï¿½3ï¿½\u001a\u001cfï¿½ï¿½ï¿½ï¿½tp\u000eï¿½ï¿½\u0011z1ï¿½\u0014ï¿½sï¿½ï¿½X=HPï¿½nI:\nï¿½ï¿½iï¿½3ï¿½.\rï¿½I7ï¿½#ï¿½Ã¶ï¿½+iï¿½ï¿½ï¿½ï¿½;ï¿½\u0019ï¿½ï¿½ï¿½9ï¿½oï¿½ï¿½ï¿½H\u0001\u001f\u000bÒ£l.Ñº*ï¿½ï¿½Í¥ï¿½ï¿½î±Œï¿½ï¿½Eï¿½\r\u001cÛƒgÛ¸\u0007ï¿½ï¿½×¯ï¿½:kï¿½ï¿½ï¿½ï¿½wHï¿½ï¿½ï¿½[-\u0018ï¿½Sï¿½ï¿½\u0017K\r/ï¿½\u0017ï¿½ï¿½ï¿½]ï¿½_,ï¿½;\u0010\u0018ï¿½h\u0006Tï¿½ï¿½ï¿½\u001eï¿½\u0001ï¿½"ï¿½ï¿½|ï¿½ï¿½jï¿½|ï¿½\u0007Uï¿½.ï¿½ï¿½ï¿½rï¿½XLï¿½ï¿½kXï¿½ï¿½ï¿½ï¿½ï¿½ï¿½oï¿½\f%ï¿½5',
    },
};

const getMessagesResponse = {
    '75d0ed89-c00f-4b9a-be4d-d5a3fe474a9e': {
        sent_at: 1717871236,
        to_user_id: 'e6e14857-1bc0-41d3-9dc5-e45122bd6167',
        from_user_id: 'e6e14857-1bc0-41d3-9dc5-e45122bd6167',
        message_id: '75d0ed89-c00f-4b9a-be4d-d5a3fe474a9e',
        io: 'Inbound',
        body: rawMessage,
    },
};

describe('EncryptedMessenger', () => {
    let messenger: EncryptedMessenger;

    beforeEach(async () => {
        messenger = new EncryptedMessenger({
            client: mockClient,
            userContext: {
                user: mockUser,
                encryptionKeyPair: await getKeyPair(),
            },
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Messenger encrypts message properly', async () => {
        mockClient.sendMessage.mockResolvedValue(sendMessageResponse);
        const result = await messenger.sendMessage(sendMessageRequest);
        expect(result).toEqual(sendMessageResponse);
    });

    test('Messenger gets messages and decrypts', async () => {
        const encMessage = await encryptMessage(
            messenger.userContext.encryptionKeyPair.publicKey,
            rawMessage
        );
        const rawGetMessagesResponse = {
            '123123-12312-3123-123-123': {
                toUser: '',
                fromUser: '',
                body: bufferToNumberArray(encMessage),
            },
        };
        console.log(rawGetMessagesResponse);
        mockClient.getMessages.mockResolvedValue(rawGetMessagesResponse);
        const response = await messenger.getMessages();

        expect(response).toEqual({
            '123123-12312-3123-123-123': {
                toUser: '',
                fromUser: '',
                body: rawMessage,
            },
        });
    });

    // test('sendMessage should encrypt message and call client.sendMessage', async () => {
    //     mockClient.sendMessage.mockResolvedValueOnce({ success: true });
    //     const sendMessageRequest = {
    //         message: 'Test message',
    //         toUserId: 'receiverId',
    //     };
    //     await messenger.sendMessage(sendMessageRequest);
    //     expect(mockClient.sendMessage).toHaveBeenCalledWith({
    //         message: expect.any(String), // Encrypted message
    //         toUserId: 'receiverId',
    //     });
    // });

    // test('getMessages should decrypt messages and return them', async () => {
    //     const mockMessages = {
    //         messageId1: { body: 'EncryptedBody1' },
    //         messageId2: { body: 'EncryptedBody2' },
    //     };
    //     mockClient.getMessages.mockResolvedValueOnce(mockMessages);

    //     const decryptedMessage1 = 'DecryptedMessage1';
    //     const decryptedMessage2 = 'DecryptedMessage2';
    //     // Mocking the decryption function to return decrypted messages
    //     jest.spyOn(messenger, 'decryptMessage').mockImplementation(async () => {
    //         return decryptedMessage1; // You can customize decryption for different messages if needed
    //     });

    //     const result = await messenger.getMessages();
    //     expect(result).toEqual({
    //         messageId1: { body: decryptedMessage1 },
    //         messageId2: { body: decryptedMessage1 },
    //     });
    // });
});
