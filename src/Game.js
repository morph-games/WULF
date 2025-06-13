import TextController from './TextController.js';
import GameCanvas from './GameCanvas.js';
import GameConsole from './GameConsole.js';
import GameStorage from './GameStorage.js';
import World from './World.js';
import SpriteSheet from './Spritesheet.js';
// import WorldChunk from './WorldChunk.js';

const wait = (ms) => (new Promise((resolve) => { window.setTimeout(resolve, ms); }));

function testFontDraw(gCanvas) {
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
		this.screenWidth = options.screen?.width || 320;
		this.screenHeight = options.screen?.height || 200;
		this.screenSelector = options.screen?.containerSelector || '#wulf-screen';
		this.mainCanvasId = options.screen?.mainCanvasId || 'wulf-main-canvas';
		this.gameCanvas = new GameCanvas(this.mainCanvasId, [this.screenWidth, this.screenHeight]);
		this.gameStorage = new GameStorage(options.gameName || 'WULF');
		this.world = new World(options.world || {});
		this.ss = new SpriteSheet(options?.spritesheets?.main);
		this.fontsSpritesheet = new SpriteSheet(options?.spritesheets?.fonts);
		this.textCtrl = new TextController(this.fontsSpritesheet);
		this.mainConsole = new GameConsole(options.mainConsole, this.fontsSpritesheet);
		this.mapFocus = [0, 0];
		this.mapDisplaySizeX = 20;
		this.mapDisplaySizeY = 10;
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
		this.world.load();
	}

	drawTerrain() {
		const [centerX, centerY] = this.mapFocus;
		const terrainSprites = this.world.getTerrainSprites(
			centerX - Math.floor(this.mapDisplaySizeX / 2),
			centerY - Math.floor(this.mapDisplaySizeY / 2),
			this.mapDisplaySizeX,
			this.mapDisplaySizeY,
		);
		terrainSprites.forEach((row, y) => {
			row.forEach((spriteName, x) => {
				this.ss.drawImageToContext(
					this.gameCanvas.ctx,
					x * this.ss.spriteSize,
					y * this.ss.spriteSize,
					'terrain',
					spriteName,
				);
			});
		});
	}

	drawMap() {
		this.drawTerrain();
		// TODO: draw props / cities
		// TODO: draw items
		// TODO: draw borders
		// TODO: draw actors
	}

	async setup() {
		await Game.waitForDom();
		// await this.ss.load();
		// await this.fontsSpritesheet.load();
		await this.gameCanvas.setup();
		this.adjustScreenSize();

		// await this.textCtrl.setup();
		await this.mainConsole.setup(this.gameCanvas);
		await this.world.setup();

		this.mainConsole.print('A flash of red...');
		// await wait(1000);
		// this.mainConsole.print('My name is Ozymandias, king of kings, look at my works,
		// Ye mighty, and despair. Nothing beside remains.');
		this.mainConsole.print('You have awoken in a strange world.');
		// testFontDraw(this.gameCanvas);

		this.drawMap();

		window.addEventListener('keydown', (e) => {
			if (e.key === 'ArrowUp' || e.key === 'w') {
				this.mapFocus[1] -= 1;
			} else if (e.key === 'ArrowDown' || e.key === 's') {
				this.mapFocus[1] += 1;
			} else if (e.key === 'ArrowLeft' || e.key === 'a') {
				this.mapFocus[0] -= 1;
			} else if (e.key === 'ArrowRight' || e.key === 'd') {
				this.mapFocus[0] += 1;
			}
			this.drawMap();
		});
	}

	async start() {
		await this.setup();
		console.log('%c☥', 'font-size: 300%; color: #ff0;');
	}
}
