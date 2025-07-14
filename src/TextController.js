export default class TextController {
	constructor(fontsSpritesheet, options = {}) {
		this.fss = fontsSpritesheet;
		this.cursorRow = 0;
		this.cursorCol = 0;
		this.offsetX = options.offsetX || 0;
		this.offsetY = options.offsetY || 0;
		if (!fontsSpritesheet) throw new Error('Missing fonts spritesheet');
	}

	static splitText(text, maxLength) {
		if (text.length <= maxLength) return [text];
		const words = text.split(' ');
		const lines = [];
		let line = '';
		words.forEach((word) => {
			if (word.length > maxLength) {
				console.warn('Word exceeds max length', word, maxLength);
			}
			const newLine = !line ? word : `${line} ${word}`;
			if (newLine.length > maxLength) {
				lines.push(line);
				line = word;
			} else {
				line = newLine;
			}
		});
		lines.push(line);
		// console.log(text, '-->', lines);
		return lines;
	}

	async setup() {
		await this.fss.load();
	}

	setCursor(column, row) {
		if (typeof column === 'number') this.cursorCol = column;
		if (typeof row === 'number') this.cursorRow = row;
	}

	drawLetter(ctx, letter) {
		try {
			this.fss.drawImageToContext(
				letter,
				ctx,
				(this.cursorCol * this.fss.spriteSize) + this.offsetX,
				(this.cursorRow * this.fss.spriteSize) + this.offsetY,
			);
		} catch (err) {
			// If we don't find the letter, then just skip it
			console.warn('Error drawing letter', letter, err);
		}
		this.cursorCol += 1;
	}

	drawTextRows(ctx, textRows = [], column = undefined, row = undefined) {
		this.setCursor(column, row);
		const colStart = this.cursorCol;
		textRows.forEach((text) => {
			text.split('').forEach((letter) => {
				this.drawLetter(ctx, letter);
			});
			this.cursorRow += 1;
			this.cursorCol = colStart;
		});
	}

	drawText(ctx, text = '', column = undefined, row = undefined) {
		this.setCursor(column, row);
		if (text instanceof Array) {
			this.drawTextRows(ctx, text, column, row);
			return;
		}
		text.split('').forEach((letter) => {
			this.drawLetter(ctx, letter);
		});
	}

	lineBreak() {
		this.cursorCol = 0;
		this.cursorRow += 1;
	}

	drawLine(ctx, lineOfText = '', column = undefined, row = undefined) {
		this.drawText(ctx, lineOfText, column, row);
		this.lineBreak();
	}
}
