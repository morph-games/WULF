export default {
	main: {
		url: './images/wulf-spritesheet-12.png',
		size: 16,
		atlas: [
			{ names: [
				'grass-0', 'grass-1', 'grass-2', 'grass-3',
				'forest-0', 'forest-1', 'forest-2', 'forest-3',
				'mountain-0', 'mountain-1', 'mountain-2', 'mountain-3',
				'mountain-door', 'circle', 'village', 'town', 'city',
				'', 'faded-place', 'place',
			] },
			{ names: [
				'water-0', 'void', '', '', '', '', '', '', 'water-1', '', '', '', '', '', '', '',
				'ladder-down', 'ladder-up', 'magic-ladder-down', 'magic-ladder-up',
			] },
			{ names: [
				'dirt', 'floor-0', 'floor-1', 'floor-2', 'floor-3', 'floor-4', 'floor-5', 'floor-6',
				'wheat-0', 'tree-0', '', '', '', '', '', '',
				'pillar-0', 'torch-0', 'torch-1', 'torch-2',
			] },
			{ names: [ // props and transportation
				'stone-wall-0', 'stone-wall-1', 'stone-door-open', 'stone-window',
				'stone-sign-left', 'stone-sign-right',
				'dark-stone-0', 'dark-stone-1',
				'dark-stone-to-stone', 'stone-to-dark-stone',
				'green-stone', 'wood-wall-0',
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
				'', '',
			] }, // Letters 3
			{ names: [ // props and transportation
				'horse', 'horseback', 'empty-sailboat', 'sailboat', 'empty-galleon', 'galleon',
				'empty-carpet', 'flying-carpet', 'empty-broom', 'flying-broom',
				'dead-skull', 'hit-splash', 'target-circle',
			] },
			{
				names: [
					'spearman-0', 'spearman-1', 'spearman-2', 'spearman-3',
					'beastman-0', '', '', '',
					'king-0', '', '', '',
					'man-0', '', '', '',
					'woman-0', '', '', '',
				],
			},
			{ names: [
				'orc-0', 'orc-1', 'orc-2', 'orc-3',
				'wildman-0', '', '', '',
				'mage-0', '', '', '',
				'blacksmith-0', '', '', '',
				'wench-0', '', '', '',
			] },
			{ names: [
				'dwarf-0', '', '', '',
				'', '', '', '',
				'jester-0', '', '', '',
				'merchant-0', '', '', '',
				'shopkeeper-0', '', '', '',
			] },
			{ names: [
				'elf-0',
			] },
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
