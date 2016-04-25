$(document).ready(function() {
	var board = new Board();
	board.setSpace(2, true);
	board.setSpace(4, false);
	board.setSpace(5, true);
	board.showDebug();
});

function Board() {
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
	
	this.setSpace = function(space, isPlayer) {
		if (space >= 0 && space <= 8) {
			board[space] = isPlayer ? -3 : 1;
			this.calcTotals();
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
			else if (board[space === 0])
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
	
	this.calcTotals = function() {
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