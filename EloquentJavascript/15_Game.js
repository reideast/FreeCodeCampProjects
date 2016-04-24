
function runGame(plans, Display) {
  function startLevel(n) {
    runLevel(new Level(plans[n]), Display, function(status) {
      if (status === "lost")
        startLevel(n);
      else if (n < plans.length - 1)
        startLevel(n + 1);
      else
        console.log("You've won all the levels!");
    });
  }
  startLevel(0);
}

var arrowCodes = {37: "left", 38: "up", 39: "right", 32: "space"};
var arrows = trackKeys(arrowCodes);

function trackKeys(codes) {
  var pressed = Object.create(null);
  function handler(event) {
    // console.log(event.keyCode);
    if (codes.hasOwnProperty(event.keyCode)) {
      var down = (event.type == "keydown");
      pressed[codes[event.keyCode]] = down;
      event.preventDefault();
    }
  }
  addEventListener("keydown", handler);
  addEventListener("keyup", handler);
  return pressed;
}

function runAnimation(frameFunc) {
  var lastTime = null;
  function frame(time) {
    var stop = false;
    if (lastTime !== null) {
      var timeStep = Math.min(time - lastTime, 100) / 1000; //only animate ONE second of frames, maximum
      //also, convert milliseconds to full seconds, which level.animate(step, ) will use
      stop = (frameFunc(timeStep) === false); // execute level.animate()! (and get boolean status back to quit)
    }
    lastTime = time;
    if (!stop)
      requestAnimationFrame(frame);
  }
  
  requestAnimationFrame(frame);
}

function runLevel(level, Display, andThen) {
  var display = new Display(document.body, level);
  runAnimation(function(step) {
    level.animate(step, arrows);
    display.drawFrame(step);
    if (level.isFinished()) {
      display.clear();
      if (andThen)
        andThen(level.status);
      return false; //false tells runAnimation to stop animating/running
    }
  });
}