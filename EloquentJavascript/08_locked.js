var box = {
  locked: true,
  unlock: function() { this.locked = false; },
  lock: function() { this.locked = true;  },
  _content: [],
  get content() {
    if (this.locked) throw new Error("Locked!");
    return this._content;
  }
};

function withBoxUnlocked(body) {
  // Your code here.
  var wasLocked = box.locked;
  if (wasLocked) box.unlock();
  try {
    body();
  } catch (e) {
    if (e.message === "Locked!") {
     console.log("DEBUG: box is locked?!?"); 
    } else {
      throw e;
    }
  } finally {
    if (wasLocked) box.lock();
  }
}

withBoxUnlocked(function() {
  box.content.push("gold piece");
});
box.unlock();
console.log(box.locked);
withBoxUnlocked(function() {
  console.log("Box contents: " + box.content);
});
console.log(box.locked);
box.lock();
console.log(box.locked);

try {
  withBoxUnlocked(function() {
    throw new Error("Pirates on the horizon! Abort!");
  });
} catch (e) {
  console.log("Error raised:", e);
}
console.log(box.locked);
// → true
