export default {
	main: {
		url: './images/wulf-spritesheet-8.png',
		size: 16,
		atlas: [
			{ names: [
				'grass-0', 'grass-1', 'grass-2', 'grass-3',
				'forest-0', 'forest-1', 'forest-2', 'forest-3',
				'mountain-0', 'mountain-1', 'mountain-2', 'mountain-3',
				'mountain-door', 'circle', 'village', 'town', 'city',
			] },
			{ names: [
				'water-0', 'void', '', '', '', '', '', '', 'water-1', '', '', '', '', '', '', '',
				'stone-wall-0', 'stone-wall-1', 'stone-door-open', 'stone-window',
			] },
			{ names: [
				'dirt', 'floor-0', 'floor-1', 'floor-2', 'floor-3', 'floor-4', 'floor-5', 'floor-6',
			] },
			{ names: [ // props and transportation
				'ladder-down', 'ladder-up', 'magic-ladder-down', 'magic-ladder-up',
				'horseback', 'flying-carpet', 'sailboat', 'galleon', 'flying-broom',
			] },
			{ names: [
				'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
				'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
			] }, // Letters 1
			{ names: [
				'U', 'V', 'W', 'X', 'Y', 'Z',
				'rune-A', 'rune-B', 'rune-C', 'rune-D', 'rune-E', 'rune-F', 'rune-G',
				'rune-H', 'rune-I', 'rune-J', 'rune-K', 'rune-L', 'rune-M', 'rune-N',
			] }, // Letters 2
			{ names: [
				'rune-O', 'rune-P', 'rune-Q', 'rune-R', 'rune-S', 'rune-T', 'rune-U',
				'rune-V', 'rune-W', 'rune-X', 'rune-Y', 'rune-Z',
				'rune-TH', 'rune-EE', 'rune-NG', 'rune-EA', 'rune-ST', 'rune-space',
				'stone-sign-left', 'stone-sign-right',
			] }, // Letters 3
			{
				names: [
					'spearman-0', 'spearman-1', 'spearman-2', 'spearman-3',
					'beastman-0', '', '', '',
					'king-0',
				],
			},
		],
	},
	fonts: {
		url: './images/letters-spritesheet-5.png',
		size: 8,
		atlas: [
			{
				names: [
					'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p',
					'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
					'th', 'ee', 'ng', 'ea', 'st', ' ',
					'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
					'-', '=', ';', ',', '.', '\'', '/',
				],
			},
			{
				names: [
					'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
					'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
					'TH', 'EE', 'NG', 'EA', 'ST', ' ',
					'ankh', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')',
					'_', '+', ':', '<', '>', '"', '?',
				],
			},
			{
				names: [
					'rune-A', 'rune-B', 'rune-C', 'rune-D', 'rune-E', 'rune-F', 'rune-G',
					'rune-H', 'rune-I', 'rune-J', 'rune-K', 'rune-L', 'rune-M', 'rune-N',
					'rune-O', 'rune-P',	'rune-Q', 'rune-R', 'rune-S', 'rune-T', 'rune-U',
					'rune-V', 'rune-W', 'rune-X', 'rune-Y', 'rune-Z',
					'Trune-H', 'Erune-E', 'Nrune-G', 'Erune-S', 'Srune-T', 'rune-space',
				],
			},
		],
	},
};
