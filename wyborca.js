'use strict';

dom.contentLoaded.then(start);

function start() {
  let publicKey = null;

  dom.preventFormSubmissions();
  dom.addClickListener("show", showForm);
  dom.addClickListener("copy", copyBallot);

  function showForm() {
    dom.clearValue("ballot");

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
      dom.appendChild(form, div);
    }
    dom.appendChild(form, button);

    crypto.importPublicKey(buffer.fromBase64(parts[1])).then(key => {
      publicKey = key;
      dom.addClickListener("encrypt", encryptVote);
    });
  }

  function encryptVote() {
    let vote = [];
    let options = document.getElementsByName("option");
    for (let option of options) {
      if (option.checked) {
        vote.push(option.value);
      }
    }
    var plaintext = buffer.fromString(JSON.stringify(vote));
    return crypto.encrypt(publicKey, plaintext).then(ciphertext => {
      dom.setValue("ballot", buffer.toBase64(ciphertext));
    });
  }

  function copyBallot() {
    dom.copyToClipboard("ballot");
  }
}
