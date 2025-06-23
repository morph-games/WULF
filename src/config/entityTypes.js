export default {
	// ---- Terrain ----
	terrain: {
		sprite: 'void',
		isTerrain: true,
	},
	void: { type: 'terrain', sprite: 'void' },
	dirt: { type: 'terrain', sprite: 'dirt' },
	grass: {
		type: 'terrain',
		sprite: 'grass-0',
		// variations: 4,
	},
	water: {
		type: 'terrain',
		sprite: 'water',
		variations: 2,
	},
	forest: {
		type: 'terrain',
		sprite: 'forest-0',
		// variations: 4,
	},
	mountain: {
		type: 'terrain',
		sprite: 'mountain-0',
		// variations: 4,
	},
	wall: {
		type: 'terrain',
		sprite: 'stone-wall-0',
	},
	door: {
		type: 'terrain',
		sprite: 'stone-door-open',
	},
	window: {
		type: 'terrain',
		sprite: 'stone-window',
	},
	floor: {
		type: 'terrain',
		sprite: 'floor-0',
		// variations: 2,
	},
	tileFloor: {
		type: 'terrain',
		sprite: 'floor-2',
	},
	signLeft: { type: 'terrain', sprite: 'stone-sign-left' },
	signRight: { type: 'terrain', sprite: 'stone-sign-right' },

	// ---- Overworld Destinations ----
	destination: {
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
		isProp: true,
		// ?
	},
	ladderDown: { type: 'prop', sprite: 'ladder-down', klimb: 'down' },
	ladderUp: { type: 'prop', sprite: 'ladder-up', klimb: 'up' },

	// ---- Actors ----
	actor: {
		isActor: true,
		action: {
			queue: [], // array of actions [actionName, params] to do next
			cooldown: 1,
		},
		moveSpeed: 1,
		klimbSpeed: 1,
		health: 99,
		canEnter: false,
		canExit: false,
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
		isItem: true,
		// TODO
	},
};
