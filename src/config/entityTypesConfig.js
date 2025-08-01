const wall = {
	type: 'terrain',
	sprite: 'stone-wall-0',
	obstacleId: 1,
};

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
	wallA: { ...wall, sprite: 'A' },
	wallB: { ...wall, sprite: 'B' },
	wallC: { ...wall, sprite: 'C' },
	wallD: { ...wall, sprite: 'D' },
	wallE: { ...wall, sprite: 'E' },
	wallF: { ...wall, sprite: 'F' },
	wallG: { ...wall, sprite: 'G' },
	wallH: { ...wall, sprite: 'H' },
	wallI: { ...wall, sprite: 'I' },
	wallJ: { ...wall, sprite: 'J' },
	wallK: { ...wall, sprite: 'K' },
	wallL: { ...wall, sprite: 'L' },
	wallM: { ...wall, sprite: 'M' },
	wallN: { ...wall, sprite: 'N' },
	wallO: { ...wall, sprite: 'O' },
	wallP: { ...wall, sprite: 'P' },
	wallQ: { ...wall, sprite: 'Q' },
	wallR: { ...wall, sprite: 'R' },
	wallS: { ...wall, sprite: 'S' },
	wallT: { ...wall, sprite: 'T' },
	wallU: { ...wall, sprite: 'U' },
	wallV: { ...wall, sprite: 'V' },
	wallW: { ...wall, sprite: 'W' },
	wallX: { ...wall, sprite: 'X' },
	wallY: { ...wall, sprite: 'Y' },
	wallZ: { ...wall, sprite: 'Z' },
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
	wall,
	darkWall: {
		type: 'terrain',
		sprite: 'dark-stone-0',
		obstacleId: 1,
	},
	woodWall: {
		type: 'terrain',
		sprite: 'wood-wall-0',
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
	wheat: {
		type: 'terrain',
		sprite: 'wheat-0',
		// variations: 4,
		obstacleId: 7,
	},
	tree: {
		type: 'terrain',
		sprite: 'tree-0',
		// variations: 4,
		obstacleId: 10,
	},

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
		mover: {
			speed: 1,
			transversal: [1, 0, 0, 0, 0.5, 1, 1.1, 1.2, 0.5, 0.9, 0.8, 0, 0, 0, 0],
			movesCount: 0,
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
			food: 10,
		},
		inventory: {
			contents: [],
			max: 255,
		},
		equipment: {
			head: null,
			neck: null,
			torso: null,
			waist: null,
			legs: null,
			leftHand: null,
			rightHand: null,
			back: null,
			leftFinger: null,
			rightFinger: null,
			mainHandHeld: null,
			offHandHeld: null,
		},
		obstacleId: 13,
	},
	avatar: {
		type: 'actor',
		isAvatar: true,
		sprite: 'spearman-0',
		enterer: { speed: 1 },
		exitor: { speed: 1 },
		klimber: { speed: 1 },
		health: {
			hp: 99,
			hpMax: 99,
			respawnOnDeath: true, // TODO
		},
		currencies: {
			coins: 0,
			food: 99,
		},
		eater: {
			moveMeal: 1,
		},
		attacker: { // melee
			range: 1,
			natural: {
				damage: [5, 10],
				damageType: 'ph',
			},
		},
		inventory: {
			contents: ['dagger', 'sword', 'leatherArmor', 'chainArmor'],
			max: 255,
		},
		experience: {
			totalXp: 0,
			killXp: 100,
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
	worker: {
		type: 'wanderer',
		sprite: 'blacksmith-0',
		plan: { randomMove: 0.1 },
	},
	man: {
		type: 'wanderer',
	},
	woman: {
		type: 'wanderer',
		sprite: 'woman-0',
	},
	mage: {
		type: 'worker',
		sprite: 'mage-0',
		plan: { randomMove: 0.1 },
	},
	blacksmith: {
		type: 'worker',
		sprite: 'blacksmith-0',
	},
	wench: {
		type: 'wanderer',
		sprite: 'wench-0',
	},
	jester: {
		type: 'wanderer',
		sprite: 'jester-0',
		plan: { randomMove: 0.9 },
	},
	merchant: {
		type: 'actor',
		sprite: 'merchant-0',
	},
	shopkeeper: {
		type: 'merchant',
		sprite: 'shopkeeper-0',
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
		shop: {
			buy: {
				any: ['item'],
			},
			sell: {
				types: [
					'dagger', 'mace', 'axe', 'ropeAndSpikes',
					'sword', 'greatSword',
					'bow', 'amulet', 'wand', 'staff',
				],
				gateByMovesCount: [0, 0, 0, 0, 1500, 1500, 3000, 3000, 3000, 3000],
			},
		},
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
		currencies: { coins: [0, 10], food: 0 },
		experience: { killXp: 10 },
	},
	darkHorseman: {
		type: 'monster',
		sprite: 'horseback',
		currencies: { coins: [0, 10], food: [0, 10] },
		experience: { killXp: 10 },
	},
	orc: {
		type: 'monster',
		sprite: 'orc-0',
		currencies: { coins: [0, 10], food: [0, 10] },
		experience: { killXp: 10 },
	},
	wildman: {
		type: 'monster',
		sprite: 'wildman-0',
		currencies: { coins: [0, 10], food: 0 },
		experience: { killXp: 10 },
	},

	// ---- Items ----
	item: {
		type: 'entity',
		isItem: true,
		valuable: {
			valueMultiplier: 1, // 1 for normal items, <1 for junk, >1 for treasures
		},
		sprite: 'torch-0',
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
			slots: ['mainHandHeld'],
		},
		attackable: {
			range: 1,
			damage: 1,
			type: 'ph',
		},
	},
	dagger: { attackable: { damage: 8, range: 1, type: 'ph' }, type: 'weapon' },
	mace: { attackable: { damage: 16, range: 1, type: 'ph' }, type: 'weapon' },
	axe: { attackable: { damage: 24, range: 1, type: 'ph' }, type: 'weapon' },
	ropeAndSpikes: { attackable: { damage: 1, range: 1, type: 'ph' }, type: 'weapon' },
	sword: { attackable: { damage: 40, range: 1, type: 'ph' }, type: 'weapon' },
	greatSword: { attackable: { damage: 48, range: 1, type: 'ph' }, type: 'weapon' },
	bow: { attackable: { damage: 56, range: 1, type: 'ph' }, type: 'weapon' },
	amulet: { buff: { spellDamageBonus: 0.5 }, type: 'weapon' },
	wand: { buff: { spellDamageBonus: 1 }, type: 'weapon' },
	staff: { buff: { spellDamageBonus: 2 }, type: 'weapon' },
	triangle: { buff: { spellDamageBonus: 2 }, attackable: { damage: 88, range: 1, type: 'ph' }, type: 'weapon' },
	pistol: { attackable: { damage: 96, range: 1, type: 'ph' }, type: 'weapon' },
	lightSword: { attackable: { damage: 104, range: 1, type: 'ph' }, type: 'weapon' },
	phazor: { attackable: { damage: 112, range: 1, type: 'ph' }, type: 'weapon' },
	blaster: { attackable: { damage: 120, range: 1, type: 'ph' }, type: 'weapon' },
	armor: {
		type: 'item',
		isArmor: true,
		equippable: {
			slots: ['torso'],
		},
	},
	leatherArmor: { type: 'armor', buff: { defense: 2 }, valuable: 10 },
	chainArmor: { type: 'armor', buff: { defense: 4 }, valuable: 25 },
	plateArmor: { type: 'armor', buff: { defense: 6 }, valuable: 60 },
	vacuumArmor: { type: 'armor', buff: { defense: 9 }, valuable: 120 },
	reflectArmor: { type: 'armor', buff: { defense: 14 }, valuable: 280 },
};
