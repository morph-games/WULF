// import TextController from './TextController.js';
import GameCanvas from './GameCanvas.js';
import GameConsole from './GameConsole.js';
import GameStorage from './GameStorage.js';
import SpriteSheet from './Spritesheet.js';
import InputController from './InputController.js';
import WorldCommunicator from './WorldCommunicator.js';
import { wait, capitalizeFirst } from './utilities.js';
import { VOLUME_MIN, VOLUME_MAX } from './constants.js';

function testFontDraw(gCanvas) { // eslint-disable-line
	const { ctx } = gCanvas;

	ctx.fillStyle = '#fff';
	ctx.font = '8px AppleII';
	[
		'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
		'abcdefghijklmnopqrstuvwxyz',
		'All human beings are born free and equal in dignity and rights.',
		'They are endowed with reason and conscience and should act',
		'towards one another in a spirit of brotherhood.',
	].forEach((row, i) => {
		ctx.fillText(row, 0.5, 100 + (i * 8));
	});

	gCanvas.removePixelTransparency(180);
}

export default class Game {
	constructor(options = {}) {
		this.states = options.states || {};
		this.inputCtrl = new InputController(this.states);
		this.screenWidth = options.screen?.width || 320;
		this.screenHeight = options.screen?.height || 200;
		this.screenSelector = options.screen?.containerSelector || '#wulf-screen';
		this.mainCanvasId = options.screen?.mainCanvasId || 'wulf-main-canvas';
		this.gameCanvas = new GameCanvas(this.mainCanvasId, [this.screenWidth, this.screenHeight]);
		this.gameStorage = new GameStorage(options.gameName || 'WULF');
		this.worldComm = new WorldCommunicator({ world: options.world, actions: options.actions });
		this.ss = new SpriteSheet(options?.spritesheets?.main);
		this.fontsSpritesheet = new SpriteSheet(options?.spritesheets?.fonts);
		// this.textCtrl = new TextController(this.fontsSpritesheet);
		this.mainConsole = new GameConsole(options.mainConsole, this.fontsSpritesheet);
		this.quickStatConsole = new GameConsole(options.quickStatConsole, this.fontsSpritesheet);
		this.commandConsoles = options.commandConsoles.map((commandConsoleOptions) => {
			return new GameConsole(commandConsoleOptions, this.fontsSpritesheet);
		});
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

	adjustScreenSize() {
		const maxW = window.innerWidth;
		const maxH = window.innerHeight;
		const multiplier = Math.floor(Math.min(maxW / this.screenWidth, maxH / this.screenHeight));
		const w = this.screenWidth * multiplier;
		const h = this.screenHeight * multiplier;
		const screenElt = document.querySelector(this.screenSelector);
		screenElt.style.width = `${w}px`;
		screenElt.style.height = `${h}px`;
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
		this.mainConsole.print(`${capitalizeFirst(commandWords[0])} Direction?`);
		this.inputCtrl.setState('direction', (directionCommand) => {
			if (directionCommand === 'abort') {
				this.switchToTravel();
				this.mainConsole.print('Cancel'); // TODO: print at end of line
				return;
			}
			const directedCommandWords = [...commandWords];
			directedCommandWords[directionIndex] = directionCommand;
			this.mainConsole.print(capitalizeFirst(directionCommand)); // TODO: print at end of line
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

	getMapFocusTopLeft() {
		const [centerX, centerY] = this.mapFocus;
		return [
			centerX - Math.floor(this.mapDisplaySizeX / 2),
			centerY - Math.floor(this.mapDisplaySizeY / 2),
		];
	}

	drawSprite(spriteName, x, y) {
		if (!spriteName) return;
		this.ss.drawImageToContext(
			spriteName,
			this.gameCanvas.ctx,
			x * this.ss.spriteSize,
			y * this.ss.spriteSize,
		);
	}

	drawSprites2d(sprites2dArray) {
		sprites2dArray.forEach((row, y) => {
			row.forEach((spriteName, x) => {
				this.drawSprite(spriteName, x, y);
			});
		});
	}

	drawSpritesArray(sprites = []) {
		sprites.forEach((spriteArray) => {
			const [spriteName, x, y] = spriteArray;
			this.drawSprite(spriteName, x, y);
		});
	}

	drawTerrain() {
		this.drawSprites2d(this.visibleWorld.terrain.sprites, 'terrain');
	}

	drawProps() {
		this.drawSprites2d(this.visibleWorld.props.sprites, 'terrain');
	}

	drawAvatar() {
		const { visibleWorldX, visibleWorldY, sprite } = this.party.avatar;
		this.drawSprite(sprite, visibleWorldX, visibleWorldY);
	}

	drawMap() {
		this.drawTerrain();
		this.drawProps();
		// TODO: draw items
		// TODO: draw borders
		// TODO: draw actors
		this.drawAvatar();
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
		const colNum = this.commandConsoles.length;
		const commandsPerCol = Math.ceil(commandLines.length / colNum);
		const col1 = commandLines.slice(0, commandsPerCol);
		const col2 = commandLines.slice(commandsPerCol);
		this.commandConsoles[0].printLines(col1);
		this.commandConsoles[1].printLines(col2);
	}

	static getPrintableNumber(n, maxSize = 4) {
		if (typeof n !== 'number') return ('?').repeat(maxSize);
		let nStr = String(n);
		if (nStr.length > maxSize) nStr = `${String(Math.floor(n / 1000))}k`;
		return nStr.padStart(maxSize, ' ');
	}

	drawAll() {
		this.drawMap();
		this.quickStatConsole.printLines([
			`H.P.:${Game.getPrintableNumber(this.party?.avatar?.health?.hp, 4)}`,
			`Coin:${Game.getPrintableNumber(this.party?.avatar?.currencies?.coins, 4)}`,
			`Food:${Game.getPrintableNumber(this.party?.avatar?.currencies?.food, 4)}`,
			`X.P.:${Game.getPrintableNumber(this.party?.avatar?.xp?.totalXp, 4)}`,
		]);
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
			this.mainConsole.print(messagesBackwards[i]);
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
		// await this.ss.load();
		// await this.fontsSpritesheet.load();
		await this.gameCanvas.setup();
		this.adjustScreenSize();

		// await this.textCtrl.setup();
		await this.mainConsole.setup(this.gameCanvas);
		await this.quickStatConsole.setup(this.gameCanvas);
		const setupPromises = this.commandConsoles.map((console) => {
			return console.setup(this.gameCanvas);
		});
		await Promise.allSettled(setupPromises);
		this.inputCtrl.setup();

		this.mainConsole.print('A flash of red...');
		// await wait(1000);
		// this.mainConsole.print('My name is Ozymandias, king of kings, look at my works,
		// Ye mighty, and despair. Nothing beside remains.');
		this.mainConsole.print('You have awoken in a strange world.');
		// testFontDraw(this.gameCanvas);

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
