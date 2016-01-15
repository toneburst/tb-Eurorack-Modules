///////////////////////////////////////
// Easing functions by Robert Penner //
// http://gizma.com/easing/#sin3 //////
///////////////////////////////////////

////////////////
// t = time | b = start value | c = end value | d = duration
////////////////

var ease = {};

ease.linearTween = function(t, b, c, d) {
	return c*t/d + b;
};
ease.easeInQuad = function(t, b, c, d) {
	t /= d;
	return c*t*t + b;
};
// Quadratic easing in - accelerating from zero velocity
ease.easeInQuad = function (t, b, c, d) {
	t /= d;
	return c*t*t + b;
};
// Quadratic easing out - decelerating to zero velocity
ease.easeOutQuad = function (t, b, c, d) {
	t /= d;
	return -c * t*(t-2) + b;
};
// Quadratic easing in/out - acceleration until halfway, then deceleration
ease.easeInOutQuad = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};
// Cubic easing in - accelerating from zero velocity
ease.easeInCubic = function (t, b, c, d) {
	t /= d;
	return c*t*t*t + b;
};
// Cubic easing out - decelerating to zero velocity
ease.easeOutCubic = function (t, b, c, d) {
	t /= d;
	t--;
	return c*(t*t*t + 1) + b;
};
// Cubic easing in/out - acceleration until halfway, then deceleration
ease.easeInOutCubic = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t*t + b;
	t -= 2;
	return c/2*(t*t*t + 2) + b;
};
// Quartic easing in - accelerating from zero velocity
ease.easeInQuart = function (t, b, c, d) {
	t /= d;
	return c*t*t*t*t + b;
};
// Quartic easing out - decelerating to zero velocity
ease.easeOutQuart = function (t, b, c, d) {
	t /= d;
	t--;
	return -c * (t*t*t*t - 1) + b;
};
// Quartic easing in/out - acceleration until halfway, then deceleration
ease.easeInOutQuart = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t*t*t + b;
	t -= 2;
	return -c/2 * (t*t*t*t - 2) + b;
};
// Quintic easing in - accelerating from zero velocity
ease.easeInQuint = function (t, b, c, d) {
	t /= d;
	return c*t*t*t*t*t + b;
};
// Quintic easing out - decelerating to zero velocity
ease.easeOutQuint = function (t, b, c, d) {
	t /= d;
	t--;
	return c*(t*t*t*t*t + 1) + b;
};
// Quintic easing in/out - acceleration until halfway, then deceleration
ease.easeInOutQuint = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t*t*t*t + b;
	t -= 2;
	return c/2*(t*t*t*t*t + 2) + b;
};
// Sinusoidal easing in - accelerating from zero velocity
ease.easeInSine = function (t, b, c, d) {
	return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
};
// Sinusoidal easing out - decelerating to zero velocity
ease.easeOutSine = function (t, b, c, d) {
	return c * Math.sin(t/d * (ease.PI/2)) + b;
};
// Sinusoidal easing in/out - accelerating until halfway, then decelerating
ease.easeInOutSine = function (t, b, c, d) {
	return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
};
// Exponential easing in - accelerating from zero velocity
ease.easeInExpo = function (t, b, c, d) {
	return c * Math.pow( 2, 10 * (t/d - 1) ) + b;
};
// Exponential easing out - decelerating to zero velocity
ease.easeOutExpo = function (t, b, c, d) {
	return c * ( -Math.pow( 2, -10 * t/d ) + 1 ) + b;
};
// Exponential easing in/out - accelerating until halfway, then decelerating
ease.easeInOutExpo = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2 * Math.pow( 2, 10 * (t - 1) ) + b;
	t--;
	return c/2 * ( -Math.pow( 2, -10 * t) + 2 ) + b;
};
// Circular easing in - accelerating from zero velocity
ease.easeInCirc = function (t, b, c, d) {
	t /= d;
	return -c * (Math.sqrt(1 - t*t) - 1) + b;
};
// Circular easing out - decelerating to zero velocity
ease.easeOutCirc = function (t, b, c, d) {
	t /= d;
	t--;
	return c * Math.sqrt(1 - t*t) + b;
};
// Circular easing in/out - acceleration until halfway, then deceleration
ease.easeInOutCirc = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
	t -= 2;
	return c/2 * (Math.sqrt(1 - t*t) + 1) + b;
};
