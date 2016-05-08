$(document).ready(function() {
  var isTurnedOn = false;
  var game = undefined;
  $(".simonButton").addClass("poweredDown");
  
  
  togglePower(); // DEBUG: // TODO: remove this
  
  $("#power").on("click", togglePower);
  function togglePower() {
    if (isTurnedOn) {
      game.powerDown(function() {
        isTurnedOn = false;
        game = undefined;
        $(".simonButton").addClass("poweredDown");
        $("#controls").addClass("poweredDown");
        $("#status").val("off");
      });
    } else {
      isTurnedOn = true;
      game = new Simon(document.getElementById("status"));
      $(".simonButton").removeClass("poweredDown");
      $("#controls").removeClass("poweredDown");
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
  
  // Using Howler.js, by James Simpson, a sound library that support simultaneous playing of audio clips
  // MIT License, Copyright (c) 2013-2014 James Simpson and GoldFire Studios, Inc.
  // http://goldfirestudios.com/blog/104/howler.js-Modern-Web-Audio-Javascript-Library & https://github.com/goldfire/howler.js
  // Simon Sounds provided by FreeCodeCamp. License unknown.
  var sounds = [ //Ordered according to what the notes sound like, associated with colors according to wikipedia's info on Simon
                new Howl({ urls: ['http://s3.amazonaws.com/freecodecamp/simonSound4.mp3'] }),  // ?? -> red
                new Howl({ urls: ['http://s3.amazonaws.com/freecodecamp/simonSound1.mp3'] }),  // high E -> blue 
                new Howl({ urls: ['http://s3.amazonaws.com/freecodecamp/simonSound2.mp3'] }),  // C# -> yellow 
                new Howl({ urls: ['http://s3.amazonaws.com/freecodecamp/simonSound3.mp3'] })]; // low E -> green
                
  // "Ding.wav" by Tim Kahn/corsica_s on freesound.org (https://www.freesound.org/people/Corsica_S/sounds/91926/), Copyright Tim Kahn. This work is licensed under Creative Commons Attribution License (http://creativecommons.org/licenses/by/3.0/). No changes were made. 
  var soundIncorrect = new Howl({ urls: ['http://dev.andreweast.net/simon/91926__corsica-s__ding.wav'], volume: 0.5}); // ding sound
  
  var optionStrict = false;
  var optionsGameLength = 20; // set as 20, per project description
  
  var sequence = [];
  var seqCurrLimit = 0; // the maximum position the player has gotten to
  var seqCurr = 0 // the position currently being worked on
  var seqLegend = ["red", "blue", "yellow", "green"]; // not actually used for game logic, just for human feedback
  
  var timeoutSequence = undefined;
  
  // for finite state machine
  var states = {
    "inactive": 0,
    "starting": 1,
    "showSequence": 2,
    "waitForInput": 3,
    "wrongInput": 4,
    "correctSequence": 5,
    "gameOver": 6
  };
  var state = states.inactive;
  
  updateCounter("--"); // set display after device turns on
  
  this.startHandler = function() {
    window.clearTimeout(timeoutSequence);
    state = states.starting;
    status.value = "starting new game";
    createSequence(optionsGameLength);
    updateCounter("--");
    // start the first turn after animating the counter
    flashCounter(1600, function() {
      seqCurrLimit++;
      updateCounter(seqCurrLimit);
      showSequence();
    });
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
      timeoutSequence = setTimeout(showItem, 600); // TODO: make this able to be cancelled by pushing <button> start or power
    }
  }
  
  this.strictHandler = function() {
    optionStrict = !optionStrict;
    $("#strict").toggleClass("btn-danger", optionStrict);
  };
  
  this.inputHandler = function(buttonNum) {
    if (state == states.waitForInput) {
      console.log("Human input: " + buttonNum + "/" + seqLegend[buttonNum]);
      lightUp(buttonNum);
      
      if (buttonNum === sequence[seqCurr]) { // human hit correct button
        seqCurr++;
        if (seqCurr >= seqCurrLimit) { // human got whole sequence right
          state = states.correctSequence;
          timeoutSequence = setTimeout(function() {
            seqCurrLimit++;
            if (seqCurrLimit > optionsGameLength) { // this sequence has been has long as the winning sequence
              state = states.gameOver;
              states.value = "you won!";
              playWinningSequence();
            } else {
              updateCounter(seqCurrLimit);
              showSequence();
            }
          }, 600);
        }
      } else { // human hit incorrect button
        state = states.wrongInput;
        states.value = "wrong input";
        if (optionStrict) {
          console.log("FAIL AUGHH"); // TODO: reset game here
        } else {
          timeoutSequence = setTimeout(function() {
            updateCounter("X");
            playErrorSound();
            flashCounter(1600, function() {
              updateCounter(seqCurrLimit);
              showSequence();
            });
          }, 600);
        }
      }
    }
  };
  
  var buttons = [$("#button0"), $("#button1"), $("#button2"), $("#button3")];
  function lightUp(buttonNum) {
    if (buttonNum >= 0 && buttonNum < sounds.length) {
      sounds[buttonNum].play();
      buttons[buttonNum].addClass("activated");
      setTimeout(function() { buttons[buttonNum].removeClass("activated"); }, 300);
    } else {
      console.log("Error: lightUp() activated invalid button: " + buttonNum);
    }
  }
  function playErrorSound() {
    // sounds[1].play();
    // setTimeout(function() {
    //   sounds[3].play();
    // }, 250);
    soundIncorrect.play();
  }
  function playWinningSequence(num) {
    if (num === undefined) num = 3; // start sequence at "3" if the argument was NOT passed
    if (num >= 0) {
      lightUp(num % buttons.length);
      timeoutSequence = setTimeout(playWinningSequence, 400, num - 1);
    }
  }
  
  function updateCounter(val) {
    if (val === undefined) {
      $("#counter").val("");
    } else if (val === "--" || val === "X") {
      $("#counter").val(val);
    } else if ($.isNumeric(val)) {
      $("#counter").val((val < 10) ? "0" + val : val);
    } else {
      console.log("Error: Simon.updateCounter given invalid value: " + val);
    }
  }
  function flashCounter(totalDelay, callback) {
    var delay = totalDelay / 5;
    timeoutSequence = setTimeout(function() {
      $("#counter").addClass("counterBlank");
      timeoutSequence = setTimeout(function() {
        $("#counter").removeClass("counterBlank");
        timeoutSequence = setTimeout(function() {
          $("#counter").addClass("counterBlank");
          timeoutSequence = setTimeout(function() {
            $("#counter").removeClass("counterBlank");
            if (callback && typeof(callback) === "function")
              timeoutSequence = setTimeout(callback, delay);
          }, delay);
        }, delay);
      }, delay);
    }, delay);
  }
  
  this.powerDown = function(callback) {
    window.clearTimeout(timeoutSequence);
    updateCounter();
    if (callback && typeof(callback) === "function")
      callback();
  };
};