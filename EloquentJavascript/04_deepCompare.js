var obj = {here: {is: "an"}, object: 2};
console.log(deepEqual(obj, obj));
// → true
console.log(deepEqual(obj, {here: 1, object: 2}));
// → false
console.log(deepEqual(obj, {here: {is: "an"}, object: 2}));
// → true

function deepEqual(a, b) {
  if (typeof a === "object" && typeof b === "object") {
    //deep comparision needed:
    if (Object.keys(a).length !== Object.keys(b).length) {
      return false;
    }
    for (var prop in a) {
      if (b.hasOwnProperty(prop)) {
        if (!deepEqual(a[prop], b[prop]))
          return false;
      } else {
        return false;
      }
    }
    return true;
  } else if (typeof a === "array" && typeof b === "array") {
    if (a.length === b.length) {
      for (var i = 0; i < a.length; ++i) {
        if (!deepEqual(a[i], b[i]))
          return false;
      }
      return true;
    } else {
      return false;
    }
  } else {
    //scalar variables for at least one argument
    return a === b;
  }
}