export default {
	entity: {
		sprite: 'void',
		x: 0,
		y: 0,
		obstacleId: 0,
	},

	// ---- Terrain ----
	terrain: {
		type: 'entity',
		isTerrain: true,
	},
	void: { type: 'terrain', sprite: 'void', obstacleId: 0 },
	dirt: { type: 'terrain', sprite: 'dirt', obstacleId: 6 },
	grass: {
		type: 'terrain',
		sprite: 'grass-0',
		// variations: 4,
		obstacleId: 5,
	},
	water: {
		type: 'terrain',
		sprite: 'water',
		variations: 2,
		obstacleId: 2,
	},
	forest: {
		type: 'terrain',
		sprite: 'forest-0',
		// variations: 4,
		obstacleId: 10,
	},
	mountain: {
		type: 'terrain',
		sprite: 'mountain-0',
		// variations: 4,
		obstacleId: 11,
	},
	wall: {
		type: 'terrain',
		sprite: 'stone-wall-0',
		obstacleId: 1,
	},
	door: {
		type: 'terrain',
		sprite: 'stone-door-open',
		obstacleId: 0,
	},
	window: {
		type: 'terrain',
		sprite: 'stone-window',
		obstacleId: 1,
	},
	floor: {
		type: 'terrain',
		sprite: 'floor-0',
		// variations: 2,
		obstacleId: 7,
	},
	tileFloor: {
		type: 'terrain',
		sprite: 'floor-2',
		obstacleId: 7,
	},
	signLeft: { type: 'terrain', sprite: 'stone-sign-left', obstacleId: 1 },
	signRight: { type: 'terrain', sprite: 'stone-sign-right', obstacleId: 1 },

	// ---- Overworld Destinations ----
	destination: {
		type: 'entity',
		investigate: { message: 'You see {{name}}.' },
		enter: {},
		sprite: 'mountain-door',
		isDestination: true,
	},
	town: {
		type: 'destination',
		sprite: 'town',
	},
	city: {
		type: 'destination',
		sprite: 'city',
	},
	village: {
		type: 'destination',
		sprite: 'village',
	},
	dungeon: {
		type: 'destination',
		sprite: 'mountain-door',
	},

	// ---- Props ----
	prop: {
		type: 'entity',
		isProp: true,
		// ?
	},
	ladderDown: { type: 'prop', sprite: 'ladder-down', klimb: 'down' },
	ladderUp: { type: 'prop', sprite: 'ladder-up', klimb: 'up' },

	// ---- Actors ----
	actor: {
		type: 'entity',
		isActor: true,
		action: {
			queue: [], // array of actions [actionName, params] to do next
			cooldown: 1,
		},
		move: {
			speed: 1,
			transversal: [1, 0, 0, 0, 0.5, 1, 1.1, 1.2, 0.5, 0.9, 0.8, 0, 0, 0, 0],
		},
		klimbSpeed: 1,
		health: 99,
		canEnter: false,
		canExit: false,
		obstacleId: 13,
	},
	avatar: {
		type: 'actor',
		isAvatar: true,
		sprite: 'spearman-0',
		canEnter: true,
		canExit: true,
	},
	king: {
		type: 'actor',
		sprite: 'king-0',
	},
	guard: {
		type: 'actor',
		sprite: 'spearman-2',
		plan: { randomMove: 0.5 },
	},
	sentry: {
		type: 'actor',
		sprite: 'spearman-2',
	},

	// ---- Items ----
	item: {
		type: 'entity',
		isItem: true,
		// TODO
	},
};
