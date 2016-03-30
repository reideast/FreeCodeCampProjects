$(document).ready(function () {
  resetTimer();
  // $("#btnStart").on("click", function() {
    var intervalID = window.setInterval(updateTimer, 1000);
  // });
});

var DEBUG = true;
var WORK = 5 * 60; //25 min
var BREAK = 1 * 60; //5 min
var currWork = WORK;
var currBreak = BREAK;
var working = true;

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
  console.log("currWork=" + currWork);
  console.log("currBreak=" + currBreak);
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
  
}
function eventBreakIsDone() {
  
}
function verbalAlarm() {
  
}

function updateDigital() {
  $("#min").text(Math.floor((working ? currWork : currBreak) / 60));
  var sec = (working ? currWork : currBreak) % 60;
  $("#sec").text((sec < 10 ? "0" : "") + sec);
}

function updateAnalog() {
  $("#barWork").css("width", (currWork / WORK) * 100 + "%");
  $("#barBreak").css("width", (currBreak / BREAK) * 100 + "%");
}
