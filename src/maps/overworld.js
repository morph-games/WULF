/* eslint-disable quote-props */
export default {
	map: [
		'w.......fw.....w',
		'..###...ffffff.w',
		'..#.#.....fffff.',
		'..#.#......ffff.',
		'..#.#.....fffff.',
		'#######.....ff..',
		'...#........ff..',
		'...#.........f..',
		'...#.....w......',
		'.........ww.....',
		'.###.###.wwwwwww',
		':#.....#..#wwwww',
		'.#..f..#..#wwwww',
		'.#.....#..#wwwww',
		'.#######..#####.',
		'.....w......w...',
	],
	legend: {
		'.': ['T', 'grass'],
		'w': ['T', 'water'],
		'#': ['T', 'mountain'],
		'f': ['T', 'forest'],

		// '@': ['V', 'dude', '.'],
		// ':': ['T', 'dirt', 1],
		// 'v': ['T', 'grass', 1],
		// 'U': ['T', 'doorway', 1],
		// '#': ['T', 'wall', 0],
		// 'd': ['A', 'dog', '.'],
		// 's': ['P', 'sign', '.'],
		// 'k': ['I', 'key', '.']
	},
	overflow: 'water',
};
