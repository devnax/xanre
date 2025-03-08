import nacl from "tweetnacl";
import { sha256 } from "js-sha256";
import pako from 'pako';
import textReverse from "./textReverse";

function encryptData(data: string | object, secret: string): string {
   if (typeof data === 'object') data = JSON.stringify(data);
   const key = new Uint8Array(sha256.arrayBuffer(secret));
   const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
   const messageUint8 = new TextEncoder().encode(data);
   const compressed = pako.deflate(messageUint8);
   const encrypted = nacl.secretbox(compressed, nonce, key);
   let base64 = btoa(String.fromCharCode(...nonce)) + "." + btoa(String.fromCharCode(...encrypted))
   let paddingCount = (base64.match(/=+$/) || [''])[0].length;
   if (paddingCount > 0) {
      base64 = base64.replace(/=+$/, () => `$${paddingCount}`);
   }
   return base64;
}

function decryptData(encryptedString: string, secret: string): string {
   encryptedString = encryptedString.replace(/\$(\d)/, (_match, count) => '='.repeat(parseInt(count)));
   const key = new Uint8Array(sha256.arrayBuffer(secret));
   const [nonceB64, encryptedB64] = encryptedString.split(".");
   const nonce = new Uint8Array(atob(nonceB64).split("").map(c => c.charCodeAt(0)));
   const encrypted = new Uint8Array(atob(encryptedB64).split("").map(c => c.charCodeAt(0)));
   const decrypted = nacl.secretbox.open(encrypted, nonce, key);
   if (!decrypted) throw new Error("Decryption failed");
   let decompressed: any = pako.inflate(decrypted, { to: 'string' });
   try {
      return JSON.parse(decompressed);
   } catch (e) {
      return decompressed
   }
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
   return encodeURIComponent(textReverse.encrypt(input.toLowerCase()))
}

function decryptPath(encryptedString: string): string {
   return textReverse.decrypt(decodeURIComponent(encryptedString))
}

function compress(str: string): string {
   const compressed = pako.deflate(str);
   return btoa(String.fromCharCode(...compressed));
}

function decompress(str: string): string {
   const binaryData = Uint8Array.from(atob(str), c => c.charCodeAt(0));
   return pako.inflate(binaryData, { to: 'string' });
}

const crypto = {
   encrypt: encryptData,
   decrypt: decryptData,
   hash: hashData,
   generateSecret,
   encryptPath,
   decryptPath,
   compress,
   decompress
}

export default crypto;