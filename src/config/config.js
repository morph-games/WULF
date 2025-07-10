import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../constants.js';
import spritesheets from './spritesheets.js';
import entityTypes from './entityTypes.js';
import overworld from './maps/overworld.js';
import castle1 from './maps/castle1.js';
import castle1B from './maps/castle1B.js';

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
	},
	spritesheets,
	screen: {
		containerSelector: '#screen',
		mainCanvasId: 'main-canvas',
		height: SCREEN_HEIGHT,
		width: SCREEN_WIDTH,
	},
	mainConsole: {
		horizontal: 'left',
		vertical: 'bottom',
		rows: 4,
		columns: SCREEN_WIDTH_LETTERS - 10, // 'max',
		cursor: '>',
		fontSize: FONT_SIZE,
	},
	quickStatConsole: {
		horizontal: 'right',
		vertical: 'bottom',
		rows: 4,
		columns: 10,
		fontSize: FONT_SIZE,
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
		maps: {
			overworld,
			castle1,
			castle1B,
		},
		globalLegend: {
			'.': ['grass'],
			':': ['dirt'],
			'~': ['water'],
			'^': ['mountain'],
			'f': ['forest'],
			'-': ['floor'],
			'#': ['wall'],
			'B': ['grass', 'beastman'],
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
	states: {
		direction: { // Select a direction
			kb: {
				ArrowUp: 'up',
				ArrowDown: 'down',
				ArrowLeft: 'left',
				ArrowRight: 'right',
				w: 'up',
				s: 'down',
				a: 'left',
				d: 'right',
				q: 'abort',
				Escape: 'abort',
				Enter: 'abort',
				' ': 'abort',
			},
		},
		stats: { // Showing stats/inventory screen
			kb: {
				q: 'close',
				Escape: 'close',
				Enter: 'next',
				' ': 'next',
			},
		},
		ready: { // Ready a weapon / armor / spell
			kb: {
				w: 'ready weapon',
				a: 'ready armor',
				s: 'ready spell',
				q: 'abort',
				Escape: 'abort',
				Enter: 'abort',
				' ': 'abort',
			},
		},
		cast: { // Cast selection
			kb: {
				ArrowUp: 'up',
				ArrowDown: 'down',
				w: 'up',
				s: 'down',
				q: 'abort',
				Escape: 'abort',
				Enter: 'abort',
				' ': 'abort',
			},
		},
		item: { // Select an item
			kb: {
				ArrowUp: 'up',
				ArrowDown: 'down',
				w: 'up',
				s: 'down',
				q: 'abort',
				Escape: 'abort',
				Enter: 'abort',
				' ': 'abort',
			},
		},
		commands: {
			kb: {
				ArrowUp: 'previous',
				ArrowDown: 'next',
				ArrowLeft: 'previous',
				ArrowRight: 'next',
				w: 'previous',
				a: 'previous',
				s: 'next',
				d: 'next',
				Escape: 'abort',
				Enter: 'execute',
				' ': 'execute',
				'?': 'abort',
				F1: 'abort',
			},
		},
		navigate: { // Navigate

		},
		travel: {
			hideCommands: ['/', '0', '1', '=', 'G', 'Q', 'Enter'],
			kb: {
				' ': 'pass', // pass time and eat (U1-U5)
				Tab: 'toggle party', // New - Show party screen; show inventory
				Enter: 'chat', // New - Chat? Same as yell?
				'/': 'command', // New - enter in special commands
				0: 'party return', // Return active player to party
				// - 1-6 = Select active player
				1: 'party 1',
				a: 'go left', // New WASD movement
				// a: 'attack direction', // a = U1-5: attack + direction
				b: 'board',
				c: 'cast',
				d: 'go right', // New WASD movement
				// d = U1: Drop item
				// d = U2, U3, U4: Descend
				e: 'engage', // A more general form of enter, engage, etc.
				// e: 'enter', // All
				f: 'fight direction', // New - More general form - will use firing or melee depending on range
				// f: 'fire', // U1 and others
				g: 'get nearby', // (show list of nearby items?)
				// g: 'get item', // U1,2,5
				// g: 'get chest' // U3,4: get chest and attempt to disarm traps
				// G: 'get all', // New: take everything
				h: 'hole up', // 'hole up' (camp) U4-5
				// h: 'hull repair', // New idea for frigate
				// h: 'heal' // New idea: either does hull repair or hole up
				// h: 'hyperjump', // U1
				i: 'investigate', // "inform" in U1
				// i: 'ignite' // ignite torch in U2-3
				j: 'junk item', // 'junk' (i.e., drop)
				// j: 'jump', // U2
				// j: 'jimmy lock' // U4
				k: 'klimb', // U5: up and down; others require 'd' for descend
				// Ctrl+K = U5: Karma
				l: 'look direction', // searching, investigating
				// l: 'launch', // U2: launch or land a plane or rocket (grass only)
				// l: 'locate position', // U4: locate position with item
				m: 'map', // New
				// m: 'magic readying', // U2
				// m: 'move', // U3: Move/swap party positions
				// m: 'mix', // U4-5: Mix reagants
				n: 'navigate', // New idea: Select discovered towns/cities/dungeons/sites and fast travel or get guidance lines or direction
				// n: 'negate time', // U2-3: negate time with item
				// n: 'new order', // U4-5: New order of party members
				o: 'open direction', // General action for opening doors, coffins, chests (use for opening shops and opening pockets for stealing?)
				// o: 'open coffin', // U1: too specific
				// o: 'offer gold', // U2: Offer gold as payment or bribe
				// o: 'other commands', // U3: type in other commands like bribe, pay
				// o: 'open door', // U4-5: too specific
				p: 'pickpocket', // New - same as steal in U1
				// p: 'peer', // U3, U4: Peer at a gem (view map)
				// p: 'push or pull' // U5
				q: 'quicksave',
				// Q: 'quit and save', // U1 (and others?)
				r: 'ready item', // Use item
				// r: 'ready' // Most games: Ready weapon/armor/spell (select to limit choices)
				s: 'go down', // New WASD movement
				// - s = Move backwards
				// - s = U1: Steal
				// - s = U4, U5: search
				t: 'talk', // More general form of transact/talk
				// - t = U1: transact (talk) + direction
				// - t = U4, U5: talk + type keyword
				u: 'use item', // U4, U5: Use item
				// - u = U?: unlock cells and dungeon chests
				v: 'view toggle', // ??
				// - v = U1: was View change toggle - space top vs front view
				// - v = U3, U4: volume
				// - v = U5: view magical mapping gem
				w: 'go up', // New WASD movement
				// w: 'wear', // U2, U3, U4: wear
				x: 'eXit', // dismount (All?)
				y: 'yell', // To summon horse or attract monsters
				// - y = U2, U5: Yell what you type (pointless in U2)
				// - y = U4: Yell for horse (advances plot)
				z: 'ztats', // Show stats (statistics and inventory)
				ArrowUp: 'go up',
				ArrowDown: 'go down',
				ArrowLeft: 'go left',
				ArrowRight: 'go right',
				'+': 'volume up',
				'=': 'volume up',
				'-': 'volume down',
				'?': 'see commands',
				F1: 'see commands',
			},
		},
	},
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
		plan: { cooldown: 1 },
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
