// Your code here.
function Iterator() {
  this.pointer = 0;
  this.obj = undefined;
  //allows starting the iterator over at the beginning
  this.reset = function() {
    return undefined;
  }
  //returns the next item in the sequence, or "undefined" if past the end of the sequence
  //what happens if an item in the sequence is actually equal to "null", "undefined", or "false"?
  this.getNext = function() {
    return undefined;
  }
}

function ArraySeq(array) {
  if (!(array instanceof Array)) {
    throw new ArgumentException("Invalid array: " + array);
  }
  this.pointer = -1;
  this.obj = array;
}
ArraySeq.prototype = Object.create(Iterator.prototype);
ArraySeq.prototype.reset = function() {
  this.pointer = -1;
}
ArraySeq.prototype.getNext = function() {
  this.pointer++;
  if (this.pointer < this.obj.length) {
    return this.obj[this.pointer];
  } else {
    return undefined;
  }
}

function RangeSeq(min, max) {
  this.min = min;
  this.max = max;
  this.pointer = min;
}
RangeSeq.prototype = Object.create(Iterator.prototype);
RangeSeq.prototype.reset = function() {
  this.pointer = this.min;
}
RangeSeq.prototype.getNext = function() {
  if (this.pointer <= this.max) {
    return this.pointer++;
  } else {
    return undefined;
  }
}

function logFive(iterator) {
  iterator.reset();
  var count = 0;
  var curr = undefined;
  while (count++ < 5 && (curr = iterator.getNext()) !== undefined) {
    console.log(curr);
  }
}



// extend Error
function ArgumentException(message) {
  this.message = message;
  this.stack = (new Error()).stack;
}
ArgumentException.prototype = Object.create(Error.prototype);
ArgumentException.prototype.name = "ArgumentException";


// logFive(new ArraySeq([1, 2]));
// // → 1
// // → 2
// logFive(new ArraySeq([1, false, 2]));
// logFive(new ArraySeq([1, null, 2]));
// logFive(new ArraySeq([1, undefined, 2]));
// logFive(new RangeSeq(100, 1000));
// // → 100
// // → 101
// // → 102
// // → 103
// // → 104
// logFive(new RangeSeq(100, 102));