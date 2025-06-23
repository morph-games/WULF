const SCREEN_WIDTH = 320;
const SCREEN_HEIGHT = 200;
const X_INDEX = 0;
const Y_INDEX = 1;
const COORDINATE_MAP = {
	up: [0, -1],
	down: [0, 1],
	left: [-1, 0],
	right: [1, 0],
};
const BASE_COOLDOWN = 20;

export {
	BASE_COOLDOWN,
	COORDINATE_MAP,
	SCREEN_HEIGHT,
	SCREEN_WIDTH,
	X_INDEX,
	Y_INDEX,
};
