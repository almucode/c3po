'use strict';

dom.contentLoaded.then(start);

function start() {
  let publicKey;
  let poll;

  dom.preventFormSubmissions();
  dom.addEnterListener("key", showForm);
  dom.addClickListener("show", showForm);
  dom.addClickListener("copy", copyBallot);

  function showForm() {
    let parts = dom.getValue("key").split("_");
    if (parts.length != 2) {
      return;
    }
    poll = JSON.parse(buffer.toString(buffer.fromBase64(parts[0])));
    let form = document.getElementById("vote");
    let button = document.getElementById("encrypt").cloneNode(true);
    while (form.lastChild) {
      form.removeChild(form.lastChild);
    }
    let n = 1;
    for (let option of poll.options) {
      let input = document.createElement("input");
      input.type = (poll.max > 1) ? "checkbox" : "radio";
      input.name = "option";
      input.id = "option" + n++;
      input.value = option;
      input.addEventListener("change", validateChange);
      let label = document.createElement("label");
      label.htmlFor = input.id;
      label.className = "after";
      label.textContent = option;
      let div = document.createElement("div");
      dom.appendChild(div, input);
      dom.appendChild(div, label);
      dom.appendChild(form, div);
    }
    dom.appendChild(form, button);
    dom.clearValue("ballot");

    crypto.importPublicKey(buffer.fromBase64(parts[1])).then(key => {
      publicKey = key;
      dom.addClickListener("encrypt", encryptVote);
    });
  }

  function getVote() {
    let vote = new Set();
    let form = document.getElementById("vote");
    for (let option of form.querySelectorAll('input[name="option"]:checked')) {
      vote.add(option.value);
    }
    return vote;
  }

  function validateChange(event) {
    if (poll.max == 1) {
      return;  // Radio buttons do not require validation.
    }
    if (!event.target.checked) {
      return;  // Unchecking a checkbox does not require validation.
    }
    if (getVote().size > poll.max) {
      event.target.checked = false;
    }
  }

  function encryptVote() {
    let vote = Array.from(getVote());
    var plaintext = buffer.fromString(JSON.stringify(vote));
    return crypto.encrypt(publicKey, plaintext).then(ciphertext => {
      dom.setValue("ballot", buffer.toBase64(ciphertext));
      copyBallot();
    });
  }

  function copyBallot() {
    dom.copyToClipboard("ballot");
  }
}
