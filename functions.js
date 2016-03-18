// A collection of algorithms using Javascript idioms

// *************************************************************
// **************** Optional Arguments *************************
// *************************************************************
Object.prototype.isNumeric = function() {
  console.log("isNumeric(" + this + ")");
  return Number.parseFloat(this) === this;
};

function sumOrCreateFunction() {
  if (arguments.length === 2) {
    if (arguments[0].isNumeric() && arguments[1].isNumeric())
      return arguments[0] + arguments[1];
    else
      return undefined;
  } else if (arguments.length === 1) {
    if (arguments[0].isNumeric()) {
      var num0 = arguments[0];
      return function(num) {
        if (num.isNumeric())
          return num0 + num;
        else
          return undefined;
      };
    } else {
      return undefined;
    }
  } else {
    return undefined;
  }
}

var x = 2;
console.log("isN(2):" + x.isNumeric());
x = "2";
console.log("isN('2'):" + x.isNumeric());
x = "blahblahblah";
console.log("isN('blahblahblah'):" + x.isNumeric());
x = "2blah";
console.log("isN('2blah'):" + x.isNumeric());
x = ["2"];
console.log("isN(['2']):" + x.isNumeric());
x = [2];
console.log("isN([2]):" + x.isNumeric());

console.log(sumOrCreateFunction(2, [3]));


// *************************************************************
// *************** Binary ASCII Converter **********************
// *************************************************************
function asciiStringToString(str) {
  var arr = str.split(" ");
  for (var i = 0; i < arr.length; ++i) {
    arr[i] = String.fromCharCode(binaryStrToDec(arr[i]));
  }
  return arr.join("");
}

function binaryStrToDec(str) {
  //console.log("str:" + str);
  var dec = 0;
  var place = 1;
  for (var i = str.length - 1; i >= 0; --i) {
    if (str[i] === "1")
      dec += place;
    place *= 2;
  }
  //console.log("dec:" + dec);
  return dec;
}

asciiStringToString("01000001 01110010 01100101 01101110 00100111 01110100 00100000 01100010 01101111 01101110 01100110 01101001 01110010 01100101 01110011 00100000 01100110 01110101 01101110 00100001 00111111");

// *************************************************************
// ******************** Flatten Array **************************
// *************************************************************
function flatten(arr) {
  function flattenBit(chunk) {
    //console.log("chunk:" + chunk);
    if (Array.isArray(chunk)) {
      for (var i = 0; i < chunk.length; ++i) {
        flattenBit(chunk[i]);
      }
    } else {
      //console.log("scalar:" + chunk);
      flat.push(chunk); //is it still true recursion if you access a global variable? dunno.
    }
  }
  
  var flat = [];
  flattenBit(arr); //start the recursion
  return flat;
}

console.log("calling flatten on: [1, [2], [3, [[4]]]]");
var final = flatten([1, [2], [3, [[4]]]]);
console.log("final:" + final);

// *************************************************************
// ***************** Sum Fibonacci ***********************
// *************************************************************
function sumFibonacciNumbers(targetFib) {
  var sum = 0;
  //console.log("targetFib: " + targetFib);
  for (var currFib = 1, prevFib = 0, tempFib; currFib <= targetFib; ) {
    sum += currFib;
    
    tempFib = currFib;
    currFib += prevFib;
    prevFib = tempFib;
  }
  return sum;
}

sumFibonacciNumbers(4);

// *************************************************************
// ****************** Find Prime Numbers ***********************
// *************************************************************
function sumPrimes(max) {
  //find primes using Sieve of Eratosthenes:
  var nonPrimes = Array(max); //array values empty; will mark composities true as found
  var cachedSqrt = Math.sqrt(max); //from Eratosthenes: once we get to sqrt(max), all composities have been marked already
  for (var curr = 2; curr <= cachedSqrt; curr++) {
    //if curr is not already marked as non-prime (ie. composite):
    if (nonPrimes[curr] !== true) {
      //mark all of the multiples of this number as composite
      //start at curr^2, since (by the sieve) all multiples from curr...curr^2 have already been matched by smaller primes
      for (var composite = curr * curr; composite <= max; composite += curr) {
        nonPrimes[composite] = true;
      }
    }
  }
  
  var sum = 0;
  for (var i = 2; i <= max; i++) {
    if (nonPrimes[i] !== true) {
      sum += i;
    }
  }
  return sum;
}

sumPrimes(10);

// *************************************************************
// **************** Least Common Multiple **********************
// *************************************************************
function leastCommonMultiple(arr) {
  var max = Math.max(arr[0], arr[1]);
  var min = Math.min(arr[0], arr[1]);
  
  //loop multiples of largest number, then % == 0 test smaller numbers:
  //exit loop with break!
  for (var largest = max ; ; largest += max) {
    var isFound = true; //I'm putting this var declaration is inside the loop because Javascript's scoping rules mean position doesn't matter unless inside a function's block{}
    for (var i = max - 1; i >= min; --i) {
      if (largest % i !== 0) {
        isFound = false;
        break;
      }
    }
    if (isFound)
      break; //also, largest is still set to LCM!
  }
  
  return largest;
}


leastCommonMultiple([5,1]);

// *************************************************************
// *************************************************************
// *************************************************************
