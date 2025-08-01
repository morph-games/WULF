/* eslint-disable quote-props */
export default {
	name: 'Dungeon',
	mapType: 'dungeon',
	map: [
		'#####################',
		'#####################',
		'##~~~-----------~~~##',
		'##~~~-|--###--|-~~~##',
		'#########.-##########',
		'#:.....:-.--:::...:.#',
		'#:......--:-......::#',
		'###U####-.--####U####',
		'#------#-.--#--W---##',
		'#------#.---#------##',
		'#---W--#-.--####U####',
		'#------U--.--------%#',
		'#-----...:.:::..---.#',
		'####U###-.--######U.#',
		'#------#.---#----#-.#',
		'#------#.---#----#-.#',
		'#-B----#.---#-B--U-.#',
		'#----O-#.---######-.#',
		'########--.-#----#..#',
		'#------U--.-#----U..#',
		'#------#--.-#----#..#',
		'#-####-#--.-######U##',
		'##-O----#--.#-B::::##',
		'##------#--.#------##',
		'#####U###---######U##',
		'##------#---#--B---##',
		'##------#---#------##',
		'#######%#UUU#%#######',
		'#~.W..:::::::::.....#',
		'#~~~..:.~~.~~.:.....#',
		'#..~*.:.~~.~~.:.*...#',
		'##-~.::.......::---##',
		'###:#.:::---:::.#W###',
		'##########.##########',
	],
	legend: {
		'.': ['floor3'],
		'-': ['floor5'],
		'U': ['door'],
		'%': ['window'],
		'F': ['forest'],
		'S': ['floor', 'sentry'],
		'G': ['floor', 'guard'],
		'K': ['floor', 'king'],
		'M': ['floor', 'man'],
		'W': ['floor', 'wildman'],
		'(': ['signLeft'],
		')': ['signRight'],
		'>': ['floor', 'ladderDown'],
		'E': ['floor', 'elf'],
		'D': ['floor', 'dwarf'],
		'#': ['darkWall'],
	},
	overflow: 'void',
	entrance: ['center', 'bottom'],
	exits: {
		edges: ['overworld', 16, 6],
	},
};
