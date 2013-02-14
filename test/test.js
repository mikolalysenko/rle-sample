var sample = require("../index.js").solid;
var assert = require("assert");

function sphere(x) {
  return Math.sqrt(x[0]*x[0] + x[1]*x[1] + x[2]*x[2]) - 4.0;
}

var dense = sample.dense([-10, -10, -10], [10, 10, 10], sphere);
//console.log(dense);

var marched = sample.marching([-100,-100,-100], [100,100,100], [[4, 0, 0]], sphere);
//console.log(marched);

var adaptive = sample.adaptive([-10, -10, -10], [10,10,10], 4, sphere);
//console.log(adaptive);

for(var i=0; i<dense.length(); ++i) {
  console.log(i);
  assert.equal(marched.coords[0][i], dense.coords[0][i]);
  assert.equal(marched.coords[1][i], dense.coords[1][i]);
  assert.equal(marched.coords[2][i], dense.coords[2][i]);

  assert.equal(adaptive.coords[0][i], dense.coords[0][i]);
  assert.equal(adaptive.coords[1][i], dense.coords[1][i]);
  assert.equal(adaptive.coords[2][i], dense.coords[2][i]);
}

