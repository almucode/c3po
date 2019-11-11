function status(name, href, error) {
  let div = document.createElement("div");
  div.style.padding = "0.5em";
  div.style.color = "white";
  div.innerHTML = name + ": " + (error || "OK");
  div.style.background = error ? "red" : "green";
  let a;
  if (href) {
    a = document.createElement("a");
    a.href = href;
    a.append(div);
  }
  if (!document.body) {
    document.body = document.createElement("body");
  }
  document.body.append(a || div);
}
