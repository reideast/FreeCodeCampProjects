$(document).ready(function() {
  var game = new Simon();
  
  $(".simonButton").on("click", function(event) {
    console.log(this.dataset.simon);
    game.inputHandler(Number(this.dataset.simon));
  });
  window.addEventListener("keydown", function(event) {
    var button = 0;
    switch(event.keyCode) {
      case 38:
      case 37:
        
        event.preventDefault();
      case 39:
      case 40:
      
    }
    console.log("keydown");
    console.log(event.keyCode);
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