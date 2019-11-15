'use strict';

dom.contentLoaded.then(start);

function start() {
  let poll;

  dom.preventFormSubmissions();
  dom.addEnterListener("key", showForm);
  dom.addClickListener("show", showForm);
  dom.addClickListener("copy", copyBallot);

  function showForm() {
    Poll.deserialize(dom.getValue("key")).then(deserialized => {
      poll = deserialized;
      let form = document.getElementById("vote");
      let button = document.getElementById("encrypt").cloneNode(true);
      while (form.lastChild) {
        form.removeChild(form.lastChild);
      }
      let n = 1;
      let fieldset = document.createElement("fieldset");
      if (poll.maxOptions > 1 && poll.maxOptions < poll.options.length) {
        let legend = document.createElement("legend");
        legend.textContent = form.dataset.maxLabel + " " + poll.maxOptions;
        dom.appendChild(fieldset, legend);
      }
      for (let option of poll.options) {
        let input = document.createElement("input");
        input.type = (poll.maxOptions > 1) ? "checkbox" : "radio";
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
      dom.addClickListener("encrypt", encryptVote);
    });
  }

  function encryptVote() {
    let vote = dom.getValues("vote", 'input[name="option"]:checked', false);
    var plaintext = buffer.fromString(JSON.stringify(vote));
    return crypto.encrypt(poll.publicKey, plaintext).then(ciphertext => {
      dom.setValue("ballot", buffer.toBase64(ciphertext));
      copyBallot();
    });
  }

  function copyBallot() {
    dom.copyToClipboard("ballot");
  }
}
