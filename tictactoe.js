var board = new Board();


$(document).ready(function() {
  $(".space").addClass("squareContent").before('<div class="squareDummy"></div>');
  $(".space").on("click", spaceClicked);
  $(window).on("resize", syncFontSize); 
  
	board.showDebug();
  syncFontSize();
});
function syncFontSize() {
  $(".space>span").css("font-size", ($(".space").height() * 0.85) + "px");
}

function playGame() {
	var isPlayerX = false;
	while (1) {
		var game = newGame(isPlayerX = !isPlayerX);
		do {
			game.turn();
			//TODO: need to async wait for event, so a loop won't work, will it??
		} while (game.status().isPlayable);
	}
}

function Game(isPlayerX) {
	var isCompO = isPlayerX;
	var isWaitingForPlay = false;
	var statusMessages = {
		playX: 'Play an <span class="fa fa-times"></span>',
		playO: 'Play an <span class="fa fa-circle-o"></span>',
		compWon: 'The computer won!',
		playerWon: 'You have won!',
		catsGame: "Cat's game..."
	};
	
	this.turn = function() {
		if (isCompO) {
			compTurn();
			playerTurn();
		} else {
			playerTurn();
			compTurn();
		}
	}
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
	function rowToSpaces(rowIndex) {
		//var totals = {
		//	rows: [0, 0, 0],
		//	cols: [0, 0, 0],
		//	diagLTR: 0,
		//	diagRTL: 0
		//};
		var spaces = [];
		if (rowIndex < 3) { //row
			for (var i = rowIndex * 3; i < rowIndex * 3 + 3; ++i)
				spaces.push(i);
		} else if (rowIndex < 6) {
			for (var i = rowIndex - 3; i < 9; i += 3)
				spaces.push(i);
		} else if (rowIndex == 6) {
			for (var i = 0; i <= 8; i += 4)
				spaces.push(i);
		} else if (rowIndex == 7) {
			for (var i = 2; i <= 6; i += 2)
				spaces.push(i);
		}
		return spaces;
	}
	
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
		totals = totals.map(function(oldValue, row) {
			return rowToSpaces(row).reduce(function(sum, item) { return sum + board[item]; }, 0);
		});
		// totals[0] = board[0] + board[1] + board[2]; // rows[0]
		// totals[1] = board[3] + board[4] + board[5]; // rows[1]
		// totals[2] = board[6] + board[7] + board[8]; // rows[2]
		// totals[3] = board[0] + board[3] + board[6]; // cols[0]
		// totals[4] = board[1] + board[4] + board[7]; // cols[1]
		// totals[5] = board[2] + board[5] + board[8]; // cols[2]
		// totals[6] = board[0] + board[4] + board[8]; // diagLTR
		// totals[7] = board[2] + board[4] + board[6]; // diagRTL
	};
	
	this.status = function() {
		var returnData = {
			isPlayable: true,
			isCatsGame: false,
			humanWon: false,
			compWon: false,
			winningSpaces: []
		};
		var countWinableRows = 8; // enumerate rows with at least one X and one O in it, to determine if it's Cat's Game
		for (var i = 0; i < this.totals; ++i) {
			if (this.totals[i] == 3) {
				//computer win
				returnData.isPlayable = false;
				returnData.compWon = true;
				returnData.winningSpaces = rowToSpaces(i);
			} else if (this.totals[i] == -9) {
				//human win
				returnData.isPlayable = false;
				returnData.humanWon = true;
				returnData.winningSpaces = rowToSpaces(i);
			} else if (this.totals[i] == -2 || this.totals[i] == -5 || this.totals[i] == -1) {
				--countWinableRows;
			}
		}
		if (countWinableRows == 0) {
			returnData.isPlayable = false;
			returnData.isCatsGame = true;
		}
		return returnData;
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