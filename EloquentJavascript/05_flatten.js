function flatten(arr) {
  // var flat = [];
  // flattenBit(arr); //start the recursion
  arr = arr.reduce(function(prevValue, bit) {
    if (Array.isArray(bit)) {
      return prevValue.concat(flatten(bit));
    } else {
      return prevValue.concat(bit);
    }
  }, []);
  
  return arr;
}

var array = [[1, 2, 3], [4, 5], [6]];
console.log("calling flatten on: " + JSON.stringify(array));
array = flatten(array);
console.log("flattened: " + JSON.stringify(array));

array = [1, [2], [3, [[4]]]];
console.log("calling flatten on: " + JSON.stringify(array));
array = flatten(array);
console.log("flattened: " + JSON.stringify(array));
