describe("ArraySeq", function() {
  var testArray = [[1, 2, 3],
                   [2, 3, "blah", null, {prop: "hello", prop2: 313159}, 4, 5, 1],
                   [],
                   [null]];
  var invalidArray = ["blah",
                      42,
                      null];
  
  it("creates an Iterable object containing an exact copy of the array from an array", function() {
    var exampleObj = new ArraySeq(testArray[0]);
    expect(exampleObj.obj).toBe(testArray[0]);
  });
  
  it("throws an ArgumentException when constructed with a non-array object", function() {
    // wrapping "new" in a function because .toThrow needs to be passed a function
    var badFunc = function() {new ArraySeq(invalidArray[0])};
    expect(badFunc).toThrowError(ArgumentException);
    // never mind! do it this way, with bind()!
    expect(ArraySeq.bind(undefined, invalidArray[0])).toThrow();
  });
  
  it ("iterates over the contained array, returning the same data", function() {
    for (var test = 0; test < testArray.length; ++test) {
      var seq = new ArraySeq(testArray[test]);
      for (var i = 0; i < testArray[test].length; ++i) {
        expect(seq.getNext()).toBe(testArray[test][i]);
      }
    }
  });
  
  it ("iterates over the contained data, stopping when the array is done", function() {
    for (var test = 0; test < testArray.length; ++test) {
      var seq = new ArraySeq(testArray[test]);
      var i = 0;
      var curr = undefined;
      while (curr = seq.getNext()) {
        expect(curr).toBe(testArray[test][i++]);
      }
    }
  });
});

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