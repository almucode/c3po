let dom = {}

// Promise which is resolved when the DOM content is loaded.
dom.contentLoaded = new Promise((resolve, reject) => {
  document.addEventListener("DOMContentLoaded", resolve);
});

// Returns the value of a DOM element.
//
// Element is identified by its id and is usually an input.
dom.getValue = function(elementId) {
  return document.getElementById(elementId).value;
}

// Sets the value of a DOM element.
//
// Element is identified by its id and is usually an input.
dom.setValue = function(elementId, value) {
  document.getElementById(elementId).value = value;
}

// Clears the value of a DOM element.
//
// Element is identified by its id and is usually an input.
dom.clearValue = function(elementId) {
  dom.setValue(elementId, "");
}

// Prevents any form submission to avoid page reloads.
dom.preventFormSubmissions = function() {
  let forms = document.getElementsByTagName("form");
  for (let form of forms) {
    form.addEventListener("submit", event => {
      event.preventDefault();
    });
  }
}

// Adds a click listener to a DOM element.
//
// Element is identified by its id and is usually a button.
dom.addClickListener = function(elementId, handler) {
  document.getElementById(elementId).addEventListener("click", handler);
}

// Removes listeners from a DOM element.
//
// Element is identified by its id and is usually a button.
dom.removeListeners = function(elementId) {
  let element = document.getElementById(elementId);
  element.parentNode.replaceChild(element.cloneNode(true), element);
}

// Places the provided node (an Element or a string) in front of a sibling.
dom.prependSibling = function(sibling, node) {
  if (typeof node == "string") {
    sibling.insertAdjacentText("beforebegin", node);
  } else {
    sibling.insertAdjacentElement("beforebegin", node);
  }
}

// Places the provided child (an Element or a string) after all other children.
dom.appendChild = function(parent, child) {
  if (typeof child == "string") {
    parent.appendChild(document.createTextNode(child));
  } else {
    parent.appendChild(child);
  }
}
