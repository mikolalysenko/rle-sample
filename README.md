rle-sample
============
Methods for sampling narrowband level sets.

Usage
=====
First, install the library using npm:

    npm install rle-sample
    
Then, you can import the code as follows:

    var sample = require("rle-sample");

The library gives you access to the following samplers:

Multiphase Samplers
-------------------

### `sample.dense(lo, hi, phase_func, dist_func)`
Samples a narrowband level set densely.

* `lo` - lower bound on region to sample, represented as length 3 array of integers
* `hi` - upper bound on region to sample, represented as length 3 array of integers
* `phase_func` - Phase function for level set
* `dist_func` - Distance to phase boundary

Returns a narrowband level set

### `sample.marching(lo, hi, seeds, phase_func, dist_func)`
Samples a narrowband level set using a [fast marching method](http://math.berkeley.edu/~sethian/2006/Explanations/fast_marching_explain.html).  To do this, you need to specify some seed points, then the algorithm will march along the surface starting from these points filling in the missing values.  This can be much faster than dense sampling, but it requires you to specify some starting points on each connected component of the surface.

* `lo` - lower bound on region to sample, represented as length 3 array of integers
* `hi` - upper bound on region to sample, represented as length 3 array of integers
* `seeds` - a list of points on the boundary of the solid
* `phase_func` - Phase function for level set
* `dist_func` - Distance to phase boundary

Returns a narrowband level set

### `sample.adaptive(lo, hi, step, phase_func, dist_func)`
Samples a narrowband level set using an adaptive step size.  This basically scans the grid stepping at intervals of size `step`, then when it finds a crossing it samples the surface densely using a marching method.

* `lo` - lower bound on region to sample, represented as length 3 array of integers
* `hi` - upper bound on region to sample, represented as length 3 array of integers
* `step` - the size to step along the volume by
* `phase_func` - Phase function for level set
* `dist_func` - Distance to phase boundary

Returns a narrowband level set


Signed Distance Samplers
------------------------
These methods sample solid objects represented by signed distance fields.  They work basically the same as the multiphase samplers, except instead of taking a pair of functions for the phase and distance, they use only a single function input which represents the [signed distance](http://en.wikipedia.org/wiki/Signed_distance_function) to the boundary of a solid object.

### `sample.solid.dense(lo, hi, sdist_func)`

### `sample.solid.marching(lo, hi, seeds, sdist_func)`

### `sample.solid.adaptive(lo, hi, step, sdist_func)`


Credits
=======
(c) 2013 Mikola Lysenko. BSD
