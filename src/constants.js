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
const DEFAULT_COOLDOWN = 20;
const DEFAULT_WARMUP = 5;

export {
	COORDINATE_MAP,
	DEFAULT_COOLDOWN,
	DEFAULT_WARMUP,
	SCREEN_HEIGHT,
	SCREEN_WIDTH,
	X_INDEX,
	Y_INDEX,
};
