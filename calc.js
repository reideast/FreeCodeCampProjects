var DEBUG = true;

$(document).ready(function() {
  var stack = new RPNStack();
  
  $("button").addClass("disabled");
  
  $("#btnExit").on("click", function() { $("#diagBox").toggle(); }).removeClass("disabled");
  
  $(".btnNum").on("click", function() { 
    stack.addToEntryRegister(this.innerHTML); 
  }).removeClass("disabled");
  $("#btnEnter").on("click", function() { 
    stack.commitEntryRegister();
    stack.keyEnter();
  }).removeClass("disabled");
  
  $(".btnOpBinary").on("click", function() {
    stack.commitEntryRegister();
    var result = 0; 
    switch (this.innerHTML) {
      case "+":
        // var op1 = stack.pop();
        // var op2 = stack.pop();
        // result = op1 + op2;
        // console.log(op1 + "+" + op2 + "=" + result);
        result = stack.pop() + stack.pop();
        break;
      case "−":
        var op2 = stack.pop();
        result = stack.pop() - op2;
        break;
      case "×":
        result = stack.pop() * stack.pop();
        break;
      case "÷":
        var op2 = stack.pop();
        result = stack.pop() / op2;
        break;
      default:
        console.log("btnOpBinary passed bad operator: " + this.innerHTML);
    }
    stack.push(result);
  }).removeClass("disabled");
  
  $(".btnOpUnary").on("click", function() {
    stack.commitEntryRegister();
    switch (this.dataset.op) {
      case "sqrt":
        result = Math.sqrt(stack.pop());
        break;
      case "ln":
        //TODO: check for NaN results of the log functions, ie. log(negative)
        result = Math.log(stack.pop()); //in JS, Math.log(x) means ln(x)
        break;
      case "log":
        result = Math.log10(stack.pop());
        break;
      case "sin":
        result = Math.sin(stack.pop());
        break;
      case "cos":
        result = Math.cos(stack.pop());
        break;
      case "tan":
        result = Math.tan(stack.pop());
        break;
      default:
    }
    stack.push(result);
  }).removeClass("disabled");
  
  $("#btnRollDown").on("click", function() { 
    //TODO: this also needs to (conditionally?) commit eRegister
    stack.rollStackDown();
  }).removeClass("disabled");
  
  $("#btnNegation").on("click", function() {
    stack.negation();
  }).removeClass("disabled");
  
  $("#btnSwapXY").on("click", function() {
    stack.swap();
  }).removeClass("disabled");
  
  $("#btnBksp").on("click", function() {
    stack.bksp();
  }).removeClass("disabled");
});

var RPNStack = function() {
  //using C#-style underscore to designate Private variables
  var _stack = [0,0,0,0]; // X, Y, Z, T
  var _entryRegister = "";
  var _hasDecimal = false;
  var _wasLastEntryHardCommit = false; //controls if new input onto the entryRegister should NOT push the stack up. ie. after [ENTER]
  
  function debugLog(func) {
    console.log(func + ":" + _stack[0] + "," + _stack[1] + "," + _stack[2] + "," + _stack[3] + "," + _entryRegister);
  }
  
  this.pop = function() {
    var result = _stack[0];
    //return x. roll down & copy T down onto Z
    _stack[0] = _stack[1];
    _stack[1] = _stack[2];
    _stack[2] = _stack[3];
    if (DEBUG) debugLog("pop");
    if (DEBUG) refresh();
    return result;
  };
  this.push = function(num) {
    //add a new value at the bottom, push the rest upward
    _stack[3] = _stack[2]; //lose value in T
    _stack[2] = _stack[1];
    _stack[1] = _stack[0];
    _stack[0] = num;
    if (DEBUG) debugLog("push");
    refresh();
  };
  
  var refresh = function() {
    if (_entryRegister === "") {
      $("#row1").text(_stack[0]);
    } else {
      $("#row1").text(_entryRegister + "_");
    }
    $("#row2").text(_stack[1]);
    
    $("#entryReg").val(_entryRegister);
    for (var i = 0; i < _stack.length; ++i)
      $("#stack" + i).val(_stack[i]);
    
    if (DEBUG) debugLog("refresh");
  }
  
  this.addToEntryRegister = function(digit) {
    console.log("addToEntryReg("+digit+")");
    if (_entryRegister === "") {
      if (!_wasLastEntryHardCommit)
        this.push(0);
      else
        _wasLastEntryHardCommit = false;
    }
    if (digit[0] >= "0" && digit[0] <= "9") {
      _entryRegister += digit[0];
    } else if (digit[0] === "." && !_hasDecimal) {
      if (_entryRegister === "")
        _entryRegister = "0.";
      else
        _entryRegister += ".";
      _hasDecimal = true;
    }
    if (DEBUG) debugLog("addEReg");
    refresh();
  }
  this.commitEntryRegister = function() {
    // push(Number.parseFloat(_entryRegister));
    if (_entryRegister !== "") {
      _stack[0] = Number.parseFloat(_entryRegister);
      _entryRegister = "";
      _hasDecimal = false;
    }
    if (DEBUG) debugLog("commitEReg");
  }
  // this.commitNumber = function(num) {
  //   //push onto stack WITHOUT moving stack
  //   _stack[0] = num;
  // }
  this.rollStackDown = function() {
    //rotate the whole stack, erase no values;
    var temp = _stack[0];
    _stack[0] = _stack[1];
    _stack[1] = _stack[2];
    _stack[2] = _stack[3];
    _stack[3] = temp;
    if (DEBUG) debugLog("rollDown");
    refresh();
  };
  
  this.keyEnter = function() {
    this.push(_stack[0]);
    _wasLastEntryHardCommit = true;
    if (DEBUG) debugLog("enter");
  };
  this.negation = function() {
    if (_entryRegister !== "") {
      if (_entryRegister[0] === "-")
        _entryRegister = _entryRegister.slice(1);
      else
        _entryRegister = "-" + _entryRegister;
    } else {
      _stack[0] = _stack[0] * -1;
    }
    if (DEBUG) debugLog("negation");
    refresh();
  };
  this.swap = function() {
    this.commitEntryRegister();
    var temp = _stack[0];
    _stack[0] = _stack[1];
    _stack[1] = temp;
    if (DEBUG) debugLog("swapX&Y");
    refresh();
  };
  this.bksp = function () {
    if (_entryRegister !== "") {
      //TODO: check how clearing the entryRegister interacts with _wasLastEntryHardCommit ie. should it flip _wasLastEntryHardCommit (try on real calc)
      if (_entryRegister.length === 1) {
        _entryRegister = "";
      } else {
        _entryRegister = _entryRegister.slice(0, _entryRegister.length - 1);
        if (_entryRegister === "-")
          _entryRegister = "";
      }
    } else {
      _stack[0] = 0;
    }
    if (DEBUG) debugLog("backspace");
    refresh();
  };
  
  refresh();
};
