import TextController from './TextController.js';

export default class GameConsole {
	constructor(options = {}, fontsSpritesheet = null) {
		this.fontsSpritesheet = fontsSpritesheet;
		this.horizontal = options.horizontal || 'left'; // TODO: Doesn't do anything yet
		this.vertical = options.vertical || 'top';
		this.fontSize = options.fontSize || 8; // TODO: get this from options
		this.columns = options.columns || 'max';
		this.rows = options.rows || 4;
		this.inputLine = (typeof options.inputLine === 'undefined') ? true : Boolean(options.inputLine);
		this.textRows = this.rows - (this.inputLine ? 1 : 0);
		this.cursor = options.cursor || '>';
		this.gameCanvas = options.gameCanvas; // likely null at this point
		this.textCtrl = new TextController(fontsSpritesheet);
		this.log = [];
	}

	async setup(gameCanvas) {
		this.gameCanvas = gameCanvas;
		await this.textCtrl.setup();
		if (typeof this.columns !== 'number') {
			// If we have any non-number, then use max number of columns
			this.columns = Math.floor(this.gameCanvas.width / this.fontSize);
		}
	}

	getRowBase() {
		if (this.vertical === 'bottom') {
			const maxRows = Math.floor((this.gameCanvas?.height || 0) / this.fontSize);
			return maxRows - this.rows;
		}
		return 0;
	}

	getPrintableLines() {
		// Space in the front that will be used for a cursor indicator ">", or indentation
		const spacingLength = this.cursor.length;
		const space = (' ').repeat(spacingLength);
		const logLines = [];
		// Get last few log items, but they may have long text, so we have to break them up
		this.log.slice(-this.textRows)
			.forEach((text) => { // Loop over them
				// console.log(text, '-->', TextController.splitText(text, this.columns - spacingLength));
				TextController.splitText(text, this.columns - spacingLength) // Break into array
					.forEach((line, i) => {
						// Then add in spacing or cursor
						logLines.push(`${i === 0 ? this.cursor : space}${line}`);
					});
			});
		const lastLogLines = logLines.slice(-this.textRows);
		const tooFewLines = (lastLogLines.length < this.textRows);
		const fillerRowCount = (tooFewLines) ? this.textRows - lastLogLines.length : 0;
		const fillerRows = (' ').repeat(fillerRowCount).split('').map(() => ('.').repeat(this.columns));
		return [
			...fillerRows,
			...lastLogLines,
		];
	}

	printLine(text, index = 0) {
		const row = this.getRowBase() + index;
		const { ctx } = this.gameCanvas;
		const rightFillerCount = text.length < this.columns ? this.columns - text.length : 0;
		this.textCtrl.drawLine(ctx, text + (' ').repeat(rightFillerCount), 0, row);
	}

	printLines(linesArr) {
		const lines = linesArr || this.getPrintableLines();
		// console.log('Printable lines:', lines);
		lines.forEach((t, i) => this.printLine(t, i));
	}

	printCursor() {
		const cursorRow = this.getRowBase() + this.rows - 1;
		const { ctx } = this.gameCanvas;
		this.textCtrl.drawLine(ctx, this.cursor, 0, cursorRow);
	}

	print(text) {
		this.log.push(text);
		this.printLines();
		this.printCursor();
	}
}
