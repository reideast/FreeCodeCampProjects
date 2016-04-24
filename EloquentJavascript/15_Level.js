

var playerXSpeed = 7;
var playerJumpSpeed = 17;
var gravity = 30;
var coinWobbleSpeed = 8, coinWobbleDist = 0.07;
var maxAnimationStep = 0.05; // units in seconds

// Level: a game room built from a text plan
function Level(plan) {
  console.log("Creating a level with plan:");
  plan.forEach(function(item) {
    console.log(item);
  });
  this.width = plan[0].length;
  this.height = plan.length;
  this.grid = [];
  this.actors = [];
  
  for (var y = 0; y < this.height; ++y) {
    var line = plan[y];
    var gridLine = [];
    for (var x = 0; x < this.width; ++x) {
      var ch = line[x];
      var fieldType = null;
      var Actor = actorChars[ch];
      if (Actor)
        this.actors.push(new Actor(new Vector(x, y), ch));
      else if (ch === "x")
        fieldType = "wall";
      else if (ch === "!")
        fieldType = "lava";
      gridLine.push(fieldType);
    }
    this.grid.push(gridLine);
  }
  
  this.player = this.actors.filter(function(actor) {
    return actor.type === "player";
  })[0];
  this.status = null;
  this.finishDelay = null;
}
Level.prototype.isFinished = function() {
  return this.status != null && this.finishDelay < 0;
};

Level.prototype.obstacleAt = function(pos, size) {
  // [yMin][xMin] - [yMax][xMax] is all the squares that an object of size at pos could possibly be touching
  // (size and pos are Vectors)
  var xMin = Math.floor(pos.x);
  var xMax = Math.ceil(pos.x + size.x);
  var yMin = Math.floor(pos.y);
  var yMax = Math.ceil(pos.y + size.y);

  // out-of-bounds possibilites (floor is lava, sides/top is wall)
  if (xMin < 0 || xMax > this.width || yMin < 0)
    return "wall";
  if (yMax > this.height)
    return "lava";
  // loop through all squares possible, see if anything is there
  for (var y = yMin; y < yMax; ++y) {
    for (var x = xMin; x < xMax; ++x) {
      var fieldType = this.grid[y][x];
      if (fieldType) return fieldType;
    }
  }
};
Level.prototype.actorAt = function(actor) {
  // loop through all actors
  for (var i = 0; i < this.actors.length; ++i) {
    var other = this.actors[i];
    if (other != actor &&
        actor.pos.x + actor.size.x > other.pos.x &&
        actor.pos.x < other.pos.x + other.size.x &&
        actor.pos.y + actor.size.y > other.pos.y &&
        actor.pos.y < other.pos.y + other.size.y)
      return other;
  }
};
Level.prototype.playerTouched = function(actor) {
  var type;
  if (actor.type)
    type = actor.type;
  else
    type = actor;
  if (type === "lava" && this.status === null) {
    this.status = "lost";
    this.finishDelay = 1;
  } else if (type === "coin") {
    this.actors = this.actors.filter(function(other) {
      return other != actor;
    });
    if (!this.actors.some(function(other) {
      return other.type === "coin";
    })) {
      this.status = "won";
      this.finishDelay = 1;
    }
  }
};
Level.prototype.animate = function(step, keys) {
  if (this.status !== null)
    this.finishDelay -= step;

  while (step > 0) {
    var thisStep = Math.min(step, maxAnimationStep); //decrement by maxAnimationStep, unless step is smaller
    this.actors.forEach(function(actor) {
      actor.act(thisStep, this, keys); // let each actor choose its actions for this step
    }, this);
    step -= thisStep;
  }
};




// actorChars: maps text objects from a plan to the constructor functions
var actorChars = {
  "@": Player,
  "o": Coin,
  "=": Lava,
  "|": Lava,
  "v": Lava
};

// Vector: a simple (x, y) object
function Vector(x, y) {
  this.x = x;
  this.y = y;
}
Vector.prototype.plus = function(other) {
  return new Vector(this.x + other.x, this.y + other.y);
};
Vector.prototype.times = function(factor) {
  return new Vector(this.x * factor, this.y * factor);
};

// Actors:
function Player(pos) {
  this.pos = pos.plus(new Vector(0, -0.5)); //moved up 1/2 square because character is 1.5 squares tall
  this.size = new Vector(0.8, 1.5);
  this.speed = new Vector(0, 0);
}
Player.prototype.type = "player";
Player.prototype.act = function(step, level, keys) {
  this.moveX(step, level, keys);
  this.moveY(step, level, keys);
  
  var otherActor = level.actorAt(this);
  if (otherActor)
    level.playerTouched(otherActor);
    
  // Dying animation
  if (level.status == "lost") {
    this.pos.y += step;
    this.size.y -= step;
  }
};
Player.prototype.moveX = function(step, level, keys) {
  this.speed.x = 0;
  if (keys.left) this.speed.x -= playerXSpeed;
  if (keys.right) this.speed.x += playerXSpeed;
  
  var motion = new Vector(this.speed.x * step, 0);
  var newPos = this.pos.plus(motion);
  var obstacle = level.obstacleAt(newPos, this.size);
  if (obstacle) {
    level.playerTouched(obstacle);
  } else {
    this.pos = newPos;
  }
};
Player.prototype.moveY = function(step, level, keys) {
  this.speed.y += step * gravity;
  var motion = new Vector(0, this.speed.y * step);
  var newPos = this.pos.plus(motion);
  var obstacle = level.obstacleAt(newPos, this.size);
  if (obstacle) {
    level.playerTouched(obstacle);
    if ((keys.up || keys.space) && this.speed.y > 0) //jump only if touching something below us (gravity always pulling down, so even resting on the ground is pushing down)
      this.speed.y = -playerJumpSpeed; //ignore acceleration due to gravity, and jump upward
    else
      this.speed.y = 0; //cancel downward acceleration gained due to gravity
  } else {
    this.pos = newPos;
  }
};


function Lava(pos, ch) {
  this.pos = pos;
  this.size = new Vector(1, 1);
  if (ch === "=") {
    this.speed = new Vector(2, 0);
  } else if (ch === "|") {
    this.speed = new Vector(0, 2);
  } else if (ch === "v") {
    this.speed = new Vector(0, 3);
    this.repeatPos = pos; //defines the starting position it will continue to "drip" from
  }
}
Lava.prototype.type = "lava";
Lava.prototype.act = function(step, level) {
  var newPos = this.pos.plus(this.speed.times(step));
  if (!level.obstacleAt(newPos, this.size)) {
    this.pos = newPos;
  } else if (this.repeatPos) {
    this.pos = this.repeatPos; //drip
  } else {
    this.speed = this.speed.times(-1); //bounce
  }
};

function Coin(pos) {
  this.pos = pos.plus(new Vector(0.2, 0.1));
  this.basePos = this.pos;
  this.size = new Vector(0.6, 0.6);
  this.wobble = Math.random() * Math.PI * 2; //random position between 0 and 2pi (ie. along the y-coord defined by sine())
}
Coin.prototype.type = "coin";
Coin.prototype.act = function(step) {
  this.wobble += step * coinWobbleSpeed;
  var wobblePos = Math.sin(this.wobble) * coinWobbleDist; //wobble magnitude, modified by sine to follow a wave-like pattern, scaled to coinWobbleDist
  this.pos = this.basePos.plus(new Vector(0, wobblePos));
};
