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
// ***************** Change Making Problem *********************
// *************************************************************

function checkCashRegister(price, cash, cashInDrawer) {
  //greedy (OK since not asking for optimal (fewest coins) solution) see: "Canonical Coin Systems for CHANGE-MAKING Problems" http://ieeexplore.ieee.org/xpl/articleDetails.jsp?arnumber=5254395
  var changeToGive = cash * 100 - price * 100;
  if (changeToGive < 0) {
    return "Not enough cash provided";
  }
  
  var changeArr = [];
  var drawerTotal = 0;
  //console.log("denoms loop, change=" + changeToGive);
  for (var currDenom = 0; currDenom < denoms.length; ++ currDenom) {
    var denomCID = cashInDrawer.find(function(item) { return item[0] === denoms[currDenom][1]; })[1] * 100;
    var available = Math.floor(denomCID / (denoms[currDenom][0] * 100));
    var desired = Math.floor(changeToGive / (denoms[currDenom][0] * 100));
    var actual = desired;
    if (desired > available) {
      actual = available;
    }
    //console.log("changeToGive=" + changeToGive + " ¢=" + denomCID + " n=" + available + " best=" + desired + " actual=" + actual);
    var actualValue = actual * denoms[currDenom][0];
    if (actual > 0) {
      changeArr.push([denoms[currDenom][1], actualValue]);
    }
    changeToGive -= actualValue * 100;
    drawerTotal += denomCID - actualValue * 100;
  }
  
  //console.log("changeToGive=" + changeToGive);
  if (changeToGive > 0) {
    return "Insufficient Funds";
  } else if (drawerTotal <= 0) {
    return "Closed";
  } else {
    //console.log(changeArr);
    return changeArr;
  }
}

//a "key" to reference American currency denominations
//I was going to use an object, but an array is needed to guarantee order so I can loop through for the greedy algorithm
//also, can access in either direction: .find by [0] to get string and by [1] to get numeric value
//var needle = "TWENTY";
//var numberValue = denoms.find(function(item) { return item[1] === needle; })[0]; //will accessing [] directly work?
var denoms = [
  [100.00, "ONE HUNDRED"],
   [20.00, "TWENTY"],
   [10.00, "TEN"],
    [5.00, "FIVE"],
    [1.00, "ONE"],
    [0.25, "QUARTER"],
    [0.10, "DIME"],
    [0.05, "NICKEL"],
    [0.01, "PENNY"]
];

// Example cash-in-drawer array:
// [["PENNY", 1.01],
// ["NICKEL", 2.05],
// ["DIME", 3.10],
// ["QUARTER", 4.25],
// ["ONE", 90.00],
// ["FIVE", 55.00],
// ["TEN", 20.00],
// ["TWENTY", 60.00],
// ["ONE HUNDRED", 100.00]]

console.log("*** START ***");
//checkCashRegister(19.50, 20.00, [["PENNY", 1.01], ["NICKEL", 2.05], ["DIME", 3.10], ["QUARTER", 4.25], ["ONE", 90.00], ["FIVE", 55.00], ["TEN", 20.00], ["TWENTY", 60.00], ["ONE HUNDRED", 100.00]]);
checkCashRegister(3.26, 100.00, [["PENNY", 1.01], ["NICKEL", 2.05], ["DIME", 3.10], ["QUARTER", 4.25], ["ONE", 90.00], ["FIVE", 55.00], ["TEN", 20.00], ["TWENTY", 60.00], ["ONE HUNDRED", 100.00]]);
console.log("*************");

// *************************************************************
// ********* Update an Array With a Similar Array **************
// *************************************************************

function updateInventory(curInv, newInv) {
  //ideas:
  // convert curInv to Object, add/update from newInv, then use Object.keys(myObj).sort() to shove back into an array alphabetically
  // start with an empty Array, add from cur or new??
  
  var invObj = {};
  for (var i = 0; i < curInv.length; ++i) {
    invObj[curInv[i][1]] = curInv[i][0];
  }
  for (i = 0; i < newInv.length; ++i) {
    if (newInv[i][1] in invObj) {
      invObj[newInv[i][1]] += newInv[i][0];
    } else {
      invObj[newInv[i][1]] = newInv[i][0];
    }
  }
  var updatedInv = [];
  var invKeys = Object.keys(invObj).sort();
  for (i = 0; i < invKeys.length; ++i) {
    updatedInv.push([invObj[invKeys[i]], invKeys[i]]);
  }
  return updatedInv;
}

//// Example inventory lists
//var curInv = [
//    [21, "Bowling Ball"],
//    [2, "Dirty Sock"],
//    [1, "Hair Pin"],
//    [5, "Microphone"]
//];
//
//var newInv = [
//    [2, "Hair Pin"],
//    [3, "Half-Eaten Apple"],
//    [67, "Bowling Ball"],
//    [7, "Toothpaste"]
//];
//
//updateInventory(curInv, newInv);

updateInventory([[21, "Bowling Ball"], [2, "Dirty Sock"], [1, "Hair Pin"], [5, "Microphone"]], [[2, "Hair Pin"], [3, "Half-Eaten Apple"], [67, "Bowling Ball"], [7, "Toothpaste"]]);


// *************************************************************
// ********************** Permutations *************************
// *************************************************************

function factorial(n) {
  var product = 1;
  for (var i = 1; i <= n; ++i) {
    product *= i;
  }
  return product;
}

function permAlone(str) {
  /* Idea for figuring out permutations
  new method: ("aabb")=8
  P(4,4) = 24
  "a" group: (aa)(b)(b) = P(3,3) * P(a.len, a.len); b the same
  P(4,4) - P(3,3)*P(2,2) - P(3,3)*P(2,2) + ??
  24 - 12 - 12 + ??
  if counting both groups: (aa)(bb) = P(2,2) = 2
  P("a".len) + P("b".len) = 4
  24 - 12 - 12 + 2*4
  =8, desired result
  */
  
  console.log(str);
  var groups = {};
  for (var i = 0; i < str.length; ++i) {
    if (str[i] in groups)
      ++groups[str[i]];
    else
      groups[str[i]] = 1;
  }
  console.log(groups);
  var keys = Object.keys(groups);
  console.log(keys);
  
  var totalPermutations = factorial(str.length);
  console.log("totalPermutations:" + totalPermutations);
  
  var totalGroups = keys.length;
  var multiGroupCount = 0;
  var sumPermutationsOfContinousGroups = 0;
  for (i = 0; i < keys.length; ++i) {
    if (groups[keys[i]] > 1) {
      ++multiGroupCount;
      console.log("Multi-group:" + keys[i]);
      //amount to subtract from totalPermutations:
      var nWithThisCharGrouped = str.length - groups[keys[i]] + 1;
      console.log("nWithThisCharGrouped:" + nWithThisCharGrouped);
      console.log("subtracting:" + (factorial(nWithThisCharGrouped) * factorial(groups[keys[i]])));
      totalPermutations -= factorial(nWithThisCharGrouped) * factorial(groups[keys[i]]);
      
      sumPermutationsOfContinousGroups += factorial(groups[keys[i]]);
    }
  }
  //add back in permutations that have overlapping groups:
  if (multiGroupCount > 1) {
  console.log("adding back:" + (sumPermutationsOfContinousGroups * factorial(totalGroups)));
  totalPermutations += sumPermutationsOfContinousGroups * factorial(totalGroups);
  }  
  console.log("FINAL:" + totalPermutations);
  return totalPermutations;
  
  
  //figure out TOTAL # of permutations without repetition (don't care about consecutive letters):
  // P(n, r) = number permutations choose r of them -> P(str.length, str.length)
  // P(x, x) = x!
  /*
  aabcdef n = 7, 7! = 5040
  expected answer = 3600
  diff = 1440
  question to answer is is: how many permutations w/o rep where two items are next to each other?
  theory: is the situation now: n = 6, r = 6? ie. (aa)(b)(c)(d)(e)(f) == 6 items
  P(6,6) = 720
  720 * 2 = 1440.
  maybe * 2 b/c each (aa) actually is (a1,a2) AND (a2,a1)
  so, * P(2,2)
  
  n = total str.length, groups = # of groups of unique chars
  P(n,n) - (P(group.len)) * (P(#groups, #groups))
  
  checking: ("aab")=2
  P(3, 3) = 6
  need to get: 4
  # of groups: 2
  P(2, 2) = 2
  P(n,n) - (P(group.len)) * (P(#groups, #groups)) = P(3,3) - P(2,2) * P(2,2) = 6 - 2*2 = 2
  
  
  checking: ("aabb")=8
  P(4,4) = 24
  need to get -16
  # of groups: (aa)(bb) = 2
  P(2,2) = 2
  16/2 = 8
  2 groups, 4 chars?
  ("aAbB")
  aAbB
  aABb
  AabB
  AaBb
  bBaA
  bBAa
  BbAa
  BbaA
  
  abBA
  aBbA
  AbBa
  ABba
  baAB
  bAaB
  BaAb
  BAab
  
  abAB
  aBAb
  AbaB
  ABab
  baBA
  bABa
  BabA
  BAba
  ***********
  group "a": 2 chars, together in 12 (8+4) of the total permutations
  consider this: ("aAbB") --> (aA)(b)(B) --> 3 groups --> P(3,3)=6
    for group "b", also P(3,3)=6
    multiply by 2 (size of group) because for each "aa", there is an "aA" and "Aa"
  overlap situation, ie. permutations where both "a" and "b" groups are contiuous: 8 for each
  unique situtaion, ie. where only that group is continuous: 4 for each
  
  
  ******
  new method: ("aabb")=8
  P(4,4) = 24
  "a" group: (aa)(b)(b) = P(3,3) * P(a.len, a.len); b the same
  P(4,4) - P(3,3)*P(2,2) - P(3,3)*P(2,2) + ??
  24 - 12 - 12 + ??
  if counting both groups: (aa)(bb) = P(2,2) = 2
  P("a".len) + P("b".len) = 4
  24 - 12 - 12 + 2*4
  =8, desired result
  
  
  checking: ("abfdefa")->("aaffbde")=2640
  P(7,7) = 5040
  need to get -2400
  # of groups: (aa)(ff)(b)(d)(e) = 5
  P(5,5) = 120
  2400/120 = 20
  5 * 4? 5 groups, 4 chars?
  chars in repeating groups: 4
  P(4,4) = 24
  - chars = 20 * P(5,5)
  
  
  P(n,n) - (P(group.len)) * (P(#groups, #groups))
  continuous exclusions from "a" group, as if f's were different chars: P(2,2) * P(6,6) = 1440
  same for "f": 1440
  "subtract permutations as if this group was the only repeated character group"
  1440 * 2 need to get 2400, difference is 480
  if counting both "a" and "f", # of groups is 5, P(5,5) = 120
  P(group"a".len) + (+ or *?) P(group"f".len) = 4
  120 * 4 = 480
  5040 - 1440 - 1440 + 480 == 2640
  "add back in permutations counting ALL repeated character groups * permutations of the length of EACH repeated char group"
  
  
  
  checking: ("aaa")=0
  P(3,3) = 6
  need to get -6
  # of groups: (aaa) = 1
  P(1,1) = 1
  6/1 = 6
  1 groups, 3 chars ??? huh???
  P(3,3) - (P(3,3) * P(1,1)) + nothing, since there's only one group
  
  checking: ("zzzzzzzz")=0
  P(8,8) = 40320
  need to get - 40320
  # of groups (zzzzzzzzz) = 1
  P(1,1) = 1
  chars in repeating group #1: 8
    P(8,8) = 40320
  P(8,8) - P(8,8) * P(1,1) + 0 = 0
  
  */
}

permAlone('aab');
// permAlone("aab") should return a number.
// permAlone("aab") should return 2.
// permAlone("aaa") should return 0.
// permAlone("aabb") should return 8.
// permAlone("abcdefa") should return 3600.
// permAlone("abfdefa") should return 2640.
// permAlone("zzzzzzzz") should return 0.

// *************************************************************
// *************************************************************
// *************************************************************



// *************************************************************
// *************************************************************
// *************************************************************
