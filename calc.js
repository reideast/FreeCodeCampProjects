var DEBUG = true;

$(document).ready(function() {
  $("button").addClass("disabled");
  
  var stack = new RPNStack();
  var trigModeDegrees = true;
  var shiftMode = false;
  var shiftToggle = function() {
    shiftMode = (shiftMode) ? false : true;
    $("#indicatorOrange").toggle(shiftMode);
  };
  var shiftOff = function() {
    shiftMode = false;
    $("#indicatorOrange").toggle(shiftMode);
  }
  
  $("#btnOrange").on("click", function() {
    shiftToggle();
  }).removeClass("disabled");
  
  $("#btnExit").on("click", function() { 
    if (shiftMode)
      $("#diagBox").toggle(); 
    else
      ; // exit functionality
    shiftOff();
  }).removeClass("disabled");
  
  $(".btnNum").on("click", function() { 
    stack.addToEntryRegister(this.innerHTML); 
    shiftOff();
  }).removeClass("disabled");
  
  $("#btnEnter").on("click", function() { 
    stack.commitEntryRegister();
    stack.keyEnter();
    shiftOff();
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
    shiftOff();
  }).removeClass("disabled");
  
  $(".btnOpUnary").on("click", function() {
    stack.commitEntryRegister();
    switch (this.dataset.op) {
      case "sqrt":
        result = Math.sqrt(stack.pop());
        break;
      case "inverse":
        result = 1 / stack.pop();
        break;
      case "ln":
        //TODO: check for NaN results of the log functions, ie. log(negative)
        result = Math.log(stack.pop()); //in JS, Math.log(x) means ln(x)
        break;
      case "log":
        result = Math.log10(stack.pop());
        break;
      case "sin":
        result = Math.sin((trigModeDegrees) ? (stack.pop() * (Math.PI / 180)) : stack.pop());
        break;
      case "cos":
        result = Math.cos((trigModeDegrees) ? (stack.pop() * (Math.PI / 180)) : stack.pop());
        break;
      case "tan":
        result = Math.tan((trigModeDegrees) ? (stack.pop() * (Math.PI / 180)) : stack.pop());
        break;
      default:
    }
    stack.push(result);
    shiftOff();
  }).removeClass("disabled");
  
  $("#btnRollDown").on("click", function() { 
    //TODO: this also needs to (conditionally?) commit eRegister
    stack.rollStackDown();
    shiftOff();
  }).removeClass("disabled");
  
  $("#btnNegation").on("click", function() {
    stack.negation();
    shiftOff();
  }).removeClass("disabled");
  
  $("#btnSwapXY").on("click", function() {
    stack.swap();
    shiftOff();
  }).removeClass("disabled");
  
  $("#btnBksp").on("click", function() {
    stack.bksp();
    shiftOff();
  }).removeClass("disabled");
  
  $("#btnStore").on("click", function() {
    stack.sto();
    shiftOff();
  }).removeClass("disabled");
  $("#btnRecall").on("click", function() {
    stack.rcl();
    shiftOff();
  }).removeClass("disabled");
  
  //this function must be after all other event binding to allow jQuery to call them in that order!
  // $("button").on("click", function() { 
  //   shiftOff();
  //  });
});

var RPNStack = function() {
  //using C#-style underscore to designate Private variables
  var _stack = [0,0,0,0]; // X, Y, Z, T
  var _entryRegister = "";
  var _hasDecimal = false;
  var _hasExponent = false;
  var _wasLastEntryHardCommit = false; //controls if new input onto the entryRegister should NOT push the stack up. ie. after [ENTER]
  var _mem = 0;
  
  
  function debugLog(func) {
    console.log(func + ":" + _stack[0] + "," + _stack[1] + "," + _stack[2] + "," + _stack[3] + "," + _entryRegister);
  }
  
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
    
    if (_mem === 0)
      $("#indicatorMem").hide();
    else
      $("#indicatorMem").show();
    
    if (DEBUG) debugLog("refresh");
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
    } else if (digit[0] === "E" && !_hasExponent) {
      if (_entryRegister === "")
        _entryRegister = "1e";
      else
        _entryRegister += "e";
      _hasExponent = true;
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
      _hasExponent = false;
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
  
  this.sto = function() {
    this.commitEntryRegister();
    _mem = _stack[0];
    if (DEBUG) debugLog("sto mem=" + _mem);
    refresh(); //also shows/hides indicatorMem
  }
  this.rcl = function() {
    this.commitEntryRegister();
    this.push(_mem);
    if (DEBUG) debugLog("rcl mem=" + _mem);
    refresh();
  }
  
  refresh();
};
