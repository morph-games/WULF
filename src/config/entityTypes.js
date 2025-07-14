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
	floor2: { type: 'terrain', sprite: 'floor-2', obstacleId: 7 },
	floor3: { type: 'terrain', sprite: 'floor-3', obstacleId: 7 },
	floor4: { type: 'terrain', sprite: 'floor-4', obstacleId: 7 },
	floor5: { type: 'terrain', sprite: 'floor-5', obstacleId: 7 },
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
	darkWall: {
		type: 'terrain',
		sprite: 'dark-stone-0',
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
	ladderDown: { type: 'prop', sprite: 'ladder-down', klimbable: { speed: 1, direction: 'down' } },
	ladderUp: { type: 'prop', sprite: 'ladder-up', klimbable: { speed: 1, direction: 'up' } },
	torch: { type: 'prop', sprite: 'torch-0' },
	pillar: { type: 'prop', sprite: 'pillar-0' },

	// ---- Actors ----
	actor: {
		type: 'entity',
		sprite: 'horse',
		deadSprite: 'dead-skull',
		isActor: true,
		action: {
			queue: [], // array of actions [actionName, params] to do next
			cooldown: 1,
		},
		move: {
			speed: 1,
			transversal: [1, 0, 0, 0, 0.5, 1, 1.1, 1.2, 0.5, 0.9, 0.8, 0, 0, 0, 0],
		},
		health: {
			hp: 99,
			hpMax: 99,
			deathSprite: 'void', // TODO
		},
		fighter: {
			// Preference for melee vs ranged?
		},
		attacker: { // melee
			range: 1,
			natural: {
				damage: 1,
				damageType: 'ph',
			},
		},
		firer: { // ranged
			range: 3,
			// No natural capability at first
		},
		currencies: {
			coins: 0,
			food: 100,
		},
		inventory: {
			contents: [],
			max: 255,
		},
		equipment: {
			// ?
		},
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
		klimber: {
			speed: 1,
		},
		health: {
			hp: 99,
			hpMax: 99,
			respawnOnDeath: true, // TODO
		},
		currencies: {
			coins: 0,
			food: 100,
		},
		attacker: { // melee
			range: 1,
			natural: {
				damage: [5, 10],
				damageType: 'ph',
			},
		},
		inventory: {
			contents: [],
			max: 255,
		},
		xp: {
			totalXp: 0,
		},
		factions: {
			good: 10,
			evil: 0,
		},
	},
	king: {
		type: 'actor',
		sprite: 'king-0',
	},
	wanderer: {
		type: 'actor',
		sprite: 'man-0',
		plan: { randomMove: 0.5 },
	},
	man: {
		type: 'wanderer',
	},
	woman: {
		type: 'wanderer',
		sprite: 'woman-0',
	},
	guard: {
		type: 'wanderer',
		sprite: 'spearman-2',
	},
	sentry: {
		type: 'actor',
		sprite: 'spearman-2',
	},
	elf: {
		type: 'wanderer',
		sprite: 'elf-0',
	},
	dwarf: {
		type: 'wanderer',
		sprite: 'dwarf-0',
	},
	monster: {
		type: 'actor',
		factions: {
			good: -255,
			evil: 255,
		},
		plan: {
			randomMove: 0.5,
			aggroRange: 10,
			hunt: true,
		},
		fighter: {
			// Preference for melee vs ranged?
		},
		attacker: { // melee
			range: 1,
			natural: {
				damage: [1, 4],
				damageType: 'ph',
			},
		},
		firer: { // ranged?
			range: 0,
		},
		health: {
			hp: 12,
			hpMax: 12,
			respawnOnDeath: false,
		},
	},
	beastman: {
		type: 'monster',
		sprite: 'beastman-0',
	},
	darkHorseman: {
		type: 'monster',
		sprite: 'horseback',
	},
	orc: {
		type: 'monster',
		sprite: 'orc-0',
	},
	wildman: {
		type: 'monster',
		sprite: 'wildman-0',
	},

	// ---- Items ----
	item: {
		type: 'entity',
		isItem: true,
		value: {
			valueMultiplier: 0, // 1 for normal items, <1 for junk, >1 for treasures
		},
		// LATER: weight
		// TODO
	},
	carpet: {
		type: 'item',
		sprite: 'empty-carpet',
	},
	broom: {
		type: 'item',
		sprite: 'empty-broom',
	},
	horse: {
		type: 'item', // TODO: make an NPC
		sprite: 'horse',
	},
	sailboat: {
		type: 'item',
		sprite: 'empty-sailboat',
	},
	galleon: {
		type: 'item',
		sprite: 'empty-galleon',
	},
	weapon: {
		type: 'item',
		isWeapon: true,
		equippable: {
			slots: ['anyHand'],
		},
		attackable: {
			range: 1,
			damage: 1,
			type: 'ph',
		},
	},
	armor: {
		type: 'item',
		isArmor: true,
		// TODO: Where can it be worn
	},
};
