var size = 16;

var chessboard = "";
for (var i = 0; i < size; ++i) {
  for (var j = 0; j < size; ++j) {
    chessboard += ((j % 2 !== i % 2) ? "##" : "  ")
  }
  chessboard += "\n";
}

console.log(chessboard);