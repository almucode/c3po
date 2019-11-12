'use strict';

dom.contentLoaded.then(start);

function start(args) {
  let privateKey;
  let votes;

  dom.preventFormSubmissions();
  dom.addClickListener("more", addOption);
  dom.addClickListener("copy", copyKey);
  dom.addClickListener("create", createPoll);
  dom.addEnterListener("ballot", addVote);
  dom.addClickListener("add", addVote);
  dom.addClickListener("sum", summarizeVotes);

  function addOption() {
    let form = document.getElementById("vote");
    let button = document.getElementById("more");
    let option = form.querySelector('input[name="option"]').cloneNode(true);
    option.value = "";
    dom.prependSibling(button, option);
    dom.prependSibling(button, " ");
  }

  function newVote() {
    votes = new Votes(document.getElementById("max").value);
    dom.clearValue("summary");
    dom.setValue("count", 0);
  }

  function createPoll() {
    forgetKey();
    newVote();

    let poll = {
      options: []
    };
    let options = document.getElementsByName("option");
    for (let option of options) {
      if (option.value) {
        poll.options.push(option.value);
      }
    }
    if (!poll.options.length) {
      return;
    }
    poll.max = votes.maxOptions;
    let pollData = buffer.fromString(JSON.stringify(poll));

    crypto.generateKeyPair().then(keyPair => {
      privateKey = keyPair.privateKey;
      return crypto.exportPublicKey(keyPair.publicKey);
    }).then(publicKeyData => {
      dom.setValue("key", buffer.toBase64(pollData) + "_" +
                          buffer.toBase64(publicKeyData));
      copyKey();
    });
  }

  function copyKey() {
    dom.copyToClipboard("key");
  }

  function addVote() {
    let ballot = dom.getValue("ballot");
    if (!ballot || !privateKey) {
      return;
    }
    let ciphertext = buffer.fromBase64(ballot);
    crypto.decrypt(privateKey, ciphertext).then(plaintext => {
      votes.add(JSON.parse(buffer.toString(plaintext)));
      dom.setValue("count", votes.total);
      // Clear the ballot after reading to avoid repeated additions.
      dom.clearValue("ballot");
    });
  }

  function summarizeVotes() {
    if (privateKey &&
        !window.confirm(document.getElementById("sum").dataset.confirm)) {
      return;
    }
    forgetKey();
    if (votes) {
      dom.setValue("summary", votes.summarize());
    }
  }

  function forgetKey() {
    privateKey = null;
    dom.clearValue("key");
  }
}
