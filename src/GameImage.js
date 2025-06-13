// Originally copied from https://github.com/morph-games/ruins-and-rangers-1
// which is a slimmed-down copy of https://github.com/rocket-boots/Spritesheet/blob/master/src/GameImage.js

export default class GameImage extends Image {
	constructor(src) {
		super();
		if (!src) throw new Error('GameImage missing src param');
		this.src = src;
		this.data = null;
		this.isLoaded = false;
	}

	async load() {
		const loadPromise = new Promise((resolve, reject) => {
			try {
				const handleLoad = () => resolve(this);
				super.onload = handleLoad;
				super.onerror = (event) => {
					console.error(this.src, event);
					reject(new Error(`GameImage failed to load ${this.src}`));
				};
				if (this.complete) handleLoad();
			} catch (err) {
				reject(err);
			}
		});
		try {
			await loadPromise;
			this.isLoaded = true;
			this.setup();
		} catch (err) {
			this.isLoaded = false;
			throw err;
		}
		return this;
	}

	setup() {
		this.data = this.getImageData(); // ctx param?
		// this.flippedHorizontal = this.getFlippedImage(-1, 1);
		// this.flippedVertical = this.getFlippedImage(1, -1);
	}

	async clone() {
		const sprite = new GameImage(this.src);
		await sprite.load();
		return sprite;
	}

	cloneSync() {
		const sprite = new GameImage(this.src);
		sprite.load();
		return sprite;
	}

	static getCanvasContext(width, height, image) {
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext('2d');
		if (image) ctx.drawImage(image, 0, 0);
		return [canvas, ctx];
	}

	getCanvasContext(options = {}) {
		const { draw = true } = options;
		return GameImage.getCanvasContext(
			this.naturalWidth || this.width,
			this.naturalHeight || this.height,
			(draw) ? this : null,
		);
	}

	getImageData(ctxParam) {
		const ctx = ctxParam || this.getCanvasContext({ draw: true })[1];
		return ctx.getImageData(0, 0, this.width, this.height);
	}

	getImageDataUri() {
		const [canvas] = this.getCanvasContext({ draw: true });
		return canvas.toDataURL('image/png');
	}

	setSourceByCanvas(canvas) {
		this.src = canvas.toDataURL('image/png');
	}

	replaceColors(oldColors = [], newColors = []) {
		// Based on http://jsfiddle.net/m1erickson/4apAS/
		const [canvas, ctx] = this.getCanvasContext({ draw: true });
		const imageData = this.getImageData(ctx);
		for (let i = 0; i < imageData.data.length; i += 4) {
			oldColors.forEach((oldColor, colorIndex) => {
				const [oldRed, oldGreen, oldBlue] = oldColor;
				const [newRed, newGreen, newBlue] = newColors[colorIndex];
				if (
					imageData.data[i] === oldRed
					&& imageData.data[i + 1] === oldGreen
					&& imageData.data[i + 2] === oldBlue
				) {
					imageData.data[i] = newRed;
					imageData.data[i + 1] = newGreen;
					imageData.data[i + 2] = newBlue;
					// count += 1;
				}
			});
		}
		// TODO: can set by data directly?
		ctx.putImageData(imageData, 0, 0);
		this.setSourceByCanvas(canvas);
	}

	replaceColor(oldColor = [], newColor = []) {
		// Based on http://jsfiddle.net/m1erickson/4apAS/
		const [canvas, ctx] = this.getCanvasContext({ draw: true });
		const [oldRed, oldGreen, oldBlue] = oldColor;
		const [newRed, newGreen, newBlue] = newColor;
		let count = 0;
		const imageData = this.getImageData(ctx);
		for (let i = 0; i < imageData.data.length; i += 4) {
			// is this pixel the old rgb?
			if (
				imageData.data[i] === oldRed
				&& imageData.data[i + 1] === oldGreen
				&& imageData.data[i + 2] === oldBlue
			) {
				imageData.data[i] = newRed;
				imageData.data[i + 1] = newGreen;
				imageData.data[i + 2] = newBlue;
				count += 1;
			}
		}
		// TODO: can set by data directly?
		ctx.putImageData(imageData, 0, 0);
		this.setSourceByCanvas(canvas);
		return count;
	}
}
