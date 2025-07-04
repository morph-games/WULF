import GameCanvas from './GameCanvas.js';
import Spritesheet from './Spritesheet.js';
import GameConsole from './GameConsole.js';

/*
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
*/

export default class GameScreen {
	constructor(options) {
		this.screenWidth = options.screen?.width || 320;
		this.screenHeight = options.screen?.height || 200;
		this.screenSelector = options.screen?.containerSelector || '#wulf-screen';
		this.mainCanvasId = options.screen?.mainCanvasId || 'wulf-main-canvas';
		this.gameCanvas = new GameCanvas(this.mainCanvasId, [this.screenWidth, this.screenHeight]);
		this.ss = new Spritesheet(options?.spritesheets?.main);
		this.fontsSpritesheet = new Spritesheet(options?.spritesheets?.fonts);
		// this.textCtrl = new TextController(this.fontsSpritesheet);
		this.mainConsole = new GameConsole(options?.mainConsole, this.fontsSpritesheet);
		this.quickStatConsole = new GameConsole(options?.quickStatConsole, this.fontsSpritesheet);
		this.commandConsoles = options.commandConsoles.map((commandConsoleOptions) => {
			return new GameConsole(commandConsoleOptions, this.fontsSpritesheet);
		});
	}

	static getPrintableNumber(n, maxSize = 4) {
		if (typeof n !== 'number') return ('?').repeat(maxSize);
		let nStr = String(n);
		if (nStr.length > maxSize) nStr = `${String(Math.floor(n / 1000))}k`;
		return nStr.padStart(maxSize, ' ');
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

	drawTerrain(visibleWorld) {
		this.drawSprites2d(visibleWorld.terrain.sprites, 'terrain');
	}

	drawProps(visibleWorld) {
		this.drawSprites2d(visibleWorld.props.sprites, 'terrain');
	}

	drawParty(party) {
		const { visibleWorldX, visibleWorldY, sprite } = party.avatar;
		this.drawSprite(sprite, visibleWorldX, visibleWorldY);
	}

	drawMap(visibleWorld, party) {
		this.drawTerrain(visibleWorld);
		this.drawProps(visibleWorld);
		// TODO: draw items
		// TODO: draw borders
		// TODO: draw actors
		this.drawParty(party);
	}

	drawAll(visibleWorld, party) {
		this.drawMap(visibleWorld, party);
		this.quickStatConsole.printLines([
			`H.P.:${GameScreen.getPrintableNumber(party?.avatar?.health?.hp, 4)}`,
			`Coin:${GameScreen.getPrintableNumber(party?.avatar?.currencies?.coins, 4)}`,
			`Food:${GameScreen.getPrintableNumber(party?.avatar?.currencies?.food, 4)}`,
			`X.P.:${GameScreen.getPrintableNumber(party?.avatar?.xp?.totalXp, 4)}`,
		]);
	}

	drawCommandColumns(commandLines = []) {
		const colNum = this.commandConsoles.length;
		const commandsPerCol = Math.ceil(commandLines.length / colNum);
		const col1 = commandLines.slice(0, commandsPerCol);
		const col2 = commandLines.slice(commandsPerCol);
		this.commandConsoles[0].printLines(col1);
		this.commandConsoles[1].printLines(col2);
	}

	async setup() {
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

		// testFontDraw(this.gameCanvas);
		window.addEventListener('resize', () => this.adjustScreenSize());
	}
}
