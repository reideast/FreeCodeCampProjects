var DEBUG = true;

$(document).ready(function () {
  
  resetTimer();
  
  $("#btnStart").on("click", function() {
    if (intervalID === undefined) {
      intervalID = window.setInterval(updateTimer, 1000);
      $("#btnStart").html('<i class="fa fa-2x fa-fw fa-pause"></i>');
    } else {
      window.clearInterval(intervalID);
      $("#btnStart").html('<i class="fa fa-2x fa-fw fa-play"></i>');
      intervalID = undefined;
    }
  });
  
  $("#btnReset").on("click", function() {
    $("#btnStart").html('<i class="fa fa-2x fa-fw fa-play"></i>');
    if (intervalID !== undefined) {
      window.clearInterval(intervalID);
      intervalID = undefined;
    }
    resetTimer();
  });
  
  $(".btn-spinner").on("click", function() {
    
  });
  // data-linked-control="#workValue" data-spinner-delta="1"
});

var WORK = 25 * 60; //25 min
var BREAK = 5 * 60; //5 min
var currWork = WORK;
var currBreak = BREAK;
var working = true;
var intervalID;

//see: http://stackoverflow.com/questions/9419263/playing-audio-with-javascript
var chimeWorkDone = new Audio('http://dev.andreweast.net/FreeCodeCamp/chimeToBreak Zen Buddhist Temple Bell-SoundBible.com-331362457.mp3');
// "Zen Buddhist Temple Bell Sound" Recorded by Mike Koenig, from http://soundbible.com/1491-Zen-Buddhist-Temple-Bell.html, licensed under Creative Commons Attribution 3.0 https://creativecommons.org/licenses/by/3.0/
var chimeBreakDone = new Audio('http://dev.andreweast.net/FreeCodeCamp/chimeToWork Japanese Temple Bell Small-SoundBible.com-113624364.mp3');
// "Japanese Temple Bell Small Sound" Recorded by Mike Koenig, from http://soundbible.com/1496-Japanese-Temple-Bell-Small.html, licensed under Creative Commons Attribution 3.0 https://creativecommons.org/licenses/by/3.0/

function resetTimer() {
  currWork = WORK;
  currBreak = BREAK;
  working = true;
  resetAnalog();
  updateDigital();
  updateAnalog();
}
function resetAnalog() {
  $("#barWorkContainer").css("width", "calc(" + WORK + " / " + (WORK + BREAK) + " * 100%)");
  $("#barBreakContainer").css("width", "calc(" + BREAK + " / " + (WORK + BREAK) + " * 100%)");
}

function updateTimer() {
  if (DEBUG) console.log("currWork=" + currWork +"\n" + "currBreak=" + currBreak);
  if (working) {
    --currWork;
    currBreak = BREAK * (1 - (currWork / WORK)); //for display purposes only
    if (currWork <= 0) {
      currWork = 0;
      currBreak = BREAK;
      working = false;
      eventWorkIsDone();
    }
  } else {
    --currBreak;
    currWork = WORK * (1 - (currBreak / BREAK));
    if (currBreak <= 0) {
      currBreak = 0;
      currWork = WORK;
      working = true;
      eventBreakIsDone();
    }
  }
  updateDigital();
  updateAnalog();
}

function eventWorkIsDone() {
  chimeWorkDone.play();
}
function eventBreakIsDone() {
  chimeBreakDone.play();
}

function updateDigital() {
  $("#min").text(Math.floor((working ? currWork : currBreak) / 60));
  var sec = (working ? currWork : currBreak) % 60;
  $("#sec").text((sec < 10 ? "0" : "") + sec);
}

function updateAnalog() {
  $("#barWork").css("width", (currWork / WORK) * 100 + "%");
  $("#barBreak").css("width", (currBreak / BREAK) * 100 + "%");
  // $("#barWork").animate({width: (currWork / WORK) * 100 + "%"}, 1000);
  // $("#barBreak").animate({width: (currBreak / BREAK) * 100 + "%"}, 1000);
}
