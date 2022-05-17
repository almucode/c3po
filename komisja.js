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
    let input = document.getElementById("ballot");
    if (!input.value || !privateKey) {
      return;
    }
    // Disable elements to prevent duplications/overwrites
    input.disable = true;
    let button = document.getElementById("add");
    button.disable = true;
    // Split (using predefined separators) and deduplicate ballots
    let separators = /\n|\r|,| |\.|:|;/;
    let ballots = [...new Set(input.value.split(separators).filter(n => n))];
    // Clear the input, so if decryption takes time, user can see it's started
    input.value = "";
    // Now we can add each vote
    let promises = []
    for (let b in ballots) {
      promises.push(poll.decryptVote(ballots[b], privateKey).then(vote => {
        votes.add(vote);
      }, error => {input.value += ballots[b] + "\n\n";}));
    }
    // Wait for all Promises to fulfill
    Promise.all(promises).finally(() => {
      // Update counter
      dom.setValue("count", votes.total);
      // Unlock elements
      button.disable = false;
      input.disable = false;
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
