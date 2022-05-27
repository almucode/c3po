'use strict';

// Class that represents a poll.
class Poll {
  constructor(options, maxOptions, publicKey) {
    this.options = options;  // An array of options.
    this.maxOptions = maxOptions;  // Max options per vote.
    this.publicKey = publicKey;  // Public key to encrypt votes.
  }

  async serialize() {
    let optionsData = buffer.fromObject({
      options: this.options,
      maxOptions: this.maxOptions
    });
    let keyData = await crypto.exportPublicKey(this.publicKey);
    return buffer.toBase64(optionsData) + "_" + buffer.toBase64(keyData);
  }

  static async deserialize(serialized) {
    let parts = serialized.split("_");
    if (parts.length != 2) {
      throw new Error("Invalid number of parts");
    }
    let optionsData = buffer.fromBase64(parts[0]);
    let keyData = buffer.fromBase64(parts[1]);

    let optionsInfo = buffer.toObject(optionsData);
    let publicKey = await crypto.importPublicKey(keyData);
    return new Poll(optionsInfo.options, optionsInfo.maxOptions, publicKey);
  }

  static generateId() {
    let id = "";
    for (let byte of crypto.getRandomBytes(4)) {
      id += "ABCDEFGHIJKLMNOPRSTUVWXYZ2345679"[byte % 32];
    }
    return id;
  }

  async encryptVote(id, indices) {
    let plaintext = buffer.fromObject([id].concat(indices));
    let ciphertext = await crypto.encrypt(this.publicKey, plaintext);
    return buffer.toBase64(ciphertext);
  }

  async decryptVote(ballot, privateKey) {
    let ciphertext = buffer.fromBase64(ballot);
    let plaintext = await crypto.decrypt(privateKey, ciphertext);
    let vote = buffer.toObject(plaintext);
    let id = vote.shift();
    let options = [];
    for (let index of vote) {
      options.push(this.options[index]);
    }
    return [id, options];
  }
}
