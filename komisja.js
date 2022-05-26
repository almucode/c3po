'use strict';

skin.load("skins", skin.getFromUrl() || "almu");

dom.contentLoaded.then(start);

function start(args) {
  let privateKey;
  let votes;
  let poll;

  dom.preventFormSubmissions();
  dom.addClickListener("more", addOption);
  dom.addClickListener("copy", copyKey);
  dom.addClickListener("create", createPoll);
  dom.addEnterListener("ballots", addVote);
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

  function createPoll() {
    forgetKey();

    votes = new Votes(dom.getValue("max"));
    dom.clearValue("summary");
    dom.setValue("count", 0);

    let options = dom.getValues("vote", 'input[name="option"]', true);
    if (!options.length) {
      return;
    }
    crypto.generateKeyPair().then(keyPair => {
      privateKey = keyPair.privateKey;
      poll = new Poll(options, votes.maxOptions, keyPair.publicKey);
      return poll.serialize();
    }).then(serializedPoll => {
      dom.setValue("key", serializedPoll);
      copyKey();
    });
  }

  function copyKey() {
    dom.copyToClipboard("key");
  }

  function addVote() {
    let ballots = dom.getValue("ballots");
    if (!ballots || !privateKey) {
      return;
    }
    // Split (using whitespace or punctuation) and deduplicate entries
    ballots = new Set(ballots.split(/[\s,.:;]/));
    // Clear the input and disable elements to prevent duplications/overwrites
    dom.disable("ballots");
    dom.disable("add");
    dom.clearValue("ballots");
    // Start parsing the ballots
    let promises = [];
    for (let ballot of ballots) {
      promises.push(poll.decryptVote(ballot, privateKey).then(
        vote => {
          votes.add(vote);
        },
        error => {
          dom.appendValue("ballots", ballot + "\n\n");
        }));
    }
    // Wait for all Promises
    Promise.all(promises).finally(() => {
      // Update counter
      dom.setValue("count", votes.total);
      // Unlock elements
      dom.enable("ballots");
      dom.enable("add");
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
