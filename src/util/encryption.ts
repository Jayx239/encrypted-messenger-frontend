import { convertBufferToString, numberArrayToBufer } from './encode';

export async function getKeyPair(): Promise<CryptoKeyPair> {
    return await window.crypto.subtle.generateKey(
        {
            name: 'RSA-OAEP',
            modulusLength: 4096,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: 'SHA-256',
        },
        true,
        ['encrypt', 'decrypt']
    );
}

export async function encryptMessage(publicKey, message): Promise<ArrayBuffer> {
    let encoded = encodeMessage(message);
    return await window.crypto.subtle.encrypt(
        {
            name: 'RSA-OAEP',
        },
        publicKey,
        encoded
    );
}

export function encodeMessage(message): Uint8Array {
    let enc = new TextEncoder();
    return enc.encode(message);
}

export async function decryptMessage(
    privateKey: CryptoKey,
    ciphertext: BufferSource
): Promise<ArrayBuffer> {
    let decryptedEncoded = await window.crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        privateKey,
        ciphertext
    );
    return decryptedEncoded;
    // return decodeMessage(decryptedEncoded);
}

export function decodeMessage(message): string {
    let enc = new TextDecoder();
    return enc.decode(message);
}

export async function decryptArrayBufferAsString(
    message: ArrayBuffer,
    privateKey: CryptoKey
): Promise<string> {
    const decryptedMessage = await decryptMessage(privateKey, message);
    let decryptedString = convertBufferToString(decryptedMessage);
    return decryptedString;
}

export async function decryptMessageAsString(
    message: number[],
    privateKey: CryptoKey
): Promise<string> {
    let mappedMessage;
    // const messageType = typeof message;
    // switch (messageType) {
    //     case 'object':
    mappedMessage = numberArrayToBufer(message);
    //         break;
    //     default:
    //         throw new Error(
    //             `Invalid message type for decryption ${messageType}`
    //         );
    // }

    // console.log(`MappedMessage: ${mappedMessage}`);
    const decryptedMessage = await decryptMessage(privateKey, mappedMessage);
    let decryptedString = convertBufferToString(decryptedMessage);
    // console.log(`Decrypted string: ${decryptedString}`);
    return decryptedString;
}
