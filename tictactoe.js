var board = new Board();


$(document).ready(function() {
  $(".space").addClass("squareContent").before('<div class="squareDummy"></div>');
  $(".space").click(spaceClicked);
  $(window).resize(syncFontSize); 
  
	board.showDebug();
  syncFontSize();
});
function syncFontSize() {
  $(".space>span").css("font-size", ($(".space").height() * 0.85) + "px");
}

function spaceClicked() {
  var space = $(this).data("space");
  // console.log("Clicked #" + space);
  if (board.isEmpty(space))
    board.setPlayer(space);
  else if (board.getSpace(space) == -1)
    board.setComp(space);
  else
    board.clearSpace(space);
  syncBoard();
	board.showDebug();
}
function syncBoard() {
  $(".space").each(function(i) {
    var val = board.getSpace(this.dataset.space);
    var className;
    if (val == 0)
      className = "";
    else if (val == -1)
      className = "fa fa-times";
    else if (val == 1)
      className = "fa fa-circle-o";
    this.firstChild.className = className;
  });
}

function Board() {
  // idea for this tic-tac-toe logic:
  // keep track of totals for all winning rows/cols/diags
  //   computer is 1, player is -3
  //   rows where the human has played anything are always negative, and the compute has no chance of winning
  //   rows which the human has to be blocked are total < -3
  //   rows where the computer has a chance of winning are higher
  // therefore, chose from totals by number: first, block a human win. then, chose any row/col/diag by highest first
	var board = [0,0,0, 0,0,0, 0,0,0]; // 0 for blank, 1 for computer, -3 for player
	var totals = [0,0,0, 0,0,0, 0,0];
	//var totals = {
	//	rows: [0, 0, 0],
	//	cols: [0, 0, 0],
	//	diagLTR: 0,
	//	diagRTL: 0
	//};
	
	this.showDebug = function() {
		var output = "";
		var i = 0;
		for (var row = 0; row < 3; ++row) {
			output += "&nbsp;&nbsp;";
			for (var col = 0; col < 3; ++col) {
				output += n2(board[i++]);
			}
			output += n2(totals[row]) + "<br>";
		}
		output += n2(totals[7]) + n2(totals[3]) + n2(totals[4]) + n2(totals[5]) + n2(totals[6]);
		$("#debug").html(output);
		
		function n2(n) {
			return (n < 0 ? "" : "&nbsp;") + n;
		}
	};
	
  this.setPlayer = function(space) { setSpace(space, -3); };
  this.setComp = function(space) { setSpace(space, 1); };
  this.clearSpace = function(space) { setSpace(space, 0); };
  function setSpace(space, val) {
		if (space >= 0 && space <= 8) {
			// board[space] = isPlayer ? -3 : 1;
      board[space] = val;
			calcTotals();
		} else {
			console.log("Tried to set space with invalid space number: " + space);
		}
	};
	this.getSpace = function(space) {
		if (space >= 0 && space <= 8) {
			if (board[space] === 1)
				return 1;
			else if (board[space] === -3)
				return -1;
			else if (board[space] === 0)
				return 0;
			else
				console.log("Got space # " + space + " with invalid value: " + board[space]);
		} else {
			console.log("Tried to get space with invalid space number: " + space);
		}
	};
	this.isEmpty = function(space) {
		return this.getSpace(space) === 0;
	};
	
	function calcTotals() {
		totals[0] = board[0] + board[1] + board[2]; // rows[0]
		totals[1] = board[3] + board[4] + board[5]; // rows[1]
		totals[2] = board[6] + board[7] + board[8]; // rows[2]
		totals[3] = board[0] + board[3] + board[6]; // cols[0]
		totals[4] = board[1] + board[4] + board[7]; // cols[1]
		totals[5] = board[2] + board[5] + board[8]; // cols[2]
		totals[6] = board[0] + board[4] + board[8]; // diagLTR
		totals[7] = board[2] + board[4] + board[6]; // diagRTL
	};
	
	// returns what the computer should do next
	this.compNextMove = function() {
		var bestTotal = this.totals.reduce(function(max, curr) {
			return Math.max(max, curr);
		}, 0);
		console.log("compNextMove: bestTotal: " + bestTotal);
		var bestMoves = [];
		
		var bestSpace;
		return bestSpace;
	};
}