// Your code here.
function Vector(newX, newY) {
  this.x = newX;
  this.y = newY;
}
Object.defineProperty(Vector.prototype, "length", {
  get: function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
});
Vector.prototype.plus = function(vector2) {
  return new Vector(this.x + vector2.x, this.y + vector2.y);
};
Vector.prototype.minus = function(vector2) {
  return new Vector(this.x - vector2.x, this.y - vector2.y);
};

console.log(new Vector(1, 2).plus(new Vector(2, 3)));
// → Vector{x: 3, y: 5}
console.log(new Vector(1, 2).minus(new Vector(2, 3)));
// → Vector{x: -1, y: -1}
console.log(new Vector(3, 4).length);
// → 5