'use strict';

// Utilities for public private key encryption.
let crypto = {}

crypto.algorithm = "RSA-OAEP";
crypto.bits = 1024;
crypto.hash = "SHA-256";
crypto.publicFormat = "spki";

// Generates a new public-private key pair.
//
// Returns a Promise of a CryptoKeyPair.
crypto.generateKeyPair = function() {
  return window.crypto.subtle.generateKey(
    {
      name: this.algorithm,
      modulusLength: this.bits,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: this.hash
    },
    true,  // Extractable.
    ["encrypt", "decrypt"]);
}

// Exports a public key into a buffer.
//
// Returns a Promise of an ArrayBuffer for the CryptoKey provided.
crypto.exportPublicKey = function(publicKey) {
  return window.crypto.subtle.exportKey(this.publicFormat, publicKey);
}

// Imports a public key from a buffer.
//
// Returns a Promise of a CryptoKey from the provided ArrayBuffer.
crypto.importPublicKey = function(publicKeyData) {
  return window.crypto.subtle.importKey(
    this.publicFormat,
    publicKeyData,
    {
      name: this.algorithm,
      hash: this.hash
    },
    false,  // Not extractable.
    ["encrypt"]);
}

// Encrypts plaintext using a public key.
//
// Returns a Promise of an ArrayBuffer containing the ciphertext.
crypto.encrypt = function(publicKey, plaintext) {
  return window.crypto.subtle.encrypt(
    {
      name: this.algorithm
    },
    publicKey,
    plaintext);
}

// Decrypts ciphertext using a private key.
//
// Returns a Promise of an ArrayBuffer containing the cleartext.
crypto.decrypt = function(privateKey, ciphertext) {
  return window.crypto.subtle.decrypt(
    {
      name: this.algorithm
    },
    privateKey,
    ciphertext)
}

// Generates random bytes.
//
// Returns an Uint8Array containing the requested number of bytes.
crypto.getRandomBytes = function(length) {
  let array = new Uint8Array(length);
  self.crypto.getRandomValues(array);
  return array;
}
