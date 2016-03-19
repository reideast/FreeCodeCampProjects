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
  var nonPrimes = Array(max); //array of same length as mas, all values are empty; will mark composities true as found
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
// **** Validate Telephone Number Using Finite State Machine *** 
// *************************************************************

String.prototype.isDigit = function() {
  if (this[0] >= "0" && this[0] <= "9")
    return true;
  else
    return false;
};

function telephoneCheck(str) {
  // using a finite state machine:
  var states = {
    total: 6,
    countryCode: true, // 1[ ]...
    prefixParens: true, // ...(555)[ ]...
    prefixDash: true, // ...555-555...
    prefixSpace: true, // ...555 555...
    
    midDash: true, // ...555-5555
    midSpace: true, // ...555 5555
    
    foundAreaCode: false, //(555)
    foundTriplet: false, //555
    foundQuartet: false, //5555
    
    foundOpenParens: false, // ...(...
    foundPureNumbers: false, // ...5555555555
    
    foundSpaceAfterCountryCode: false //1 [(]555...
  };
  
  var runLength = 0; //how many numbers in a row
  
  str = str.trim();
  for (var i = 0; i < str.length; ++i) {
    if (states.foundQuartet) { //&& area code && Triplet
      states.total = 0; //there was more stuff after a completed, valid phone number
    } else if (str[i].isDigit()) {
      runLength++;
      
      if (i === 0 && str[i] !== "1") {
        states.countryCode = false;
        states.total--;
      } else if (runLength > 4 && (states.foundAreaCode || states.foundTriplet || states.foundQuartet)) {
        states.total = 0; //run length too long! short-circuit
      } else if (runLength === 10) {
        states.foundPureNumbers = true;
        states.midDash = states.midSpace = false;
        states.prefixDash = states.prefixParens = states.prefixSpace = false;
        states.total = 1;
      } else if (runLength > 10) {
        states.total = 0;
      }
    } else { //not isDigit()
      if (runLength === 3) {
        if (!states.foundAreaCode) {
          if (str[i] === ")") {
            if (states.prefixParens && states.foundOpenParens) {
              states.foundAreaCode = true;
            } else {
              states.total = 0; //there was no opening "("
            }
          } else if (str[i] === "-") {
            if (states.prefixDash) {
              states.prefixParens = states.prefixSpace = false;
              states.total -= 2;
              states.foundAreaCode = true;
            } else {
              states.total = 0; //got a dash when expecting ")"
            }
          } else if (str[i] === " ") {
            if (states.prefixSpace) {
              states.prefixDash = states.prefixParens = false;
              states.total -= 2;
              states.foundAreaCode = true;
            } else {
              states.total = 0; //was expecting a ")"
            }
          } else {
            //the only valid chars following area code are /)- /
            states.total = 0;
          }
        } else if (!states.foundTriplet) {
          if (str[i] === "-") {
            if (states.midDash) {
              states.midSpace = false;
              states.total--;
              states.foundTriplet = true;
            } else {
              states.total = 0; //got a dash when expecting ")"
            }
          } else if (str[i] === " ") {
            if (states.prefixDash) { //cannot have: 555-555 5555
              states.total = 0;
            } else if (states.midSpace) {
              states.midDash = false;
              states.total--;
              states.foundTriplet = true;
            }
          } else {
            //the only valid chars following Triplet are /- /
            states.total = 0;
          }
        } else { //already found both area code and triplet!
          states.total = 0;
        }
      //} else if (runLength === 4) {
      //  if (!states.foundTriplet) { //&& !states.foundAreaCode
      //    states.total = 0;
      //  } else if (!states.foundQuartet) {
      //    states.total = 0; //no characters are allowed after a quartet, except spaces, which are already .trim()'d
      //  }
      } else if (runLength === 1) {
        if (states.foundAreaCode) {
          states.total = 0; //country code no longer allowed
        } else if (states.countryCode) {
          if (str[i] === "(") {
            states.foundOpenParens = true;
            states.prefixSpace = states.prefixDash = false;
            states.total -= 2;
          } else if (str[i] === " ") {
            //a space doesn't inform anything about prefix
            states.foundSpaceAfterCountryCode = true;
          }
        } else { //only a country code can be runLength = 1
          states.total = 0;
        }
      } else if (runLength === 0) {
        if (i === 0 && str[i] === "(") {
          states.countryCode = false;
          states.foundOpenParens = true;
          states.prefixSpace = states.prefixDash = states.pureNumbers = false;
          states.total -= 3;
        } else if (!states.foundAreaCode && states.foundSpaceAfterCountryCode) {
          states.foundSpaceAfterCountryCode = false; //can't find twice
          if (str[i] === "(") {
            states.foundOpenParens = true;
            states.prefixSpace = states.prefixDash = states.pureNumbers = false;
            states.total -= 3;
          } else { //can ONLY be "1 (..."
            states.total = 0;
          }
        } else if (str[i] === " " ) {
          if (i > 0 && str[i - 1] === ")" && states.foundAreaCode && !states.foundTriplet) {
            //space after area code paren: "...555) ..."
          } else {
            states.total = 0; //format disallows double spaces...
          }
        } else {
          states.total = 0; //no other valid double punctuation
        }
      } else { //TODO: are there any other valid run lengths?
        states.total = 0;
      }
      
      runLength = 0;
    }
    
    if (states.total <= 0)
      return false;
  }
  
  if (states.foundQuartet) {
    return true;
  } else if (states.foundPureNumbers) {
    return true;
  } else {
    if (runLength === 4) {
      return true;
    } else {
      return false;
    }
  }
  
  //go to the end of the string, with at least one state valid
  //return true;
}


telephoneCheck("1 (555) 555-5555");
// telephoneCheck("555-555-5555") should return a boolean.
// telephoneCheck("1 555-555-5555") should return true.
// telephoneCheck("1 (555) 555-5555") should return true.
// telephoneCheck("5555555555") should return true.
// telephoneCheck("555-555-5555") should return true.
// telephoneCheck("(555)555-5555") should return true.
// telephoneCheck("1(555)555-5555") should return true.
// telephoneCheck("1 555)555-5555") should return false.
// telephoneCheck("1 555 555 5555") should return true.
// telephoneCheck("1 456 789 4444") should return true.
// telephoneCheck("123**&!!asdf#") should return false.
// telephoneCheck("55555555") should return false.
// telephoneCheck("(6505552368)") should return false
// telephoneCheck("2 (757) 622-7382") should return false.
// telephoneCheck("0 (757) 622-7382") should return false.
// telephoneCheck("-1 (757) 622-7382") should return false
// telephoneCheck("2 757 622-7382") should return false.
// telephoneCheck("10 (757) 622-7382") should return false.
// telephoneCheck("27576227382") should return false.
// telephoneCheck("(275)76227382") should return false.
// telephoneCheck("2(757)6227382") should return false.
// telephoneCheck("2(757)622-7382") should return false.
// telephoneCheck("555)-555-5555") should return false.
// telephoneCheck("(555-555-5555") should return false.


// *************************************************************************
// *** Set Theory: Union, Intersection, Difference, Symmetric Difference ***
// *************************************************************************
function sym(args) {
  if (arguments.length > 0) {
    //console.log("args[0]: " + arguments[0]);
    var current = arguments[0];
    for (var i = 1; i < arguments.length; ++i) {
      //console.log("args["+i+"]: " + arguments[i]);
      //definition of symetric difference: https://en.wikipedia.org/wiki/Symmetric_difference
      //sym diff = union minus intersection
      current = complement(union(current, arguments[i]), intersection(current, arguments[i]));
      //console.log("result: " + current);
    }
    return current;
  } else { //no arguments
    return [];
  }
}


//function: complement(...)
// takes two Arrays, first the master, second the set to "subtract" from the master
// returns the complement/difference (set theory) of the two arrays
function complement(master, remove) {
  var markToRemove = Array(master.length); //don't have to initialize array values, since we will only check for positive correlation later, not either value
  for (var i = 0; i < remove.length; ++i) {
    var found = 0;
    while ((found = master.indexOf(remove[i], found)) !== -1) {
      markToRemove[found] = true;
      found++;
    }
  }
  //console.log("markToRemove:" + markToRemove);
  var reduced = [];
  for (i = 0; i < markToRemove.length; ++i) {
    if (!markToRemove[i]) {
      reduced.push(master[i]);
    }
  }
  return reduced;
}

//function: intersection(...)
// takes a variable length argument list of Arrays
// returns the intersection (set theory) of all those arrays
function intersection(args) {
  var intersect = arguments[0];
  for (var i = 1; i < arguments.length; ++i) {
    var tempArray = [];
    for (var j = 0; j < arguments[i].length; ++j) {
      if (intersect.indexOf(arguments[i][j]) !== -1 && tempArray.indexOf(arguments[i][j]) === -1) {
          tempArray.push(arguments[i][j]);
      }
    }
    intersect = tempArray.slice(0); //shallow clone array
  }
  return intersect;
}

//function: union(...)
// takes a variable length argument list of Arrays
// returns the union (set theory) of all those arrays
function union(args) {
  var combined = [];
  for (var i = 0; i < arguments.length; ++i) {
    combined = combined.concat(arguments[i]);
  }
  var reduced = [];
  for (i = 0; i < combined.length; ++i) {
    if (reduced.indexOf(combined[i]) === -1) {
      reduced.push(combined[i]);
    }
  }
  return reduced;
}


//symettric diff: A delta B === (A union B) minus (A intersection B)
console.log("**** START ****");
//console.log("sym([1, 2, 3], [5, 2, 1, 4])");
//console.log(sym([1, 2, 3], [5, 2, 1, 4]));
console.log("sym([3,3,3,2,5], [2,1,5,7])");
console.log(sym([3,3,3,2,5], [2,1,5,7]));
console.log("***************");


// *************************************************************
// *************************************************************
// *************************************************************

