$(document).ready(function() {
	// add CSS to each .square to make it a dynamically-resizing square
  $(".space").addClass("squareContent").before('<div class="squareDummy"></div>');
	
	// fit X/O into squares
  $(window).on("resize", syncFontSize); 
  syncFontSize();
  
	// start a game, which will recursively call itself
	playGame(true);
});
function syncFontSize() {
  $(".space>span").css("font-size", ($(".space").height() * 0.85) + "px");
}


function playGame(isComputerFirst) {
	var game = new Game(isComputerFirst, function() {
		playGame(!isComputerFirst);
	});
	// if (game.status().isPlayable)
}

function Game(isComputerFirst, callback) {
	// var isComputerFirst = isComputerFirst;
	// var postGameFunction = callback;
	
	var board = new Board();
	var statusMessages = {
		playX: 'Play an <span class="fa fa-times"></span>',
		playO: 'Play an <span class="fa fa-circle-o"></span>',
		compWon: 'The computer won!',
		playerWon: 'You have won!',
		catsGame: "Cat's game..."
	};
	
	// remove all click event handlers from the squares
	$(".space").off("click");
	
	// let computer go first if O's
	if (isComputerFirst) {
		computerTurn();
	}
	$("#status").html(statusMessages.playX);
  $(".space").on("click", spaceClickEvent);
	
	function spaceClickEvent() {
		var space = $(this).data("space");
		// console.log("Clicked #" + space);
		if (board.isEmpty(space))
			humanTurn(space);
	}
	function humanTurn(space) {
		if (board.isEmpty(space)) {
			board.setPlayer(space);
			syncBoard();
			var status = board.status();
			if (status.isPlayable) {
				computerTurn();
			} else {
				gameOver(status);
			}
		} else {
			throw new Error("ComputerTurn tried to play in a filled space.");
		}
	}
	function computerTurn() {
		var space = board.computerNextMove();
		if (board.isEmpty(space)) {
			board.setComp(space);
			syncBoard();
			var status = board.status();
			if (!status.isPlayable) {
				gameOver(status);
			}
		} else {
			throw new Error("ComputerTurn tried to play in a filled space.");
		}
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
		board.showDebug();
	}
	
	function gameOver(status) {
		var message = "";
		if (status.isCatsGame) {
			$(".space").each(function() {
				this.firstChild.className = this.firstChild.className + " catsGame";
			});
			message = "catsGame";
		} else { // someone is a winner
			if (status.winningSpaces.length > 0) {
				$(".space").each(function() {
					status.winningSpaces.forEach(function(item) {
						if (item == this.dataset.space)
							this.firstChild.className = this.firstChild.className + " winner";
					}, this);
				});
			}
			if (status.humanWon)
				message = "playerWon";
			else if (status.compWon)
				message = "compWon";
		}
		$("#status").html(statusMessages[message]);
		$("#clickToContinue").show();
		
		$(".space").off("click").on("click", function() {
			$(".space").each(function() {
				this.firstChild.className = "";
			});
			$("#clickToContinue").hide();
			callback();
		});
	}
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
		var output = "Debug:<br>";
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
		var winableRows = 8; // enumerate rows with at least one X and one O in it, to determine if it's Cat's Game
		for (var i = 0; i < totals.length; ++i) {
			if (totals[i] == 3) {
				//computer win
				returnData.isPlayable = false;
				returnData.compWon = true;
				returnData.winningSpaces = returnData.winningSpaces.concat(rowToSpaces(i));
			} else if (totals[i] == -9) {
				//human win
				returnData.isPlayable = false;
				returnData.humanWon = true;
				returnData.winningSpaces = returnData.winningSpaces.concat(rowToSpaces(i));
			} else if (totals[i] == -2 || totals[i] == -5 || totals[i] == -1) { //unwinable totals
				--winableRows;
			}
		}
		if (winableRows == 0) {
			returnData.isPlayable = false;
			returnData.isCatsGame = true;
		}
		return returnData;
	};
	
	// use totals[] to have the board advise what the computer should do next
	this.computerNextMove = function() {
		// look through all the rows to find one that can win!
		for (var i = 0; i < totals.length; ++i) {
			if (totals[i] == 2) { // 2 = 1 + 1 ie. two-in-a-row
				console.log("Found a row to WIN! row#: " + i);
				// look through row to find the empty space
				var rowSpaces = rowToSpaces(i);
				for (var j = 0; j < rowSpaces.length; ++j) {
					if (board[rowSpaces[j]] == 0) { // if empty
						return rowSpaces[j]; // return immediately FTW
					}
				}
			}
		}
		
		// look for a row that need to be blocked
		for (var i = 0; i < totals.length; ++i) {
			if (totals[i] == -6) { // -6 = -3 + -3
				console.log("Found a row to block!! row#: " + i);
				// look through row to find the empty space
				var rowSpaces = rowToSpaces(i);
				for (var j = 0; j < rowSpaces.length; ++j) {
					if (board[rowSpaces[j]] == 0) { // if empty
						return rowSpaces[j]; // gotta block it now!
					}
				}
			}
		}
		
		// find the highest total, which will be the smartest rows to play
		//   start with max at the worst possible total, -9
		var bestTotal = totals.reduce(function(max, curr) {
			return Math.max(max, curr);
		}, -9);
		console.log("computerNextMove: bestTotal: " + bestTotal);
		var bestRows = []; // bestRows is still here just for debug
		var bestMoves= [];
		totals.forEach(function(item, row) {
			if (item == bestTotal) {
				bestRows.push(row);
				rowToSpaces(row).forEach(function(space) {
					if (board[space] == 0)
						bestMoves.push(space); // push duplicates, making them more likely to be chosen
				});
			}
		});
		console.log("bestRows: " + bestRows + " bestMoves: " + bestMoves);
		
		// assert
		if (bestMoves.length === 0) {
			throw new Error("There were no open spaces in any of the row #'s (" + bestRows + ") with the best totals (" + bestTotal + ").");
		}
	
		// choose a random space from those selected
		// because spaces that could win multiple rows show up more often in the array, they will be more likely to be chosen
		//   the computer could choose these duplicates 100% of the time, but I didn't want it to be entirely that smart
		var bestSpace = bestMoves[Math.floor(Math.random() * bestMoves.length)];
		return bestSpace;
	};
}
