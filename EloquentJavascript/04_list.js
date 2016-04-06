console.log(arrayToList([10, 20]));
// → {value: 10, next: {value: 20, next: null}}
console.log(listToArray(arrayToList([10, 20, 30])));
// → [10, 20, 30]
console.log(prepend(10, prepend(20, null)));
// → {value: 10, next: {value: 20, next: null}}
console.log(nth(arrayToList([10, 20, 30]), 1));
// → 20
console.log(listToArray(append(40, prepend(0, append(30, append(20, append(10, null)))))));
// → [ 0, 10, 20, 30, 40 ]

// **** List Format ****
// var list = {
//   value: 1,
//   next: {
//     value: 2,
//     next: {
//       value: 3,
//       next: null
//     }
//   }
// };

function arrayToList(array) {
  if (array.length > 0) {
    var head = {
      value: array[0],
      next: null
    };
    var prev = head;
    for (var i = 1; i < array.length; i++) {
      prev.next = {
        value: array[i],
        next: null
      }
      prev = prev.next;
    }
    return head;
  } else {
    return undefined;
  }
}

function listToArray(list) {
  var curr = list;
  var array = [];
  while (curr) {
    array.push(curr.value);
    curr = curr.next;
  }
  return array;
}

function prepend(val, list) {
  return {value: val, next: list};
  // if (list) {
  //   return {value: val, next: list};
  // } else { //list is null
  //  return {value: val, next: null};
  // }
}

function append(val, list) {
  if (list) {
    var curr = list;
    while (curr.next) {
      curr = curr.next;
    }
    curr.next = {value: val, next: null};
    return list;
  } else {
    return {value: val, next: null};
  }
}

// function nth(list, n) {
//   var curr = list;
//   var count = 0;
//   while (curr) {
//     if (count++ === n) {
//       return curr.value;
//     }
//     curr = curr.next;
//   }
//   return undefined;
// }

// Recursive version of nth()
function nth(list, n) {
  if (list) {
    if (n === 0) {
      return list.value;
    } else {
      return nth(list.next, n - 1);
    }
  } else {
    return undefined;
  }
}
