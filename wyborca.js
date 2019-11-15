'use strict';

skin.load("skins", skin.getFromUrl() || "default");

dom.contentLoaded.then(start);

function start() {
  let poll;

  dom.preventFormSubmissions();
  dom.addEnterListener("key", showForm);
  dom.addClickListener("show", showForm);
  dom.addClickListener("copy", copyBallot);

  function showForm() {
    Poll.deserialize(dom.getValue("key")).then(deserializedPoll => {
      poll = deserializedPoll;
      let form = document.getElementById("vote");
      let button = document.getElementById("encrypt").cloneNode(true);
      dom.removeChildren(form);
      let fieldset = document.createElement("fieldset");
      if (poll.maxOptions > 1 && poll.maxOptions < poll.options.length) {
        let legend = document.createElement("legend");
        legend.textContent = form.dataset.maxLabel + " " + poll.maxOptions;
        dom.appendChild(fieldset, legend);
      }
      let n = 0;
      for (let option of poll.options) {
        let index = n++;
        let input = document.createElement("input");
        input.type = (poll.maxOptions > 1) ? "checkbox" : "radio";
        input.name = "option";
        input.value = index;
        input.id = "option" + index;
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
    let indices = dom.getValues("vote", 'input[name="option"]:checked', false);
    return poll.encryptVote(indices).then(ballot => {
      dom.setValue("ballot", ballot);
      copyBallot();
    });
  }

  function copyBallot() {
    dom.copyToClipboard("ballot");
  }
}
