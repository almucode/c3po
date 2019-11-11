let suiteStats = {
  pending: 0,
  passed: 0,
  failed: 0
}

onmessage = function(event) {
  let failed = event.data.failed;
  if (failed) {
    suiteStats.failed++;
  } else {
    suiteStats.passed++;
  }
  for (iframe of document.getElementsByTagName('iframe')) {
    if (iframe.contentWindow == event.source) {
      let src = iframe.dataset.src;
      status(src, src, failed ? failed + " failed" : null);
    }
  }
  if (!--suiteStats.pending && self != parent) {
    parent.postMessage(suiteStats, "*");
  }
};

function suite(path) {
  suiteStats.pending++;
  let iframe = document.createElement("iframe");
  iframe.src = path;
  iframe.dataset.src = path;
  if (!document.body) {
    document.body = document.createElement("body");
  }
  document.body.append(iframe);
}
