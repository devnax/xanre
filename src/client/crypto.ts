import nacl from "tweetnacl";
import { encodeBase64, decodeBase64 } from "tweetnacl-util";
import { sha256 } from "js-sha256";
import pako from 'pako';
import textReverse from "./textReverse";

function encryptData(data: string, secret: string): string {
   const key = new Uint8Array(sha256.arrayBuffer(secret));
   const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
   const messageUint8 = new TextEncoder().encode(data);
   const compressed = pako.deflate(messageUint8);
   const encrypted = nacl.secretbox(compressed, nonce, key);
   return btoa(String.fromCharCode(...nonce)) + "." + btoa(String.fromCharCode(...encrypted));
}

function decryptData(encryptedString: string, secret: string): string {
   const key = new Uint8Array(sha256.arrayBuffer(secret));
   const [nonceB64, encryptedB64] = encryptedString.split(".");
   const nonce = new Uint8Array(atob(nonceB64).split("").map(c => c.charCodeAt(0)));
   const encrypted = new Uint8Array(atob(encryptedB64).split("").map(c => c.charCodeAt(0)));
   const decrypted = nacl.secretbox.open(encrypted, nonce, key);
   if (!decrypted) throw new Error("Decryption failed");
   const decompressed: any = pako.inflate(decrypted, { to: 'string' });
   return decompressed
}

function hashData(data: string): string {
   const inputBytes = new TextEncoder().encode(data);
   const hashedData = nacl.hash(inputBytes);
   return Array.from(hashedData).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function generateSecret(): string {
   const secretKey = nacl.randomBytes(32);
   return Array.from(secretKey).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function encryptPath(input: string): string {
   return encodeURIComponent(textReverse.encrypt(input))
}

function decryptPath(encryptedString: string): string {
   return textReverse.decrypt(decodeURIComponent(encryptedString))
}

const crypto = {
   encrypt: encryptData,
   decrypt: decryptData,
   hash: hashData,
   generateSecret,
   encryptPath,
   decryptPath
}

export default crypto;