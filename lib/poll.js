'use strict';

// Class that represents a poll.
class Poll {
  constructor(options, maxOptions, publicKey) {
    this.options = options;  // An array of options.
    this.maxOptions = maxOptions;  // Max options per vote.
    this.publicKey = publicKey;  // Public key to encrypt votes.
  }

  serialize() {
    let optionsData = buffer.fromObject({
      options: this.options,
      maxOptions: this.maxOptions
    });
    return crypto.exportPublicKey(this.publicKey).then(keyData => {
      return buffer.toBase64(optionsData) + "_" + buffer.toBase64(keyData);
    });
  }

  static deserialize(serialized) {
    let parts = serialized.split("_");
    if (parts.length != 2) {
      return Promise.reject(new Error("Invalid number of parts"));
    }
    let optionsData = buffer.fromBase64(parts[0]);
    let keyData = buffer.fromBase64(parts[1]);

    let optionsInfo = buffer.toObject(optionsData);
    return crypto.importPublicKey(keyData).then(publicKey => {
      return new Poll(optionsInfo.options, optionsInfo.maxOptions, publicKey);
    });
  }

  encryptVote(indices) {
    var plaintext = buffer.fromObject(indices);
    return crypto.encrypt(this.publicKey, plaintext).then(ciphertext => {
      return buffer.toBase64(ciphertext);
    });
  }

  decryptVote(ballot, privateKey) {
    let ciphertext = buffer.fromBase64(ballot);
    return crypto.decrypt(privateKey, ciphertext).then(plaintext => {
      let options = [];
      for (let index of buffer.toObject(plaintext)) {
        options.push(this.options[index]);
      }
      return options;
    });
  }
}
