logFive(new ArraySeq([1, 2]));
// → 1
// → 2
logFive(new ArraySeq([1, false, 2]));
logFive(new ArraySeq([1, null, 2]));
logFive(new ArraySeq([1, undefined, 2]));
logFive(new RangeSeq(100, 1000));
// → 100
// → 101
// → 102
// → 103
// → 104
logFive(new RangeSeq(100, 102));