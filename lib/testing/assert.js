let assert = {}

assert.equal = function(lhs, rhs) {
  if (lhs !== rhs) {
    throw new AssertionError(lhs + " != " + rhs);
  }
}

assert.valuesEqual = function(lhs, rhs) {
  let lhsIter = lhs.values();
  let rhsIter = rhs.values();
  while (true) {
    let lhsNext = lhsIter.next();
    let rhsNext = rhsIter.next();
    if (lhsNext.done && rhsNext.done) {
      return;
    }
    if (lhsNext.done || rhsNext.done || lhsNext.value !== rhsNext.value) {
      throw new AssertionError(lhs + " != " + rhs);
    }
  }
}

assert.jsonEqual = function(lhs, rhs) {
  assert.equal(JSON.stringify(lhs), JSON.stringify(rhs));
}

assert.notNull = function(obj) {
  if (obj === null) {
    throw new AssertionError("Should not be null");
  }
}

assert.throws = function(syncFunction, mustInclude) {
  try {
    syncFunction();
  } catch (error) {
    if (error.toString().includes(mustInclude)) {
      return;
    }
    throw new AssertionError("Unexpected error: " + error);
  }
  throw new AssertionError("Didn't throw");
}

assert.asyncThrows = function(asyncFunction, mustInclude) {
  return new Promise((resolve, reject) => {
    asyncFunction().then(() => {
      reject(new AssertionError("Didn't throw"));
    }).catch(error => {
      if (error.toString().includes(mustInclude)) {
        resolve();
      }
      reject(new AssertionError("Unexpected error: " + error));
    });
  });
}

class AssertionError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}
