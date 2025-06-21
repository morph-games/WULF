import GameImage from './GameImage.js';

const DEFAULT_COLORS = [[255, 255, 255], [0, 0, 0]];
const SCROLL_COLORS = [[238, 238, 204], [17, 17, 51]];
const BASE_X = 0;

export default class Spritesheet extends GameImage {
	constructor(srcOrOptions, atlas = {}, spriteSize = 16) {
		const isParam1Object = typeof srcOrOptions === 'object';
		const src = isParam1Object ? srcOrOptions?.src || srcOrOptions?.url : srcOrOptions;
		super(src);
		const a = (isParam1Object ? srcOrOptions?.atlas : atlas) || [];
		this.atlas = [...a];
		const size = (isParam1Object ? srcOrOptions?.size : spriteSize) || 16;
		this.spriteSize = size;
		this.sprites = {};
	}

	async load() {
		try {
			await super.load();
			// this.parse();
		} catch (err) {
			console.error(err);
			throw err;
		}
	}

	getCoordinates(spriteName) {
		// const groupAtlas = this.atlas[groupName];
		// if (!groupAtlas) throw new Error(`Group ${groupName} not found in atlas`);
		let yIndex = -1;
		let xIndex = -1;
		this.atlas.forEach((rowObj, i) => {
			// console.log('Looking in rowObj', rowObj);
			if (!rowObj.names) return; // throw new Error('Atlas row is missing names array');
			const xi = rowObj.names.findIndex((name) => spriteName === name);
			if (xi !== -1) {
				xIndex = xi;
				yIndex = i;
			}
		});
		if (xIndex === -1 || yIndex === -1) throw new Error(`Sprite ${spriteName} not found in atlas`);
		return [xIndex * this.spriteSize, yIndex * this.spriteSize];
	}

	drawImageToContext(spriteName, ctx, x, y) {
		const [sx, sy] = this.getCoordinates(spriteName);
		ctx.drawImage(
			this,
			// Source
			sx,
			sy,
			this.spriteSize,
			this.spriteSize,
			// Destination
			x,
			y,
			this.spriteSize,
			this.spriteSize,
		);
	}

	getSubImage(x, y, w = this.spriteSize, h = this.spriteSize, canvas = undefined, ctx = undefined) {
		if (!canvas || !ctx) {
			const duo = GameImage.getCanvasContext(w, h);
			canvas = duo[0]; // eslint-disable-line prefer-destructuring, no-param-reassign
			ctx = duo[1]; // eslint-disable-line prefer-destructuring, no-param-reassign
		}
		ctx.drawImage(this.sheet, x, y, w, h, 0, 0, w, h);
		const dataUri = canvas.toDataURL('image/png');
		return new GameImage(dataUri);
	}

	// TODO: If we want this it'll need to be rewritten to remove the group
	parse() {
		// const [sheetCanvas, sheetCtx] = this.sheet.getCanvasContext();
		const [canvas, ctx] = GameImage.getCanvasContext(this.spriteSize, this.spriteSize);
		let index = 0;
		Object.entries(this.atlas).forEach(([groupName, groupRows]) => {
			let groupIndex = 0;
			groupRows.forEach((row) => {
				const { y, names } = row;
				let x = BASE_X;
				names.forEach((name) => {
					const gameImage = this.getSubImage(x, y, this.spriteSize, this.spriteSize, canvas, ctx);
					[
						`sprite-${index}`,
						`${groupName}-${groupIndex}`,
						name,
					].forEach((alias) => {
						this.sprites[alias] = gameImage;
					});
					// Increment
					x += this.spriteSize;
					index += 1;
					groupIndex += 1;
				});
			});
		});
	}

	static makeColorId(id, colors = DEFAULT_COLORS) {
		const [light = [255, 255, 255], dark = [0, 0, 0]] = colors;
		return `${id}_${light.join(',')}_${dark.join(',')}`;
	}

	async loadColoredSprite(id, colors = DEFAULT_COLORS) {
		const sprite = this.makeColoredSprite(id, colors);
		await sprite.load();
		return sprite;
	}

	async loadColorSpriteDataUri(id, colors = DEFAULT_COLORS) {
		const sprite = await this.loadColoredSprite(id, colors);
		if (!sprite) return '';
		return sprite.getImageDataUri();
	}

	makeColoredSprite(id, colors = DEFAULT_COLORS) {
		const [light = [255, 255, 255], dark = [0, 0, 0]] = colors;
		const sprite = this.get(id);
		if (!sprite) throw new Error(`Unknown sprite ${id}`);
		const newSprite = sprite.cloneSync();
		// newSprite.replaceColor([17, 17, 51], [50, 50, 50]);
		// newSprite.replaceColor([238, 238, 204], light);
		newSprite.replaceColors(SCROLL_COLORS, [light, dark]);
		const fullId = Spritesheet.makeColorId(id, colors);
		this.sprites[fullId] = newSprite;
		return newSprite;
	}

	// This doesn't work right because there is no waiting
	makeColoredSpriteDataUri(id, colors = DEFAULT_COLORS) {
		const sprite = this.makeColoredSprite(id, colors);
		return sprite.getImageDataUri();
	}

	get(id, colors) {
		if (!colors) return this.sprites[id];
		const fullId = Spritesheet.makeColorId(id, colors);
		const sprite = this.sprites[fullId];
		if (sprite) return sprite;
		return this.makeColoredSprite(id, colors);
	}

	getDataUri(id, colors) {
		const gi = this.get(id, colors);
		if (!gi) return '';
		return gi.getImageDataUri();
	}
}
