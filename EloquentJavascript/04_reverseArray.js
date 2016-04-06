console.log(reverseArray(["A", "B", "C"]));
// → ["C", "B", "A"];
var arrayValue = [1, 2, 3, 4, 5];
reverseArrayInPlace(arrayValue);
console.log(arrayValue);
// → [5, 4, 3, 2, 1]
arrayValue.push(0);
reverseArrayInPlace(arrayValue);
console.log(arrayValue);
// → [0, 1, 2, 3, 4, 5]

function reverseArray(array) {
  var newArr = Array(array.length);
  for (var i = 0, j = array.length - 1; i < array.length; i++, j--) {
    newArr[j] = array[i];
  }
  return newArr;
}

function reverseArrayInPlace(array) {
  var half = Math.floor(array.length / 2);
  for (var i = 0, j = array.length - 1; i <= half; i++, j--) {
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}