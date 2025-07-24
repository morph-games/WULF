const SCREEN_WIDTH = 320;
const SCREEN_HEIGHT = 200;
const X_INDEX = 0;
const Y_INDEX = 1;
const COORDINATE_MAP_NOT_HERE = {
	up: [0, -1],
	down: [0, 1],
	left: [-1, 0],
	right: [1, 0],
};
const COORDINATE_MAP = {
	...COORDINATE_MAP_NOT_HERE,
	here: [0, 0],
};

const DEFAULT_COOLDOWN = 20;
const DEFAULT_WARMUP = 5;
const DIRECTIONS_ARRAY = ['up', 'right', 'down', 'left'];
const VOLUME_MIN = 0;
const VOLUME_MAX = 10;

export {
	COORDINATE_MAP,
	COORDINATE_MAP_NOT_HERE,
	DEFAULT_COOLDOWN,
	DEFAULT_WARMUP,
	DIRECTIONS_ARRAY,
	SCREEN_HEIGHT,
	SCREEN_WIDTH,
	VOLUME_MIN,
	VOLUME_MAX,
	X_INDEX,
	Y_INDEX,
};
