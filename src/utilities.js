// Many functions taken from Little.js (MIT license) by Frank Force
// https://github.com/KilledByAPixel/LittleJS/blob/main/src/engineUtilities.js

/** Random global functions
 *  @namespace Random */

/** Returns a random value between the two values passed in
 *  @param {Number} [valueA]
 *  @param {Number} [valueB]
 *  @return {Number}
 *  @memberof Random */
function rand(valueA = 1, valueB = 0) { return valueB + Math.random() * (valueA - valueB); }

/** Returns a floored random value between the two values passed in
 *  The upper bound is exclusive. (If 2 is passed in, result will be 0 or 1)
 *  @param {Number} valueA
 *  @param {Number} [valueB]
 *  @return {Number}
 *  @memberof Random */
function randInt(valueA, valueB = 0) { return Math.floor(rand(valueA, valueB)); }

/** Same as randInt, but upper bound is inclusive. (If 2 is passed in, result will be 0, 1, or 2) */
function randIntInclusive(valueA, valueB = 0) {
	const bigger = Math.max(valueA, valueB) + 1;
	return randInt(bigger, Math.min(valueA, valueB));
}

function distanceSquared(x1, y1, x2, y2) {
	return (x1 - x2)**2 + (y1 - y2)**2;
}

function distance(x1, y1, x2, y2) {
	return distanceSquared(x1, y1, x2, y2) ** 0.5;
}

const wait = (t) => new Promise((resolve) => { setTimeout(resolve, t); });

// String

const capitalizeFirst = (string) => string.charAt(0).toUpperCase() + string.slice(1);

export {
	// Randomness
	rand,
	randInt,
	randIntInclusive,
	// Timing
	wait,
	// String
	capitalizeFirst,
	// Vector math
	distanceSquared,
	distance,
};
