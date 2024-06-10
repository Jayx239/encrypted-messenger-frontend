import * as encryption from './util/encryption';
import * as client from './client';
import * as messenger from './messenger';
import { GhostMessenger, getGhostMessenger } from './messenger/ghost-messenger';
(window as any).EncryptedMessenger = {
    encryption,
    client,
    messenger,
};

const userId = 'c53d8952-59e8-43c3-9e22-eb99f21e59eb';

async function run() {
    let messenger = await window[
        'EncryptedMessenger'
    ].messenger.getEncryptedMessenger({
        userName: 'Jason',
        userId,
    });

    await messenger.sendMessage({
        fromUserId: userId,
        toUserId: userId,
        message: 'Hello Jason',
    });

    await messenger.getMessages();

    window['messenger'] = messenger;
}
// messenger.sendMessage({toUserId: messenger.userContext.user.userId, message: "Hello world"})
// run();

async function initGhostMessenger() {
    window['messenger'] = await getGhostMessenger();
}
initGhostMessenger();

// async function isPasskeysAvailable() {
//     // Availability of `window.PublicKeyCredential` means WebAuthn is usable.
//     // `isUserVerifyingPlatformAuthenticatorAvailable` means the feature detection is usable.
//     // `​​isConditionalMediationAvailable` means the feature detection is usable.
//     if (
//         window.PublicKeyCredential &&
//         PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable &&
//         PublicKeyCredential.isConditionalMediationAvailable
//     ) {
//         // Check if user verifying platform authenticator is available.

//         const results = await Promise.all([
//             PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(),
//             PublicKeyCredential.isConditionalMediationAvailable(),
//         ]);

//         if (results.every((r) => r === true)) {
//             // Display "Create a new passkey" button
//             return true;
//         }

//         return false;
//     }
// }

// async function createPassKey() {
//     // const publicKeyCredentialCreationOptions = {
//     //     challenge: *****,
//     //     rp: {
//     //       name: "Example",
//     //       id: "example.com",
//     //     },
//     //     user: {
//     //       id: *****,
//     //       name: "john78",
//     //       displayName: "John",
//     //     },
//     //     pubKeyCredParams: [{alg: -7, type: "public-key"},{alg: -257, type: "public-key"}],
//     //     excludeCredentials: [{
//     //       id: *****,
//     //       type: 'public-key',
//     //       transports: ['internal'],
//     //     }],
//     //     authenticatorSelection: {
//     //       authenticatorAttachment: "platform",
//     //       requireResidentKey: true,
//     //     }
//     //   };

//     let credential = await navigator.credentials.create({
//         publicKey: {
//             challenge: new Uint8Array([117, 61, 252, 231, 191, 241]),
//             rp: { id: 'acme.com', name: 'ACME Corporation' },
//             user: {
//                 id: new Uint8Array([79, 252, 83, 72, 214, 7, 89, 26]),
//                 name: 'jamiedoe',
//                 displayName: 'Jamie Doe',
//             },
//             pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
//         },
//     });

//     // Encode and send the credential to the server for verification.
// }

// async function getKeyPair() {
//     return await window.crypto.subtle.generateKey(
//         {
//             name: 'RSA-OAEP',
//             modulusLength: 4096,
//             publicExponent: new Uint8Array([1, 0, 1]),
//             hash: 'SHA-256',
//         },
//         true,
//         ['encrypt', 'decrypt']
//     );
// }

// function encryptMessage(publicKey, message) {
//     let encoded = encodeMessage(message);
//     return window.crypto.subtle.encrypt(
//         {
//             name: 'RSA-OAEP',
//         },
//         publicKey,
//         encoded
//     );
// }

// async function encodeMessage(message) {
//     const messageBox = document.querySelector('.rsa-oaep #message');
//     let enc = new TextEncoder();
//     return await enc.encode(message);
// }

// async function decryptMessage(privateKey, ciphertext) {
//     let decryptedEncoded = await window.crypto.subtle.decrypt(
//         { name: 'RSA-OAEP' },
//         privateKey,
//         ciphertext
//     );

//     return decodeMessage(decryptedEncoded);
// }

// function decodeMessage(message) {
//     let enc = new TextDecoder();
//     return enc.decode(message);
// }
