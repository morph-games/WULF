const states = {
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
	// ready: { // Ready a weapon / armor / spell
	// kb: {
	// w: 'ready weapon',
	// a: 'ready armor',
	// s: 'ready spell',
	// q: 'abort',
	// Escape: 'abort',
	// Enter: 'abort',
	// ' ': 'abort',
	// },
	// },
	equip: {
		kb: {
			Escape: 'abort',
			Enter: 'equip close',
			ArrowLeft: 'unequip',
			ArrowRight: 'equip',
			ArrowDown: 'next',
			ArrowUp: 'previous',
			a: 'unequip',
			d: 'equip',
			s: 'next',
			w: 'previous',
			' ': 'toggle',
			'?': 'help',
			F1: 'help',
			r: 'abort',
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
	shop: {
		kb: {
			Tab: 'nextTab',
			ArrowRight: 'add',
			ArrowLeft: 'subtract',
			ArrowDown: 'next',
			ArrowUp: 'previous',
			a: 'subtract',
			d: 'add',
			s: 'next',
			w: 'previous',
			Escape: 'abort',
			'-': 'subtract',
			'=': 'add',
			'+': 'add',
			'[': 'previousTab',
			']': 'nextTab',
			' ': 'add',
			'?': 'help',
			F1: 'help',
			t: 'talk',
			Enter: 'complete',
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
	navigate: {
		kb: {
			ArrowUp: 'previous',
			ArrowDown: 'next',
			ArrowLeft: 'previous',
			ArrowRight: 'next',
			// ???
		},
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
			o: 'open nearby', // General action for opening doors, coffins, chests (use for opening shops and opening pockets for stealing?)
			// o: 'open coffin', // U1: too specific
			// o: 'offer gold', // U2: Offer gold as payment or bribe
			// o: 'other commands', // U3: type in other commands like bribe, pay
			// o: 'open door', // U4-5: too specific
			p: 'pickpocket nearby', // New - same as steal in U1
			// p: 'peer', // U3, U4: Peer at a gem (view map)
			// p: 'push or pull' // U5
			q: 'quicksave',
			// Q: 'quit and save', // U1 (and others?)
			r: 'ready', // Use item
			// r: 'ready' // Most games: Ready weapon/armor/spell (select to limit choices)
			s: 'go down', // New WASD movement
			// - s = Move backwards
			// - s = U1: Steal
			// - s = U4, U5: search
			t: 'talk nearby', // More general form of transact/talk
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
			// - y = U2, U3, U5: Yell what you type (pointless in U2)
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
		keyHelp: {
			e: { en: 'enter/engage' },
			f: { en: 'fight' },
			l: { en: 'look' },
			o: { en: 'open' },
			p: { en: 'pickpocket' },
			t: { en: 'talk' },
		},
	},
};
export default states;
