// Taken from Little.js https://github.com/KilledByAPixel/LittleJS/blob/main/src/engineUtilities.js

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

const wait = (t) => new Promise((resolve) => { setTimeout(resolve, t); });

// String

const capitalizeFirst = (string) => string.charAt(0).toUpperCase() + string.slice(1);

export { rand, randInt, randIntInclusive, wait, capitalizeFirst };
