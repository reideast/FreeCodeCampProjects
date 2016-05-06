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
  
  // Using Howler.js, by James Simpson, a sound library that support simultnaeous playing of audio clips
  // MIT License, Copyright (c) 2013-2014 James Simpson and GoldFire Studios, Inc.
  // http://goldfirestudios.com/blog/104/howler.js-Modern-Web-Audio-Javascript-Library & https://github.com/goldfire/howler.js
  var sounds = [ //Ordered according to what the notes sound like, associated with colors according to wikipedia's info on Simon
                new Howl({ urls: ['http://s3.amazonaws.com/freecodecamp/simonSound4.mp3'] }),  // ?? -> red
                new Howl({ urls: ['http://s3.amazonaws.com/freecodecamp/simonSound1.mp3'] }),  // high E -> blue 
                new Howl({ urls: ['http://s3.amazonaws.com/freecodecamp/simonSound2.mp3'] }),  // C# -> yellow 
                new Howl({ urls: ['http://s3.amazonaws.com/freecodecamp/simonSound3.mp3'] })]; // low E -> green
  
  var optionStrict = false;
  var optionsGameLength = 20; // set as 20, per game description
  
  var sequence = [];
  var seqCurrLimit = 0; // the maximum position the player has gotten to
  var seqCurr = 0 // the position currently being worked on
  var seqLegend = ["red", "blue", "yellow", "green"]; // not actually used for game logic, just for human feedback
  
  // for finite state machine
  var states = {
    "inactive": 0,
    "starting": 1,
    "showSequence": 2,
    "waitForInput": 3,
    "wrongInput": 4,
    "gameOver": 5
  };
  var state = states.inactive;
  
  this.startHandler = function() {
    if (state === states.inactive) {
      state = states.starting;
      status.value = "starting new game";
      createSequence(optionsGameLength);
      updateCounter("--");
      flashCounter(1600);
      
      // start the first turn after a delay
      setTimeout(function() {
        seqCurrLimit++;
        updateCounter(seqCurrLimit);
        showSequence();
      }, 1600);
    } else {
      state = states.inactive;
      status.value = "inactive";
    }
    $("#start").toggleClass("btn-primary", state !== states.inactive);
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
            updateCounter(seqCurrLimit);
            showSequence();
          }, 600);
        }
      } else { // human hit incorrect button 
        if (optionStrict) {
          console.log("FAIL AUGHH"); // TODO: reset game here
        } else {
          setTimeout(function() {
            showSequence();
          }, 600);
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
  
  function updateCounter(val) {
    if (val === "--") {
      $("#counter").val("--");
    } else if ($.isNumeric(val)) {
      $("#counter").val((val < 10) ? "0" + val : val);
    } else {
      console.log("Error: Simon.updateCounter given invalid value: " + val);
    }
  }
  function flashCounter(totalDelay) {
    var delay = totalDelay / 4;
    setTimeout(function() {
      $("#counter").addClass("counterBlank");
      setTimeout(function() {
        $("#counter").removeClass("counterBlank");
        setTimeout(function() {
          $("#counter").addClass("counterBlank");
          setTimeout(function() {
            $("#counter").removeClass("counterBlank");
          }, delay);
        }, delay);
      }, delay);
    }, delay);
  }
  
};