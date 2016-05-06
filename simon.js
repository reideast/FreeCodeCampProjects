$(document).ready(function() {
  var isTurnedOn = false;
  var game = undefined;
  $(".simonButton").addClass("poweredDown");
  
  
  togglePower(); // DEBUG: // TODO: remove this
  
  $("#power").on("click", togglePower);
  function togglePower() {
    if (isTurnedOn) {
      isTurnedOn = false;
      game = undefined;
      $(".simonButton").addClass("poweredDown");
      $("#status").val("off");
    } else {
      isTurnedOn = true;
      game = new Simon(document.getElementById("status"));
      $(".simonButton").removeClass("poweredDown");
      $("#status").val("on");
    }
    $("#power").toggleClass("btn-primary", isTurnedOn);
  }
  
  $("#start").on("click", function(event) {
    if (isTurnedOn) {
      game.startHandler();
    }
  });
  $("#strict").on("click", function(event) {
    if (isTurnedOn) {
      game.strictHandler();
    }
  });
  // $("#counter")
  
  $(".simonButton").on("click", function(event) {
    // console.log(this.dataset.simon);
    if (isTurnedOn) {
      game.inputHandler(Number(this.dataset.simon)); //convert string from data-simon="0" to integer
    }
  });
  window.addEventListener("keydown", function(event) {
    if (event.defaultPrevented) {
      return; // do not act upon keydown because event was already used
    }
    switch(event.keyCode) {
      case 37:
      case 38:
      case 39:
      case 40:
        if (isTurnedOn) {
          event.preventDefault();
          game.inputHandler(event.keyCode - 37);
        }
    }
  });
});


var Simon = function(statusTextBox) {
  var status = statusTextBox;
  // associate sound files. see: http://stackoverflow.com/questions/9419263/playing-audio-with-javascript
  var sounds = [ //Ordered according to what the notes sound like, associated with colors according to wikipedia's info on Simon
                new Audio('https://s3.amazonaws.com/freecodecamp/simonSound4.mp3'),  // ?? -> red
                new Audio('https://s3.amazonaws.com/freecodecamp/simonSound1.mp3'),  // high E -> blue 
                new Audio('https://s3.amazonaws.com/freecodecamp/simonSound2.mp3'),  // C# -> yellow 
                new Audio('https://s3.amazonaws.com/freecodecamp/simonSound3.mp3')]; // low E -> green
  
  var optionStrict = false;
  var optionsGameLength = 20; // set as 20, per game description
  
  var sequence = [];
  var seqCurrLimit = 0; // the maximum position the player has gotten to
  var seqCurr = 0 // the position currently being worked on
  var seqLegend = ["red", "blue", "yellow", "green"]; // not actually used for game logic, just for human feedback
  
  // for finite state machine
  var states = {
    "waiting": 0,
    "starting": 1,
    "showSequence": 2,
    "waitForInput": 3,
    "wrongInput": 4,
    "gameOver": 5
  };
  var state = states.waiting;
  
  this.startHandler = function() {
    if (state == states.waiting) {
      state = states.starting;
      status.value = "starting new game";
      createSequence(optionsGameLength);
      
      // start the first turn
      seqCurrLimit++;
      showSequence();
    } else {
      state = states.waiting;
      status.value = "waiting";
    }
    $("#start").toggleClass("btn-primary", state !== states.waiting);
  };
  
  function createSequence(num) {
    sequence = [];
    seqCurrLimit = 0;
    for (var i = 0; i < num; ++i) {
      sequence.push(Math.floor(Math.random() * 4));
    }
    console.log(sequence); // DEBUG 
  }
  
  function showSequence() {
    state = states.showSequence;
    status.value = "showing sequence";
    seqCurr = 0;
    showItem(); //start showing sequence recursively
    // showItem terminates by setting state to waitForInput;
  }
  function showItem() {
    if (seqCurr >= seqCurrLimit) {
      state = states.waitForInput;
      status.value = "waiting for sequence";
      seqCurr = 0;
    } else {
      lightUp(sequence[seqCurr]);
      console.log("showing #" + seqCurr + ": " + sequence[seqCurr] + "/" + seqLegend[sequence[seqCurr]]);
      seqCurr++;
      setTimeout(showItem, 600); // TODO: make this able to be cancelled by pushing <button> start or power
    }
  }
  
  this.strictHandler = function() {
    optionStrict = !optionStrict;
    $("#strict").toggleClass("btn-danger", optionStrict);
  };
  
  
  this.inputHandler = function(buttonNum) {
    if (state == states.waitForInput) {
      console.log("Simon game is trying to handle button " + buttonNum + "/" + seqLegend[buttonNum]);
      lightUp(buttonNum);
      
      if (buttonNum === sequence[seqCurr]) { // human hit correct button
        seqCurr++;
        if (seqCurr >= seqCurrLimit) { // human got whole sequence right
          setTimeout(function() {
            seqCurrLimit++;
            showSequence();
          }, 600);
        }
      } else { // human hit incorrect button 
        if (optionStrict) {
          console.log("FAIL AUGHH"); // TODO: reset game
        } else {
          showSequence();
        } 
      }
    }
  };
  
  var buttons = [$("#button0"), $("#button1"), $("#button2"), $("#button3")];
  function lightUp(buttonNum) {
    sounds[buttonNum].play();
    buttons[buttonNum].addClass("activated");
    setTimeout(function() { buttons[buttonNum].removeClass("activated"); }, 300);
  }
};