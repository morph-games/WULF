import { SCREEN_WIDTH, SCREEN_HEIGHT } from './constants.js';
import overworld from './maps/overworld.js';
import castle1 from './maps/castle1.js';
import castle1B from './maps/castle1B.js';
import Game from './Game.js';

const game = new Game({
	spritesheets: {
		main: {
			url: './images/wulf-spritesheet-8.png',
			size: 16,
			atlas: [
				{ names: [
					'grass-0', 'grass-1', 'grass-2', 'grass-3',
					'forest-0', 'forest-1', 'forest-2', 'forest-3',
					'mountain-0', 'mountain-1', 'mountain-2', 'mountain-3',
					'mountain-door', 'circle', 'village', 'town', 'city',
					
				] },
				{ names: [
					'water-0', 'void', '', '', '', '', '', '', 'water-1', '', '', '', '', '', '', '',
					'stone-wall-0', 'stone-wall-1', 'stone-door-open', 'stone-window',
				] },
				{ names: [
					'dirt', 'floor-0', 'floor-1', 'floor-2', 'floor-3', 'floor-4', 'floor-5', 'floor-6',
				] },
				{ names: [ // props and transportation
					'ladder-down', 'ladder-up', 'magic-ladder-down', 'magic-ladder-up',
					'horseback', 'flying-carpet', 'sailboat', 'galleon', 'flying-broom', 
				] },
				{ names: [
					'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
					'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
				] }, // Letters 1
				{ names: [
					'U', 'V', 'W', 'X', 'Y', 'Z',
					'rune-A', 'rune-B', 'rune-C', 'rune-D', 'rune-E', 'rune-F', 'rune-G',
					'rune-H', 'rune-I', 'rune-J', 'rune-K', 'rune-L', 'rune-M', 'rune-N',
				] }, // Letters 2
				{ names: [
					'rune-O', 'rune-P', 'rune-Q', 'rune-R', 'rune-S', 'rune-T', 'rune-U',
					'rune-V', 'rune-W', 'rune-X', 'rune-Y', 'rune-Z',
					'rune-TH', 'rune-EE', 'rune-NG', 'rune-EA', 'rune-ST', 'rune-space',
					'stone-sign-left', 'stone-sign-right',
				] }, // Letters 3
				{
					names: [
						'spearman-0', 'spearman-1', 'spearman-2', 'spearman-3',
						'beastman-0', '', '', '',
						'king-0',
					],
				},
			],
		},
		fonts: {
			url: './images/letters-spritesheet-5.png',
			size: 8,
			atlas: [
				{
					names: [
						'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p',
						'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
						'th', 'ee', 'ng', 'ea', 'st', ' ',
						'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
						'-', '=', ';', ',', '.', '\'', '/',
					],
				},
				{
					names: [
						'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
						'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
						'TH', 'EE', 'NG', 'EA', 'ST', ' ',
						'ankh', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')',
						'_', '+', ':', '<', '>', '"', '?',
					],
				},
				{
					names: [
						'rune-A', 'rune-B', 'rune-C', 'rune-D', 'rune-E', 'rune-F', 'rune-G',
						'rune-H', 'rune-I', 'rune-J', 'rune-K', 'rune-L', 'rune-M', 'rune-N',
						'rune-O', 'rune-P',	'rune-Q', 'rune-R', 'rune-S', 'rune-T', 'rune-U',
						'rune-V', 'rune-W', 'rune-X', 'rune-Y', 'rune-Z',
						'Trune-H', 'Erune-E', 'Nrune-G', 'Erune-S', 'Srune-T', 'rune-space',
					],
				},
			],
		},
	},
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
		columns: (SCREEN_WIDTH / 8) - 10, // 'max',
	},
	world: {
		terrainTypes: {
			void: { sprite: 'void' },
			dirt: { sprite: 'dirt' },
			grass: {
				sprite: 'grass-0',
				// variations: 4,
			},
			water: {
				sprite: 'water',
				variations: 2,
			},
			forest: {
				sprite: 'forest-0',
				// variations: 4,
			},
			mountain: {
				sprite: 'mountain-0',
				// variations: 4,
			},
			wall: {
				sprite: 'stone-wall-0',
			},
			door: {
				sprite: 'stone-door-open',
			},
			window: {
				sprite: 'stone-window',
			},
			floor: {
				sprite: 'floor-0',
				// variations: 2,
			},
			tileFloor: {
				sprite: 'floor-2',
			},
			signLeft: { sprite: 'stone-sign-left' },
			signRight: { sprite: 'stone-sign-right' },
		},
		propTypes: {
			town: {
				sprite: 'town',
			},
			city: {
				sprite: 'city',
				investigate: 'You see the city of {{name}}.'
			},
			village: {
				sprite: 'village',
			},
			dungeon: {
				sprite: 'mountain-door',
			},

			ladderDown: { sprite: 'ladder-down', klimb: 'down' },
			ladderUp: { sprite: 'ladder-up', klimb: 'up' },
		},
		itemTypes: {},
		actorTypes: {
			king: {
				sprite: 'king-0',
			},
			guard: {
				sprite: 'spearman-2'
			},
		},
		maps: {
			overworld,
			castle1,
			castle1B,
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
		navigate: { // Navigate

		},
		travel: {
			kb: {
				ArrowUp: 'go up',
				ArrowDown: 'go down',
				ArrowLeft: 'go left',
				ArrowRight: 'go right',
				Tab: 'toggle party', // New - Show party screen; show inventory
				Enter: 'chat', // New - Chat? Same as yell?
				'/': 'command', // New - enter in special commands
				0: 'party return', // Return active player to party
				// - 1-6 = Select active player
				1: 'party 1',
				' ': 'pass', // pass time and eat (U1-U5)
				'-': 'volume down',
				'=': 'volume up',
				'+': 'volume up',
				a: 'go left', // New WASD movement
				// a = U1-5: attack + direction
				b: 'board',
				c: 'cast',
				d: 'go right', // New WASD movement
				// d = U1: Drop item
				// d = U2, U3, U4: Descend
				e: 'engage', // A more general form of enter, engage, etc.
				// e: 'enter', // All
				f: 'fight direction', // New - More general form - will use firing or melee depending on range
				// f: 'fire', // U1 and others
				g: 'get', // (show list of nearby items?)
				// g: 'get item', // U1,2,5
				// g: 'get chest' // U3,4: get chest and attempt to disarm traps
				G: 'get all', // New: take everything
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
				Q: 'quit and save', // U1 (and others?)
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
			},
		},
	},
});
game.start();
window.g = game;
