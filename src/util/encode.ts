export function convertBufferToString(arrayBuffer: ArrayBuffer) {
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
