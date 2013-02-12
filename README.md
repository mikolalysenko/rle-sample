rle-sample
============
Methods for sampling narrowband level sets.

Usage
=====
First, install the library using npm:

    npm install rle-sample
    
Then, you can import the code as follows:

    var sample = require("rle-sample");


Multiphase Samplers
===================

`sample.dense(lo, hi, phase_func, dist_func)`
---------------------------------------------

`sample.marching(lo, hi, seeds, phase_func, dist_func)`
-------------------------------------------------------

`sample.adaptive(lo, hi, step, phase_func, dist_func)`
------------------------------------------------------


Signed Distance Samplers
========================

`sample.solid.dense(lo, hi, sdist_func)`
----------------------------------------

`sample.solid.marching(lo, hi, seeds, sdist_func)`
--------------------------------------------------

`sample.solid.adaptive(lo, hi, step, sdist_func)`
-------------------------------------------------


Credits
=======
(c) 2013 Mikola Lysenko. BSD
