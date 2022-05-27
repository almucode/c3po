'use strict';

skin.load("skins", skin.getFromUrl() || "almu");

dom.contentLoaded.then(start);

function start() {
  let poll;

  dom.preventFormSubmissions();
  dom.addEnterListener("key", showForm);
  dom.addClickListener("show", showForm);
  dom.addClickListener("copy", copyBallot);

  function showForm() {
    let key = dom.getValue("key");
    if (!key) {
      return;
    }
    dom.setValue("id", Poll.generateId());
    Poll.deserialize(key).then(deserializedPoll => {
      poll = deserializedPoll;
      let form = document.getElementById("vote");
      let fieldset = document.getElementById("fieldset");
      dom.removeChildren(fieldset);
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
      dom.clearValue("ballot");
      dom.addClickListener("encrypt", encryptVote);
    });
  }

  function encryptVote() {
    let id = dom.getValue("id");
    let indices = dom.getValues("vote", 'input[name="option"]:checked', false);
    return poll.encryptVote(id, indices).then(ballot => {
      dom.setValue("ballot", ballot);
      copyBallot();
    });
  }

  function copyBallot() {
    dom.copyToClipboard("ballot");
  }
}
