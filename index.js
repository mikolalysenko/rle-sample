"use strict";

var core = require("rle-core");

var DEFAULT_DIST_FUNC = new Function("return 1.0");

//Sample a volume densely
function sampleDense(lo, hi, phase_func, dist_func) {
  //If no distance function is present, just assume boundary distance is constant
  if(!dist_func) {
    dist_func = DEFAULT_DIST_FUNC;
  }
  var builder = new core.DynamicVolume()
    , x       = new Int32Array(3)
    , y       = new Int32Array(3);
  //March over the range at integer increments
  for(x[2]=lo[2]; x[2]<hi[2]; ++x[2]) {
    for(x[1]=lo[1]; x[1]<hi[1]; ++x[1]) {
      for(x[0]=lo[0]; x[0]<hi[0]; ++x[0]) {
        //Check if x is on a phase boundary
        var phase = phase_func(x);
        y[0] = x[0];
        y[1] = x[1];
        y[2] = x[2];
outer_loop:
        for(var d=0; d<3; ++d) {
          for(var s=-1; s<=1; s+=2) {
            y[d] += s;
            if(phase !== phase_func(y)) {
              builder.push(x[0], x[1], x[2], core.saturateAbs(dist_func(x)), phase);
              break outer_loop;
            }
            y[d] = x[d];
          }
        }
      }
    }
  }
  return builder;
}
exports.dense = sampleDense;


//Index calculation
var index = new Function("x", "return x.join('|');");

//Fast marching methods for level set extraction
function sampleMarching(lo, hi, seed_points, phase_func, dist_func) {
  dist_func = dist_func || DEFAULT_DIST_FUNC;
  var visited  = {};
  var to_visit = [];
i_loop:
  for(var i=0; i<seed_points.length; ++i) {
    var x = seed_points[i];
    var p = phase_func(x);
    
    for(var d=0; d<3; ++d) {
      for(var s=-1; s<=2; s+=2) {
        var t = x[d];
        x[d] += s;
        var np = phase_func(x);
        x[d] = t;
        if(np !== p) {
          to_visit.push([x[0], x[1], x[2], dist_func(x), phase_func(x)]);
          visited[index(x)] = true;
          continue i_loop;
        }
      }
    }
  }
  var x = [0,0,0];
  for(var n=0; n<to_visit.length; ++n) {
    var top = to_visit[n];
    for(var d=0; d<3; ++d) {
s_loop:
      for(var s=-1; s<=1; s+=2) {
        for(var i=0; i<3; ++i) {
          x[i] = top[i];
        }
        x[d] += s;
        for(var i=0; i<3; ++i) {
          if(x[i] < lo[i] || x[i] >= hi[i]) {
            continue s_loop;
          }
        }
        var k = index(x);
        if(visited[k]) {
          continue;
        }
        var phase = phase_func(x);
e_loop:
        for(var e=0; e<3; ++e) {
          for(var t=-1; t<=1; ++t) {
            x[e] += t;
            var nphase = phase_func(x);
            x[e] -= t;
            if(nphase !== phase) {
              to_visit.push([x[0], x[1], x[2], core.saturateAbs(dist_func(x)), phase]);
              break e_loop;
            }
          }
        }
        visited[k] = true;
      }
    }
  }
  //Convert result to a dynamic volume
  to_visit.sort(core.compareCoord);
  var X = new Array(to_visit.length+1);
  var Y = new Array(to_visit.length+1);
  var Z = new Array(to_visit.length+1);
  var D = new Array(to_visit.length+1);
  var P = new Array(to_visit.length+1);
  X[0] = Y[0] = Z[0] = core.NEGATIVE_INFINITY;
  D[0] = 1.0;
  P[0] = 0;
  for(var i=0; i<to_visit.length; ++i) {
    var r = to_visit[i];
    X[i+1] = r[0];
    Y[i+1] = r[1];
    Z[i+1] = r[2];
    D[i+1] = r[3];
    P[i+1] = r[4];
  }
  return new core.DynamicVolume([X,Y,Z], D, P);
}
exports.marching = sampleMarching;

function sampleAdaptive(lo, hi, step, phase_func, dist_func) {
  if(!(step instanceof Array)) {
    step = [step, step, step];
  }
  dist_func = dist_func || DEFAULT_DIST_FUNC;
  var crossings = [];
  var x = [0,0,0];
  for(x[0]=lo[0]+step[0]; x[0]<hi[0]; x[0]+=step[0]) {
    for(x[1]=lo[1]+step[1]; x[1]<hi[1]; x[1]+=step[1]) {
      for(x[2]=lo[2]+step[2]; x[2]<hi[2]; x[2]+=step[2]) {
        var p0 = phase_func(x);
        for(var d=0; d<3; ++d) {
          var old = x[d];
          x[d] -= step[d];
          var p1 = phase_func(x[d]);
          if(p0 !== p1) {
            var l = x[d];
            var h = x[d]+step[d];
            while(l < h) {
              x[d] = (l + h) >> 1;
              if(phase_func(x[d]) === p1) {
                l = x[d] + 1;
              } else {
                h = x[d] - 1;
              }
            }
            crossings.push(x.slice(0));
          }
          x[d] = old;
        }
      }
    }
  }
  return sampleMarching(lo, hi, crossings, phase_func, dist_func);
}
exports.adaptive = sampleAdaptive;


//Samplers for solid objects
var inSolid = new Function("dist_func", "x", "return dist_func(x) <= 0 ? 1 : 0;");
function makeSolid(dist_func) {
  return inSolid.bind(null, dist_func);
}
exports.solid = {
  dense: function(lo, hi, dist_func) {
    return sampleDense(lo, hi, makeSolid(dist_func), dist_func);
  },
  marching: function(lo, hi, seeds, dist_func) {
    return sampleMarching(lo, hi, seeds, makeSolid(dist_func), dist_func);
  },
  adaptive: function(lo, hi, step, dist_func) {
    return sampleAdaptive(lo, hi, step, makeSolid(dist_func), dist_func);
  }
};
