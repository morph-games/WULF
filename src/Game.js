import GameScreen from './GameScreen.js';
import GameStorage from './GameStorage.js';
import InputController from './InputController.js';
import WorldCommunicator from './WorldCommunicator.js';
import { wait, capitalizeFirst } from './utilities.js';
import { VOLUME_MIN, VOLUME_MAX } from './constants.js';

export default class Game {
	constructor(options = {}) {
		this.states = options.states || {};
		this.inputCtrl = new InputController(this.states);
		this.screen = new GameScreen(options);
		this.gameStorage = new GameStorage(options.gameName || 'WULF');
		this.worldComm = new WorldCommunicator({ world: options.world, actions: options.actions });
		this.commandIndex = 0;
		this.mapFocus = [0, 0];
		this.mapDisplaySizeX = 20;
		this.mapDisplaySizeY = 10;
		this.visibleWorld = {};
		this.party = {};
		this.avatarWhoId = null;
		this.renderWorldTime = 0; // the world time that we are rendered up to
		this.volume = 5;
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
		const [
			outcome, visibleWorld, party,
		] = await this.worldComm.sendCommandToWorld(worldCommand, this.avatarWhoId);
		// if (outcome.message) this.mainConsole.print(outcome.message);
		// TODO: Maybe keep track of the message in a log?
		this.handleIncomingData({ visibleWorld, party });
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
			this.screen.mainConsole.print(capitalizeFirst(directionCommand)); // TODO: print at end of line
			this.switchToTravel();
			this.executeCommand(directedCommandWords.join(' '));
		});
	}

	switchToTravel() {
		this.drawMap();
		this.inputCtrl.setState('travel', (command) => this.executeCommand(command));
	}

	switchTo(stateName) {
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
		console.warn('Unknown state', stateName);
	}

	async executeCommand(commandString) {
		await wait(10); // TODO: remove eventually
		console.log('Client Command:', commandString);
		const aliases = {
			vol: 'volume',
		};
		const clientOnlyCommands = {
			volume: (direction) => {
				let amount = 0;
				if (direction === 'up') amount = 1;
				else if (direction === 'down') amount = -1;
				this.volume = Math.min(Math.max(this.volume + amount, VOLUME_MIN), VOLUME_MAX);
				this.mainConsole.print(`Volume: ${this.volume}`);
				// TODO: Make a beep noise so the user can see what the volume is like
			},
			switch: (stateName) => this.switchTo(stateName),
			see: (stateName) => this.switchTo(stateName),
			abort: () => {
				this.switchToTravel();
			},
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

	drawMap() {
		this.screen.drawMap(this.visibleWorld, this.party);
	}

	getStateKeyCommands(stateName) {
		const { kb = {}, hideCommands = [] } = this.states[stateName];
		return Object.keys(kb)
			.filter((key) => !hideCommands.includes(key))
			.map((key) => ({ key, command: kb[key] }));
	}

	drawKeyCommandsScreen(stateName) {
		const keyCommandsArray = this.getStateKeyCommands(stateName);
		const KEY_REPLACEMENTS = {
			ArrowUp: 'Up',
			ArrowDown: 'Down',
			ArrowLeft: 'Left',
			ArrowRight: 'Right',
			' ': 'Space',
		};
		const COMMAND_REPLACEMENTS = {
			// 'switch commands': 'list commands',
		};
		const commandLines = keyCommandsArray.map(({ key, command }, i) => {
				const keyStr = KEY_REPLACEMENTS[key] || key;
				const cmdStr = (COMMAND_REPLACEMENTS[command] || command)
					.replaceAll('direction', 'dir');
				const cursor = (this.commandIndex === i) ? '>' : ' ';
				return `${cursor}(${keyStr}) ${cmdStr}`;
		});
		this.screen.drawCommandColumns(commandLines);
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
			if (this.renderWorldTime < delta.worldTime) {
				if (delta.whoId === this.avatarWhoId && !delta.quiet) {
					messagesBackwards.push(delta.message);
				}
			}
		});
		for (let i = messagesBackwards.length - 1; i >= 0; i -= 1) {
			console.log('Print', messagesBackwards[i]);
			this.screen.mainConsole.print(messagesBackwards[i]);
		}
	}

	handleIncomingData(data) {
		const { visibleWorld, party, deltas } = data;
		this.visibleWorld = Object.freeze(structuredClone(visibleWorld));
		this.party = Object.freeze(structuredClone(party));
		// console.log(data);
		if (deltas) {
			const startWorldTime = this.renderWorldTime;
			const endWorldTime = deltas[deltas.length - 1]?.worldTime || 0;
			// Handle the outcome
			this.drawDeltas(deltas, startWorldTime, endWorldTime);
			this.renderWorldTime = endWorldTime;
		}
		// if (outcome.message) print(outcome.message);
		// Refocus the map on the avatar, and re-draw
		this.refocus();
		this.drawAll();
	}

	async setup() {
		await Game.waitForDom();
		await this.screen.setup();

		this.screen.mainConsole.print('A flash of red...');
		this.screen.mainConsole.print('You have awoken in a strange world.');

		this.loadGame();

		this.worldComm.on('data', (data) => this.handleIncomingData(data));
		await this.worldComm.connect(this.avatarWhoId, this.mapDisplaySizeX, this.mapDisplaySizeY);
		await this.sendWorldCommand('ping', this.avatarWhoId); // needed to load the map

		this.drawMap();
		this.switchToTravel();
	}

	async start() {
		await this.setup();
		console.log('%c☥', 'font-size: 300%; color: #ff0;');
	}
}
