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
    let max = document.getElementById("max");
    let options = Number(max.getAttribute("max")) + 1
    let label = form.querySelector('label[name="order"]').cloneNode(true);
    label.textContent = options
    dom.prependSibling(button, label);
    let option = form.querySelector('input[name="option"]').cloneNode(true);
    option.value = "";
    dom.prependSibling(button, option);
    max.setAttribute("max", options);
  }

  function createPoll() {
    forgetKey();

    votes = new Votes(document.getElementById("max").value);
    dom.clearValue("summary");
	document.getElementById("count").textContent = 0;

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
    let ballot = dom.getValue("ballot");
    if (!ballot || !privateKey) {
      return;
    }
    poll.decryptVote(ballot, privateKey).then(vote => {
      votes.add(vote);
      document.getElementById("count").textContent = votes.total;
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
