import SpriteSheet from './SpriteSheet.js';

const row1 = 0;

const ATLAS = {
	letters: [
		{
			y: row1,
			names: [
				'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p',
				'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
				'th', 'ee', 'ng', 'ea', 'st', ' ',
				'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
				'-', '=', ';', ',', '.', '\'', '/',
			],
		},
		{
			y: row1 + 8,
			names: [
				'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
				'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
				'TH', 'EE', 'NG', 'ES', 'ST', ' ',
				'ankh', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')',
				'_', '+', ':', '<', '>', '"', '?',
			],
		},
	],
	runes: [
		{
			y: row1 + 8 + 8,
			names: [
				'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
				'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
				'TH', 'EE', 'NG', 'ES', 'ST', ' ',
			],
		},
	],
};

export default class FontsSpriteSheet extends SpriteSheet {
	constructor() {
		super('./images/letters-spritesheet-5.png', ATLAS, 8);
	}
}
