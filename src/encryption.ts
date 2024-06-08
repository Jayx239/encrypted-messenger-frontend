export async function getKeyPair() {
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

export async function encryptMessage(publicKey, message) {
    let encoded = encodeMessage(message);
    return await window.crypto.subtle.encrypt(
        {
            name: 'RSA-OAEP',
        },
        publicKey,
        encoded
    );
}

export function encodeMessage(message) {
    let enc = new TextEncoder();
    return enc.encode(message);
}

export async function decryptMessage(
    privateKey: CryptoKey,
    ciphertext: BufferSource
) {
    let decryptedEncoded = await window.crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        privateKey,
        ciphertext
    );
    return decryptedEncoded;
    // return decodeMessage(decryptedEncoded);
}

export function decodeMessage(message) {
    let enc = new TextDecoder();
    return enc.decode(message);
}
