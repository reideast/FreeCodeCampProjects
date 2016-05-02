$(document).ready(function() {
  var game = new Simon();
  
  $(".simonButton").on("click", function(event) {
    // console.log(this.dataset.simon);
    game.inputHandler(Number(this.dataset.simon)); //convert string from data-simon="0" to integer
  });
  window.addEventListener("keydown", function(event) {
    if (event.defaultPrevented) {
      return; // do not act upon keydown; event was already used
    }
    switch(event.keyCode) {
      case 37:
      case 38:
      case 39:
      case 40:
        event.preventDefault();
        game.inputHandler(event.keyCode - 37);
    }
  });
});

var Simon = function() {
  // for finite state machine
  var states = [
    "off",
    "starting",
    "showSequence",
    "waitForInput",
    "wrongInput",
    "gameOver"
  ];
  var state = 0;
  
  this.inputHandler = function(buttonNum) {
    console.log("Simon game is trying to handle button #" + buttonNum);
    if (buttonNum === 0)
      console.log("Exact match to 0");
  };
};