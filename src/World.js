export default class World {
	constructor(data = {}) {
		this.terrain = data?.terrain || {};
		this.maps = data?.maps || {};
	}

	setup() {
		// Do something?
	}

	getTerrainSpriteName(terrainKey) {
		const { sprite, variations } = this.terrain[terrainKey];
		const n = (!variations) ? '0' : Math.floor(Math.random() * variations);
		const s = `${sprite}-${n}`;
		// console.log(type, key, s);
		return s;
	}

	getTerrainSpriteAt(x, y) {
		const mapName = 'overworld';
		const { map, legend, overflow = 'water' } = this.maps[mapName];
		if (x < 0 || y < 0) {
			return this.getTerrainSpriteName(overflow);
		}
		const mapKey = map[y][x];
		const blockDetails = legend[mapKey];
		if (!blockDetails) {
			// console.warn('Missing', mapKey, 'at', x, y);
			return this.getTerrainSpriteName(overflow);
		}
		const [type, terrainKey] = blockDetails;
		const s = this.getTerrainSpriteName(terrainKey);
		console.log(type, terrainKey, s);
		return s;
	}

	getTerrainSprites(startX = 0, startY = 0, w = 10, h = 10) {
		const terrainSprites = [];
		for (let y = 0; y < h; y += 1) {
			if (!terrainSprites[y]) terrainSprites[y] = [];
			for (let x = 0; x < w; x += 1) {
				terrainSprites[y][x] = this.getTerrainSpriteAt(startX + x, startY + y);
			}
		}
		return terrainSprites;
	}
}
