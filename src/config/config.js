import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../constants.js';
import spritesheets from './spritesheets.js';
import entityTypes from './entityTypesConfig.js';
import states from './statesConfig.js';
import overworld from './maps/overworld.js';
import castle1 from './maps/castle1.js';
import castle1B from './maps/castle1B.js';
import dungeon1 from './maps/dungeon1.js';
import town1 from './maps/town1.js';

const FONT_SIZE = 8;
const SCREEN_WIDTH_LETTERS = SCREEN_WIDTH / FONT_SIZE;
const MAX_ROWS = SCREEN_HEIGHT / FONT_SIZE;
const MAX_COLS = SCREEN_WIDTH / FONT_SIZE;
const HALF_COLS = Math.floor(MAX_COLS / 2);

/* eslint-disable quote-props */
export default {
	settings: {
		bumpCombat: 1,
		autoEnter: 0,
		language: 'en',
	},
	spritesheets,
	screen: {
		containerSelector: '#screen',
		mainCanvasId: 'main-canvas',
		height: SCREEN_HEIGHT,
		width: SCREEN_WIDTH,
		colors: {
			blue: '#2bcfd6',
			green: '#53d638',
			violet: '#962ba5',
			orange: '#d95e1c',
			white: '#f1f1f1',
			black: '#000000',
		},
	},
	mapDisplay: {
		w: 20,
		h: 10,
		offsetX: 0,
		offsetY: 1,
	},
	mainConsole: {
		horizontal: 'left',
		vertical: 'bottom',
		rows: 4,
		columns: SCREEN_WIDTH_LETTERS - 10, // 'max',
		cursor: '>',
		fontSize: FONT_SIZE,
		offsetX: 0,
		offsetY: -2,
	},
	quickStatConsole: {
		horizontal: 'right',
		vertical: 'bottom',
		rows: 4,
		columns: 9,
		fontSize: FONT_SIZE,
		offsetX: -2,
		offsetY: -2,
	},
	commandConsoles: [
		{
			horizontal: 1,
			vertical: 1,
			rows: MAX_ROWS - 2,
			columns: HALF_COLS - 1,
			fontSize: FONT_SIZE,
		},
		{
			horizontal: HALF_COLS + 1,
			vertical: 1,
			rows: MAX_ROWS - 2,
			columns: HALF_COLS - 2,
			fontSize: FONT_SIZE,
		},
	],
	centralConsole: {
		horizontal: 'left',
		vertical: 'top',
		rows: 21,
		columns: 36,
		fontSize: FONT_SIZE,
		offsetX: FONT_SIZE * 2,
		offsetY: FONT_SIZE * 2,
	},
	world: {
		obstacleTypes: [
			'none', 		// 0
			'impassable physical obstacle', // 1 - e.g., wall
			'deep ocean',	// 2
			'shallow water', // 3
			'swamp',		// 4
			'plains',		// 5
			'path',			// 6
			'road',			// 7
			'desert',		// 8
			'hills',		// 9
			'forest',		// 10
			'low mountains', // 11
			'high mountains', // 12
			'short physical obstacle', // 13 - e.g., person; can be flown over
			'lava',			// 14
			'magical barrier', // 15
			'', // 16
		],
		entityTypes,
		mapTypes: {
			overworld: {
				moveMealMultiplier: 1,
				moveXpMultiplier: 1,
				scale: 'overworld',
			},
			civilization: {
				moveMealMultiplier: 0,
				moveXpMultiplier: 0,
				scale: 'personal',
			},
			dungeon: {
				moveMealMultiplier: 1,
				moveXpMultiplier: 1,
				scale: 'personal',
			},
		},
		maps: {
			overworld,
			castle1,
			castle1B,
			dungeon1,
			town1,
		},
		globalLegend: {
			'.': ['grass'],
			':': ['dirt'],
			'~': ['water'],
			'^': ['mountain'],
			'&': ['forest'],
			'-': ['floor'],
			'*': ['floor', 'torch'],
			'|': ['floor', 'pillar'],
			'#': ['wall'],
			'B': ['grass', 'beastman'],
			'O': ['grass', 'orc'],
		},
		timing: { // How many time units do certain things cooldown after
			actionCooldown: 20,
			actionCooldownRandom: 4,
			actionWarmup: 5,
			actionWarmupRandom: 0,
			overworldEating: 100,
			townEating: 10000,
			regen: 120,
			spawnCooldown: 80,
			spawnCooldownRandom: 50,
		},
	},
	stats: {
		min: 0,
		max: 99,
		list: [
			{ name: 'Strength' },
			// TODO
		],
	},
	start: {
		mapKey: 'overworld',
		coordinates: [10, 10],
	},
	states,
	actions: {
		board: { cooldown: 1 },
		camp: { cooldown: 2 },
		cast: { cooldown: 1 },
		engage: { cooldown: 0 },
		enter: { cooldown: 1 },
		dismount: { cooldown: 0.6 },
		fight: { cooldown: 1 },
		fire: { cooldown: 1 },
		get: { cooldown: 0.6 },
		heal: { cooldown: 2 },
		hyperjump: { cooldown: 0.1 },
		ignite: { cooldown: 0.6 },
		investigate: { cooldown: 2 },
		junk: { cooldown: 0.8 },
		jump: { cooldown: 0.1 },
		jimmy: { cooldown: 2 },
		klimb: { cooldown: 1, warmup: 0.9 },
		launch: { cooldown: 0.1 },
		locate: { cooldown: 0.1 },
		mix: { cooldown: 3 },
		move: { cooldown: 1 },
		navigate: { cooldown: 3 },
		negate: { cooldown: 0.9 },
		open: { cooldown: 0.5 },
		offer: { cooldown: 1 },
		pass: { cooldown: 1 },
		pickpocket: { cooldown: 0.5, warmup: 2 },
		peer: { cooldown: 1 },
		plan: { cooldown: 0.2 },
		// ^ Since planning takes time, all NPCs will be a bit slower than player characters
		push: { cooldown: 1 },
		ready: { cooldown: 0.9 },
		summon: { cooldown: 1 },
		talk: { cooldown: 1 },
		transact: { cooldown: 2 },
		unlock: { cooldown: 2 },
		warmup: { cooldown: 0.6 },
		yell: { cooldown: 0.1 },
	},
};
