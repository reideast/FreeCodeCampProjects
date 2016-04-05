console.log(range(1, 10));
// → [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
console.log(range(5, 2, -1));
// → [5, 4, 3, 2]
console.log(sum(range(1, 10)));
// → 55

function range(low, high, step) {
  if (low > high) {
    var temp = low;
    var low = high;
    var high = temp;
  }
  if (step === undefined)
    var step = 1;
  var arr = [];
  for ( ; low <= high; low += step) {
    arr.push(low);
  }
  return arr;
}

function sum(arr) {
  var sum = 0;
  for (var i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}