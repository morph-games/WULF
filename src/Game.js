import TextController from './TextController.js';
import GameCanvas from './GameCanvas.js';
import GameConsole from './GameConsole.js';
import GameStorage from './GameStorage.js';
import World from './World.js';
import SpriteSheet from './Spritesheet.js';
import InputController from './InputController.js';
import WorldCommunicator from './WorldCommunicator.js';
// import WorldChunk from './WorldChunk.js';

const wait = (ms) => (new Promise((resolve) => { window.setTimeout(resolve, ms); })); // eslint-disable-line

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
		this.world = new World(options.world || {});
		this.worldComm = new WorldCommunicator(options.world || {});
		this.ss = new SpriteSheet(options?.spritesheets?.main);
		this.fontsSpritesheet = new SpriteSheet(options?.spritesheets?.fonts);
		this.textCtrl = new TextController(this.fontsSpritesheet);
		this.mainConsole = new GameConsole(options.mainConsole, this.fontsSpritesheet);
		this.mapFocus = [0, 0];
		this.mapDisplaySizeX = 20;
		this.mapDisplaySizeY = 10;
		this.visibleWorld = {};
		this.party = {};
		this.avatarWhoId = null;
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
		if (outcome.message) this.mainConsole.print(outcome.message);
		this.handleIncomingData({ visibleWorld, party });
		return outcome;
	}

	refocus() {
		this.mapFocus[0] = this.party?.avatar.visibleWorldX || 0;
		this.mapFocus[1] = this.party?.avatar.visibleWorldY || 0;
	}

	async executeCommand(commandString) {
		console.log('Command:', commandString);
		const aliases = {
			vol: 'volume',
		};
		const clientOnlyCommands = {
			volume: (direction) => {
				console.log('volume', direction);
				// TODO: do volume controls
			},
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

	handleIncomingData(data) {
		const { visibleWorld, party } = data;
		this.visibleWorld = Object.freeze(structuredClone(visibleWorld));
		this.party = Object.freeze(structuredClone(party));
		// Handle the outcome
		// if (outcome.message) print(outcome.message);
		// Refocus the map on the avatar, and re-draw
		this.refocus();
		this.drawMap();
	}

	async setup() {
		await Game.waitForDom();
		// await this.ss.load();
		// await this.fontsSpritesheet.load();
		await this.gameCanvas.setup();
		this.adjustScreenSize();

		// await this.textCtrl.setup();
		await this.mainConsole.setup(this.gameCanvas);
		// await this.world.setup();

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

		this.inputCtrl.on('command', (command) => this.executeCommand(command));
		this.inputCtrl.on('missingCommand', (...args) => console.warn('Missing command', args));
		this.inputCtrl.setState('travel');
	}

	async start() {
		await this.setup();
		console.log('%c☥', 'font-size: 300%; color: #ff0;');
	}
}
