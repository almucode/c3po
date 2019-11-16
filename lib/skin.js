'use strict';

// Utilities for manipulating CSS skins.
let skin = {}

skin.getFromUrl = function() {
  let params = new URLSearchParams(location.search);
  let selected = params.get("skin");
  if (!selected || !selected.match(/^[a-z0-9]+$/)) {
    return null;
  }
  return selected;
}

skin.load = function(dir, name) {
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = dir + "/" + name + ".css";
  document.head.appendChild(link);
}
