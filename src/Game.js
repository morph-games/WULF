import GameScreen from './GameScreen.js';
import GameStorage from './GameStorage.js';
import InputController from './InputController.js';
import WorldCommunicator from './WorldCommunicator.js';
import GameShop from './GameShop.js';
import InventoryInterface from './InventoryInterface.js';
import { wait, capitalizeFirst } from './utilities.js';
import { VOLUME_MIN, VOLUME_MAX, COORDINATE_MAP } from './constants.js';

function findDirectionKey(x = 0, y = 0) {
	if (x !== 0 && y !== 0) return null; // Need at least one zero
	return Object.keys(COORDINATE_MAP).find(
		(key) => (COORDINATE_MAP[key][0] === Math.sign(x) && COORDINATE_MAP[key][1] === Math.sign(y)),
	);
}

export default class Game {
	constructor(options = {}) {
		this.states = options.states || {};
		this.inputCtrl = new InputController(this.states);
		this.screen = new GameScreen(options);
		this.gameStorage = new GameStorage(options.gameName || 'WULF');
		this.worldComm = new WorldCommunicator({ world: options.world, actions: options.actions });
		this.commandIndex = 0;
		this.mapFocus = [0, 0];
		this.mapDisplaySizeX = options?.mapDisplay?.w;
		this.mapDisplaySizeY = options?.mapDisplay?.h;
		this.visibleWorld = {};
		this.party = {};
		this.avatarWhoId = null;
		this.renderWorldTime = 0; // the world time that we are rendered up to
		this.volume = 5;
		this.settings = structuredClone(options.settings);
		this.shopTab = 0;
		this.shopIndex = 0;
		this.gameShop = {};
	}

	static waitForDom() {
		return new Promise((resolve) => {
			window.addEventListener('DOMContentLoaded', () => resolve());
		});
	}

	async loadGame() {
		// this.gameStorage.saveSave(0, 'test123', { mydata: 123 });
		// TODO: Load data
		this.avatarWhoId = 'my-avatar-1';
		this.worldComm.load();
	}

	async sendWorldCommand(worldCommand) {
		if (!worldCommand) return;
		const [
			outcome,
			// visibleWorld, party,
		] = await this.worldComm.sendCommandToWorld(worldCommand, this.avatarWhoId);
		// if (outcome.message) this.mainConsole.print(outcome.message);
		// TODO: Maybe keep track of the message in a log?
		// this.handleIncomingData({ visibleWorld, party });
		return outcome;
	}

	refocus() {
		this.mapFocus[0] = this.party?.avatar.visibleWorldX || 0;
		this.mapFocus[1] = this.party?.avatar.visibleWorldY || 0;
	}

	switchToAskDirection(commandWords) {
		const directionIndex = commandWords.findIndex((w) => w === 'direction');
		this.screen.mainConsole.print(`${capitalizeFirst(commandWords[0])} Direction?`);
		this.inputCtrl.setState('direction', (directionCommand) => {
			if (directionCommand === 'abort') {
				this.switchToTravel();
				this.mainConsole.print('Cancel'); // TODO: print at end of line
				return;
			}
			const directedCommandWords = [...commandWords];
			directedCommandWords[directionIndex] = directionCommand;
			this.screen.mainConsole.print(capitalizeFirst(directionCommand));
			// ^ TODO: print at end of line
			this.switchToTravel();
			this.executeCommand(directedCommandWords.join(' '));
		});
	}

	switchToTravel() {
		this.drawMap();
		this.inputCtrl.setState('travel', (command) => this.executeCommand(command));
	}

	switchTo(stateName, data) {
		if (stateName === 'travel') {
			this.switchToTravel();
			return;
		}
		if (stateName === 'direction') {
			this.switchToAskDirection();
			return;
		}
		if (stateName === 'commands') {
			this.inputCtrl.setState('commands', (command) => {
				if (command === 'abort') {
					this.switchTo('travel');
					return;
				}
				const travelCommands = this.getStateKeyCommands('travel');
				if (command === 'execute') {
					this.switchTo('travel');
					const travelCmd = travelCommands[this.commandIndex]?.command;
					this.executeCommand(travelCmd);
					return;
				}
				const n = travelCommands.length;
				if (command === 'next') {
					this.commandIndex = (this.commandIndex + 1) % n;
				} else if (command === 'previous') {
					this.commandIndex = (n + this.commandIndex - 1) % n;
				}
				this.drawKeyCommandsScreen('travel');
			});
			this.drawKeyCommandsScreen('travel');
			return;
		}
		if (stateName === 'shop') {
			this.gameShop = new GameShop(data.shop, this.party.avatar.inventory);
			this.inputCtrl.setState('shop', async (command) => {
				if (command === 'abort') {
					this.switchTo('travel');
					return;
				}
				if (command === 'add') {
					this.gameShop.add(1);
				} else if (command === 'subtract') {
					this.gameShop.subtract(1);
				}
				if (command === 'nextTab') {
					this.gameShop.tab(1);
				} else if (command === 'previousTab') {
					this.gameShop.tab(-1);
				}
				if (command === 'next') {
					this.gameShop.next(1);
				} else if (command === 'previous') {
					this.gameShop.next(-1);
				}
				if (command === 'help') {
					this.gameShop.toggleHelp();
				}
				if (command === 'complete') {
					const [sellCommand, buyCommand] = this.gameShop.completeTransaction();
					await this.sendWorldCommand(sellCommand);
					await this.sendWorldCommand(buyCommand);
					this.switchTo('travel');
					return;
				}
				this.drawShop();
			});
			this.drawShop();
			return;
		}
		if (stateName === 'equip') {
			this.inventoryInterface = new InventoryInterface(this.party);
			this.inputCtrl.setState('equip', async (command) => {
				if (command === 'abort') {
					this.switchTo('travel');
					return;
				}
				if (command === 'equip close') {
					this.inventoryInterface.equip();
					// await this.sendWorldCommand('equip ???'); // FIXME
					this.switchTo('travel');
					return;
				}
				if (command === 'equip') {
					this.inventoryInterface.equip();
					// await this.sendWorldCommand('equip ???'); // FIXME
				} else if (command === 'unequip') {
					this.inventoryInterface.unequip();
					// await this.sendWorldCommand('equip ???'); // FIXME
				} else if (command === 'toggle') {
					this.inventoryInterface.toggle();
					// await this.sendWorldCommand('equip ???'); // FIXME
				} else if (command === 'next') {
					this.inventoryInterface.next(1);
				} else if (command === 'previous') {
					this.inventoryInterface.next(-1);
				} else if (command === 'help') {
					this.inventoryInterface.toggleHelp();
				}
				this.drawInventory();
			});
			this.drawInventory();
			return;
		}
		console.warn('Unknown state', stateName);
	}

	async executeCommand(commandString) {
		await wait(10); // TODO: remove eventually
		console.log('\t\tClient Command:', commandString);
		const aliases = {
			vol: 'volume',
		};
		const clientOnlyCommands = {
			volume: (direction) => {
				let amount = 0;
				if (direction === 'up') amount = 1;
				else if (direction === 'down') amount = -1;
				this.volume = Math.min(Math.max(this.volume + amount, VOLUME_MIN), VOLUME_MAX);
				this.screen.mainConsole.print(`Volume: ${this.volume}`);
				// TODO: Make a beep noise so the user can see what the volume is like
			},
			switch: (stateName) => this.switchTo(stateName),
			see: (stateName) => this.switchTo(stateName),
			abort: () => {
				this.switchToTravel();
			},
			ready: () => this.switchTo('equip'),
			view: () => {},
			chat: () => {},
		};
		const commandWords = String(commandString).toLowerCase().split(' ');
		const aliasCommand = aliases[commandWords[0]];
		if (aliasCommand) commandWords[0] = aliasCommand;
		// See if the command is do be done on the client-side only
		const fn = clientOnlyCommands[commandWords[0]];
		if (fn) {
			const commandParams = commandWords.slice(1);
			await fn(...commandParams);
			return;
		}
		// Check if the command needs a direction
		if (commandWords.includes('nearby')) {
			const i = commandWords.findIndex((w) => w === 'nearby');
			const { visibleWorldX, visibleWorldY } = this.party.avatar;
			const ents = this.findVisibleEntitiesNearby(visibleWorldX, visibleWorldY);
			// If there is only one thing nearby, then do the action in that direction
			if (ents.length === 1) {
				const [, visX, visY] = ents[0];
				const direction = findDirectionKey(visX - visibleWorldX, visY - visibleWorldY);
				if (direction) commandWords[i] = direction;
				// else if (ents.length > 1)
				// TODO: if multiple items, let user select?
			} else {
				commandWords[i] = 'direction';
			}
		}
		if (commandWords.includes('direction')) {
			this.switchToAskDirection(commandWords);
			return;
		}
		// Send the command to the world (server), and handle the response
		await this.sendWorldCommand(commandWords);
	}

	/** @deprecated */
	getMapFocusTopLeft() {
		const [centerX, centerY] = this.mapFocus;
		return [
			centerX - Math.floor(this.mapDisplaySizeX / 2),
			centerY - Math.floor(this.mapDisplaySizeY / 2),
		];
	}

	findVisibleEntitiesAt(x, y, types = ['actors', 'items', 'props']) {
		const found = [];
		types.forEach((type) => {
			this.visibleWorld[type].forEach((visibleEntity) => {
				const [, visX, visY] = visibleEntity;
				if (visX === x && visY === y) found.push(visibleEntity);
			});
		});
		return found;
	}

	findVisibleEntitiesNearby(x, y, types) {
		let near = [];
		Object.values(COORDINATE_MAP).forEach(([dirX, dirY]) => {
			// if (dirX === 0)
			const ents = this.findVisibleEntitiesAt(x + dirX, y + dirY, types);
			near = [...near, ...ents];
		});
		return near;
	}

	drawMap(hideLines) {
		this.screen.drawMap(this.visibleWorld, this.party, hideLines);
	}

	getStateKeyCommands(stateName) {
		const { kb = {}, hideCommands = [], keyHelp = {} } = this.states[stateName];
		return Object.keys(kb)
			.filter((key) => !hideCommands.includes(key))
			.map((key) => ({ key, command: kb[key], keyHelp: keyHelp[key] }));
	}

	drawKeyCommandsScreen(stateName) {
		const keyCommandsArray = this.getStateKeyCommands(stateName);
		const KEY_REPLACEMENTS = { // TODO: internationalize this
			ArrowUp: 'Up',
			ArrowDown: 'Down',
			ArrowLeft: 'Left',
			ArrowRight: 'Right',
			' ': 'Space',
		};
		const commandLines = keyCommandsArray.map(({ key, command, keyHelp = {} }, i) => {
			const keyStr = KEY_REPLACEMENTS[key] || key;
			const cmdStr = (keyHelp[this.settings.language] || command);
			const cursor = (this.commandIndex === i) ? '>' : ' ';
			return `${cursor}(${keyStr}) ${cmdStr}`;
		});
		this.screen.drawCommandColumns(commandLines);
	}

	drawShop() {
		this.drawMap(true);
		this.screen.drawCentralText(this.gameShop.getTextLines());
	}

	drawInventory() {
		this.drawMap(true);
		this.screen.drawCentralText(this.inventoryInterface.getTextLines());
	}

	drawAll() {
		this.screen.drawAll(this.visibleWorld, this.party);
	}

	/** Loop through deltas - assuming they are in worldTime order */
	static loopDeltas(deltas = [], fromWorldTime = 0, toWorldTime = 0, fn = () => {}) {
		let delta;
		for (let i = deltas.length - 1; i >= 0; i -= 1) {
			delta = deltas[i];
			if (delta.worldTime < fromWorldTime) return;
			if (delta.worldTime <= toWorldTime) {
				const discontinueLoop = fn(delta);
				if (discontinueLoop) return;
			}
		}
	}

	drawDeltas(deltas = [], fromWorldTime = 0, toWorldTime = 0) {
		const messagesBackwards = [];
		Game.loopDeltas(deltas, fromWorldTime, toWorldTime, (delta) => {
			const { whoId, message, quiet, worldTime } = delta;
			if (this.renderWorldTime < worldTime) {
				if (whoId === this.avatarWhoId && !quiet) {
					messagesBackwards.push(message);
				}
			}
		});
		for (let i = messagesBackwards.length - 1; i >= 0; i -= 1) {
			console.log('\t\tPrint', messagesBackwards[i]);
			this.screen.mainConsole.print(messagesBackwards[i]);
		}
	}

	handleDeltas(deltas = []) {
		if (!deltas || !deltas.length) return null;
		const startWorldTime = this.renderWorldTime;
		const endWorldTime = deltas[deltas.length - 1]?.worldTime || 0;
		const deltasWithData = []; // deltas.filter((delta) => delta.data);
		const deltasInRange = deltas.filter((delta) => {
			const inRange = delta.worldTime >= startWorldTime;
			if (inRange && delta.data) deltasWithData.push(delta);
			return inRange;
		});
		console.log('\t\t\tDeltas handled:', deltas.length, 'in time range:', deltasInRange.length);
		// Handle the outcome
		this.drawDeltas(deltas, startWorldTime, endWorldTime);
		this.renderWorldTime = endWorldTime;
		// Look for the need to switch
		if (!deltasWithData.length) return null;
		// Just look at the most recent data
		// TODO: Make this more robust, looking at all data returned
		const lastData = deltasWithData[deltasWithData.length - 1].data;
		if (lastData.shop) return { ...lastData, stateName: 'shop' };
		return { ...lastData };
	}

	handleIncomingData(data) {
		const { visibleWorld, party, deltas } = data;
		this.visibleWorld = Object.freeze(structuredClone(visibleWorld));
		this.party = Object.freeze(structuredClone(party));
		// console.log(data);
		const switchToData = this.handleDeltas(deltas);
		// if (outcome.message) print(outcome.message);
		// Refocus the map on the avatar, and re-draw
		this.refocus();
		this.drawAll();
		if (switchToData && switchToData.stateName) {
			this.switchTo(switchToData.stateName, switchToData);
		}
	}

	async setup() {
		await Game.waitForDom();
		await this.screen.setup();

		this.screen.mainConsole.print('You enter a swirling gateway, and awaken in a strange world.');

		this.loadGame();

		this.worldComm.on('data', (data) => this.handleIncomingData(data));
		await this.worldComm.connect(this.avatarWhoId, this.mapDisplaySizeX, this.mapDisplaySizeY);
		await this.sendWorldCommand('ping', this.avatarWhoId); // needed to load the map

		this.drawMap();
		this.inputCtrl.setup();
		this.switchToTravel();
	}

	async start() {
		await this.setup();
		console.log('%c☥', 'font-size: 300%; color: #ff0;');
	}
}
