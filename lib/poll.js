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

  indicesToOptions(indices) {
    let options = [];
    for (let index of indices) {
      options.push(this.options[index]);
    }
    return options;
  }
}
