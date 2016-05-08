$(document).ready(function() {
  var isTurnedOn = false;
  var game = undefined;
  $(".simonButton").addClass("poweredDown");
  $("#controls button").addClass("poweredDown");
  $("#status").val("off");
  
  $("#power").on("click", togglePower);
  function togglePower() {
    if (isTurnedOn) {
      game.powerDown(function() {
        isTurnedOn = false;
        game = undefined;
        $(".simonButton").addClass("poweredDown");
        $("#controls button").addClass("poweredDown");
        $("#status").val("off");
      });
    } else {
      isTurnedOn = true;
      game = new Simon("button0", "button1", "button2", "button3", "strict", "counter", "status");
      $(".simonButton").removeClass("poweredDown");
      $("#controls button").removeClass("poweredDown");
      $("#status").val("on");
    }
    $("#power").toggleClass("btnPressed", isTurnedOn);
  }
  
  $("#start").on("click", function(event) {
    if (game) {
      game.startButtonHandler();
    }
  });
  $("#strict").on("click", function(event) {
    if (game) {
      game.strictButtonHandler();
    }
  });
  
  $(".simonButton").on("click", function(event) {
    if (game) {
      game.inputHandler(Number(this.dataset.simon)); //convert string from data-simon="0" to integer
    }
  });
  window.addEventListener("keydown", function(event) {
    if (event.defaultPrevented) {
      return; // do not act upon this keydown event because event was already used
    }
    switch(event.keyCode) {
      case 37:
      case 38:
      case 39:
      case 40:
        if (game) {
          event.preventDefault();
          game.inputHandler(event.keyCode - 37);
        }
    }
  });
});


var Simon = function(btn0ID, btn1ID, btn2ID, btn3ID, btnStrictID, txtCounterID, txtStatusID) {
  var status =  document.getElementById(txtStatusID);
  var counter = $("#" + txtCounterID);
  var strict = $("#" + btnStrictID);
  var buttons = [$("#" + btn0ID), $("#" + btn1ID), $("#" + btn2ID), $("#" + btn3ID)];
  
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
  var soundIncorrect = new Howl({ urls: ['http://dev.andreweast.net/simon/91926__corsica-s__ding.wav'], volume: 0.3}); // ding sound
  
  var optionStrict = false;
  var optionsGameLength = 20; // set as 20, per project description
  
  var sequence = [];
  var seqCurrLimit = 0; // the maximum position the player has gotten to
  var seqCurr = 0 // the position currently being worked on
  var seqLegend = ["red", "blue", "yellow", "green"]; // not actually used for game logic, just for human feedback
  
  var timeoutSequence = undefined;
  
  // finite state machine to handle asyncrounous event handling
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
  
  // start a new game
  // note: instantly stops a game in process, and starts over with a new sequence
  this.startButtonHandler = function() {
    window.clearTimeout(timeoutSequence);
    state = states.starting;
    status.value = "starting new game";
    createSequence(optionsGameLength);
    updateCounter("--");
    // start the first turn (after animating the counter)
    flashCounter(1600, function() {
      seqCurrLimit++;
      updateCounter(seqCurrLimit);
      showSequence();
    });
  };
  
  // create a random sequence
  function createSequence(num) {
    sequence = [];
    seqCurrLimit = 0;
    for (var i = 0; i < num; ++i) {
      sequence.push(Math.floor(Math.random() * 4));
    }
    // console.log(sequence); // DEBUG and/or cheating
  }
  
  // start showing the sequence, up to seqCurrLimit
  function showSequence() {
    state = states.showSequence;
    status.value = "showing sequence";
    seqCurr = 0;
    showItem(); //start showing sequence recursively
    //note: showItem's side effect is setting state to waitForInput when finished
  }
  function showItem() {
    if (seqCurr >= seqCurrLimit) {
      state = states.waitForInput;
      status.value = "waiting for sequence";
      seqCurr = 0;
    } else {
      // console.log("showing #" + seqCurr + ": " + sequence[seqCurr] + "/" + seqLegend[sequence[seqCurr]]); // DEBUG and/or cheating
      lightUp(sequence[seqCurr]);
      seqCurr++;
      timeoutSequence = setTimeout(showItem, 600); // recursive call
    }
  }
  
  this.strictButtonHandler = function() {
    optionStrict = !optionStrict;
    strict.toggleClass("btnPressed", optionStrict);
  };
  
  this.inputHandler = function(buttonNum) {
    // use the Finite State Machine to only respond to input when ready for it
    if (state == states.waitForInput) {
      // console.log("Human input: " + buttonNum + "/" + seqLegend[buttonNum]); // DEBUG
      lightUp(buttonNum);
      
      if (buttonNum === sequence[seqCurr]) // human hit correct button
        correctButton();
      else // human hit incorrect button
        wrongButton();
    }
  };
  function correctButton() {
    seqCurr++; // got this item correct, move on to the next
    if (seqCurr >= seqCurrLimit) { // human got whole sequence right
      state = states.correctSequence;
      timeoutSequence = setTimeout(function() {
        seqCurrLimit++; // present the sequence again with one more added on
        if (seqCurrLimit > optionsGameLength) { // this sequence was the whole winning sequence
          state = states.gameOver;
          states.value = "you won!";
          playWinningAnimation();
        } else {
          updateCounter(seqCurrLimit);
          showSequence();
        }
      }, 1000);
    }
  }
  function wrongButton() {
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
  
  function lightUp(buttonNum) {
    if (buttonNum >= 0 && buttonNum < sounds.length) {
      sounds[buttonNum].play();
      buttons[buttonNum].addClass("activated");
      setTimeout(function() { buttons[buttonNum].removeClass("activated"); }, 300);
    } else {
      console.log("Error: lightUp() activated invalid button: " + buttonNum);
    }
  }
  function playErrorSound() { // for one button incorrect
    soundIncorrect.play();
  }
  function playFailingAnimation() { // for game over
    lightUp(1); //sounds[1].play();
    setTimeout(function() {
      lightUp(3); //sounds[3].play();
    }, 250);
    
  }
  function playWinningAnimation(num) { // recursive function to cycle through the buttons
    if (num === undefined) num = 3; // start sequence at "3" if the argument was NOT passed
    if (num >= 0) {
      lightUp(num % buttons.length);
      timeoutSequence = setTimeout(playWinningAnimation, 400, num - 1);
    }
  }
  
  function updateCounter(val) {
    if (val === undefined) {
      counter.val("");
    } else if (val === "--" || val === "X") {
      counter.val(val);
    } else if ($.isNumeric(val)) {
      counter.val((val < 10) ? "0" + val : val);
    } else {
      console.log("Error: Simon.updateCounter given invalid value: " + val);
    }
  }
  function flashCounter(totalDelay, callback) {
    var delay = totalDelay / 5;
    timeoutSequence = setTimeout(function() {
      counter.addClass("counterBlank");
      timeoutSequence = setTimeout(function() {
        counter.removeClass("counterBlank");
        timeoutSequence = setTimeout(function() {
          counter.addClass("counterBlank");
          timeoutSequence = setTimeout(function() {
            counter.removeClass("counterBlank");
            if (callback && typeof(callback) === "function")
              timeoutSequence = setTimeout(callback, delay);
          }, delay);
        }, delay);
      }, delay);
    }, delay);
  }
  
  this.powerDown = function(callback) {
    window.clearTimeout(timeoutSequence);
    strict.removeClass("btnPressed");
    updateCounter();
    if (callback && typeof(callback) === "function")
      callback();
  };
};