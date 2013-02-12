"use strict";

var core = require("rle-core");

var DEFAULT_DIST_FUNC = new Function("return 1.0");

var inSolid = new Function("dist_func", "x", "return dist_func(x) <= 0 ? 1 : 0;");

function makeSolid(dist_func) {
  return inSolid.bind(null, dist_func);
}

function index(x) {
  return x.join("|");
}

//Fast marching methods for level set extraction
function sampleMarching(lo, hi, seed_points, phase_func, dist_func) {
  dist_func = dist_func || DEFAULT_DIST_FUNC;
  var visited  = {};
  var to_visit = [];
  for(var i=0; i<seed_points.length; ++i) {
    var x = seed_points[i];
    to_visit.push([x[0], x[1], x[2], dist_func(x), phase_func(x)]);
    visited[index(x)] = true;
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
  console.log(to_visit);
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
exports.sampleMarching = sampleMarching;

exports.sampleSolidMarching = function(lo, hi, seeds, dist_func) {
  return sampleMarching(lo, hi, seeds, makeSolid(dist_func), dist_func);
}

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
        //Check crossing along 3 axes
        var p0 = phase_func(x);
        for(var d=0; d<3; ++d) {
          var old = x[d];
          x[d] -= step[d];
          var p1 = phase_func(x[d]);
          if(p0 !== p1) {
            var l = x[d];
            var h = x[d]+step;
            while(l < h) {
              x[d] = (l + h) >>> 1;
              if(phase_func(x[d]) === p0) {
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
exports.sampleAdaptive = sampleAdaptive;

exports.sampleSolidAdaptive = function(lo, hi, step, dist_func) {
  return sampleAdaptive(lo, hi, step, makeSolid(dist_func), dist_func);
}