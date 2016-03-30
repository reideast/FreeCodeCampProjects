$(document).ready(function () {
  resetTimer();
  $("#btnStart").on("click", function() {
    if (intervalID === undefined) {
      intervalID = window.setInterval(updateTimer, 1000);
      $("#btnStart").html('<i class="fa fa-2x fa-pause-circle-o"></i>');
    } else {
      window.clearInterval(intervalID);
      $("#btnStart").html('<i class="fa fa-2x fa-pause-circle"></i>');
      intervalID = undefined;
    }
  });
  
  $("#btnReset").on("click", function() {
    $("#btnStart").html('<i class="fa fa-2x fa-play-circle-o"></i>');
    if (intervalID !== undefined) {
      window.clearInterval(intervalID);
      intervalID = undefined;
    }
    resetTimer();
  });
});

var WORK = 5 * 60; //25 min
var BREAK = 1 * 60; //5 min
var currWork = WORK;
var currBreak = BREAK;
var working = true;
var intervalID;

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
