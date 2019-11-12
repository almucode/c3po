'use strict';

dom.contentLoaded.then(start);

function start() {
  let publicKey;

  dom.preventFormSubmissions();
  dom.addEnterListener("key", showForm);
  dom.addClickListener("show", showForm);
  dom.addClickListener("copy", copyBallot);

  function showForm() {
    let parts = dom.getValue("key").split("_");
    if (parts.length != 2) {
      return;
    }
    let poll = JSON.parse(buffer.toString(buffer.fromBase64(parts[0])));
    let form = document.getElementById("vote");
    let button = document.getElementById("encrypt").cloneNode(true);
    while (form.lastChild) {
      form.removeChild(form.lastChild);
    }
    let n = 1;
    let fieldset = document.createElement("fieldset");
    for (let option of poll.options) {
      let input = document.createElement("input");
      input.type = (poll.max > 1) ? "checkbox" : "radio";
      input.name = "option";
      input.id = "option" + n++;
      input.value = option;
      let label = document.createElement("label");
      label.htmlFor = input.id;
      label.className = "after";
      label.textContent = option;
      let div = document.createElement("div");
      dom.appendChild(div, input);
      dom.appendChild(div, label);
      dom.appendChild(fieldset, div);
    }
    dom.appendChild(form, fieldset);
    dom.appendChild(form, button);
    dom.clearValue("ballot");

    crypto.importPublicKey(buffer.fromBase64(parts[1])).then(key => {
      publicKey = key;
      dom.addClickListener("encrypt", encryptVote);
    });
  }

  function encryptVote() {
    let vote = [];
    let form = document.getElementById("vote");
    for (let option of form.querySelectorAll('input[name="option"]:checked')) {
      vote.push(option.value);
    }
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
