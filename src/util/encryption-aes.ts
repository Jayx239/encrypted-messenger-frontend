import { convertBufferToString, numberArrayToBufer } from './encode';
import { IEncryptMessageResult, encodeMessage } from './encryption';

export async function getEncryptionKeyAES(): Promise<CryptoKey> {
    return await window.crypto.subtle.generateKey(
        {
            name: 'AES-GCM',
            length: 256,
        },
        true,
        ['encrypt', 'decrypt']
    );
}

export async function encryptMessage(
    message: string,
    key: CryptoKey
): Promise<IEncryptMessageResult> {
    let encoded = encodeMessage(message);
    const iv = window.crypto.getRandomValues(new Uint8Array(24));
    const encryptedMessage = await window.crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv,
        },
        key,
        encoded
    );

    return {
        message: encryptedMessage,
        iv,
    };
}

export async function decryptMessage(
    encoded: BufferSource,
    key: CryptoKey,
    iv: BufferSource
): Promise<ArrayBuffer> {
    return await decryptMessageAES(encoded, key, iv);
}

// export interface IDecryptMessageResult {}

async function decryptMessageAES(
    encoded: BufferSource,
    key: CryptoKey,
    iv: BufferSource
): Promise<ArrayBuffer> {
    let decrypted = await window.crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: iv,
        },
        key,
        encoded
    );
    return decrypted;
}

export async function decryptArrayBufferAsString(
    message: ArrayBuffer,
    key: CryptoKey,
    iv: BufferSource
): Promise<string> {
    const decryptedMessage = await decryptMessage(message, key, iv);
    let decryptedString = convertBufferToString(decryptedMessage);
    return decryptedString;
}

export async function decryptMessageAsString(
    message: number[],
    privateKey: CryptoKey,
    iv: BufferSource
): Promise<string> {
    let mappedMessage = numberArrayToBufer(message);

    const decryptedMessage = await decryptMessage(
        mappedMessage,
        privateKey,
        iv
    );

    let decryptedString = convertBufferToString(decryptedMessage);

    return decryptedString;
}
