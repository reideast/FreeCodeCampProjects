// extend Error
function InputError(message) {
  this.message = message;
  this.stack = (new Error()).stack;
}
InputError.prototype = Object.create(Error.prototype);
InputError.prototype.name = "InputError";

// example function
function promptDirection(question) {
  var result = prompt(question, "");
  if (result.toLowerCase() == "left") return "L";
  if (result.toLowerCase() == "right") return "R";
  throw new InputError("Invalid direction: " + result);
}

// example error handling
for (;;) {
  try {
    var dir = promptDirection("Where?"); // explicity thrown error will be caught and handled
    var dir = promptFOOBAR("Where?"); //error "Undefined Variable" will be caught, BUT then thrown on further up the stack!
    console.log("You chose ", dir);
    break;
  } catch (e) {
    if (e instanceof InputError)
      console.log("Not a valid direction. Try again.");
    else
      throw e;
  }
}