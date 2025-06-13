import { SCREEN_WIDTH, SCREEN_HEIGHT } from './constants.js';
import overworld from './maps/overworld.js';
import Game from './Game.js';

const game = new Game({
	spritesheets: {
		main: {
			url: './images/wulf-spritesheet-2.png',
			size: 16,
			atlas: {
				terrain: [
					{ names: [
						'grass-0', 'grass-1', 'grass-2', 'grass-3',
						'forest-0', 'forest-1', 'forest-2', 'forest-3',
						'mountain-0', 'mountain-1', 'mountain-2', 'mountain-3',
						'mountain-door',
					] },
					{ names: [
						'water-0',
					] },
					{ names: [
						'water-1',
					] },
				],
				/*
				toons: [
					{
						y:
					}
				]
				*/
			},
		},
		fonts: {
			url: './images/letters-spritesheet-5.png',
			size: 8,
			atlas: {
				letters: [
					{
						y: 0,
						names: [
							'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p',
							'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
							'th', 'ee', 'ng', 'ea', 'st', ' ',
							'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
							'-', '=', ';', ',', '.', '\'', '/',
						],
					},
					{
						y: 8,
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
						y: 16,
						names: [
							'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
							'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
							'TH', 'EE', 'NG', 'ES', 'ST', ' ',
						],
					},
				],
			},
		},
	},
	screen: {
		containerSelector: '#screen',
		mainCanvasId: 'main-canvas',
		height: SCREEN_HEIGHT,
		width: SCREEN_WIDTH,
	},
	mainConsole: {
		horizontal: 'left',
		vertical: 'bottom',
		rows: 4,
		columns: (SCREEN_WIDTH / 8) - 10, // 'max',
	},
	world: {
		terrain: {
			grass: {
				sprite: 'grass',
				variations: 4,
				// alts: ['0', '1'],
			},
			water: {
				sprite: 'water',
				variations: 2,
				// variations: ,
				// alts: ['0', '1'],
			},
			forest: {
				sprite: 'forest',
				variations: 4,
			},
			mountain: {
				sprite: 'mountain',
				// variations: 0,
			},
		},
		maps: {
			overworld,
		},
	},
});
game.start();
