let testStats = {
  pending: 0,
  passed: 0,
  failed: 0
}

function test(name, syncFunction) {
  asyncTest(name, async () => syncFunction());
}

function asyncTest(name, asyncFunction) {
  testStats.pending++;
  let errorMessage;
  asyncFunction().then(() => {
    testStats.passed++;
  }).catch(error => {
    testStats.failed++;
    errorMessage = error;
  }).finally(() => {
    status(name, null, errorMessage);
    if (!--testStats.pending && self != parent) {
      parent.postMessage(testStats, "*");
    }
  });
}
