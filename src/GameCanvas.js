export default class GameCanvas {
	constructor(elementId, width = 320, height = 200) {
		this.elementId = elementId;
		this.canvas = document.getElementById(elementId);
		this.ctx = this.canvas?.getContext('2d');
		this.width = Number(width) || 320;
		this.height = Number(height) || 200;
	}

	setup() {
		this.canvas = document.getElementById(this.elementId);
		this.ctx = this.canvas.getContext('2d');
	}

	removePixelTransparency(threshhold = 200) {
		const { ctx } = this;
		ctx.imageSmoothingEnabled = false;
		const imageData = ctx.getImageData(0, 0, this.width, this.height);
		// Loop through each pixel
		for (let i = 0; i < imageData.data.length; i += 4) {
			const alpha = imageData.data[i + 3];
			// Make opaque if it is above threshhold, otherwise transparent
			imageData.data[i + 3] = (alpha > threshhold) ? 255 : 0;
		}
		ctx.putImageData(imageData, 0, 0);
	}
}
