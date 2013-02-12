var marching = require("../index.js");
var assert = require("assert");

function sphere(x) {
  return Math.sqrt(x[0]*x[0] + x[1]*x[1] + x[2]*x[2]) - 2.0;
}

var marched = marching.sampleSolidMarching([-100,-100,-100], [100,100,100], [[3, 0, 0]], sphere);
//console.log(marched);

var dense = require("rle-core").sampleSolid([-10, -10, -10], [10, 10, 10], sphere);
//console.log(dense);

var adaptive = marching.sampleSolidAdaptive([-10, -10, -10], [10,10,10], 2, sphere);
console.log(adaptive);

for(var i=0; i<marched.length(); ++i) {
  console.log(i);
  assert.equal(marched.coords[0][i], dense.coords[0][i]);
  assert.equal(marched.coords[1][i], dense.coords[1][i]);
  assert.equal(marched.coords[2][i], dense.coords[2][i]);
}

