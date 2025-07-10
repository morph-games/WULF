export default class WorldMap {
	constructor(mapData, globalLegend = {}, entityTypes = null) {
		if (!mapData || typeof mapData !== 'object') throw new Error('Missing mapData object');
		this.mapKey = mapData.mapKey;
		this.id = mapData.id;
		this.globalLegend = Object.freeze(structuredClone(globalLegend));
		this.entityTypes = entityTypes;
		this.base = Object.freeze(structuredClone(mapData));
		this.time = 0;
		this.exits = WorldMap.makeExits(this.base.exits);
		this.height = this.base.map.length;
		this.width = this.base.map.reduce((max, row) => Math.max(max, row.length), 0);
		this.maxX = this.width - 1;
		this.maxY = this.height - 1;
	}

	/** Make an array of world maps (alphabetized) */
	static makeMaps(objectOfManyMaps = {}, globalLegend = {}, entityTypes = null) {
		const maps = [];
		const manyMapKeys = Object.keys(objectOfManyMaps).sort();
		manyMapKeys.forEach((mapKey) => {
			const id = maps.length;
			const map = new WorldMap(
				{ ...objectOfManyMaps[mapKey], mapKey, id },
				globalLegend,
				entityTypes,
			);
			maps.push(map);
		});
		return maps;
	}

	static makeExits(baseExits = {}) {
		return {
			left: baseExits.left || baseExits.edges || 'BLOCK',
			right: baseExits.right || baseExits.edges || 'BLOCK',
			top: baseExits.top || baseExits.edges || 'BLOCK',
			bottom: baseExits.bottom || baseExits.edges || 'BLOCK',
			up: baseExits.up || 'BLOCK',
			down: baseExits.down || 'BLOCK',
		};
	}

	getEntities() {
		const mapId = this.id;
		const { map, legend } = this.getData();
		// Anything in the legend item's array with more than 1 string is an entity;
		// if only one, then it is terrain-only (not currently considered an entity)
		const entityCharacters = Object.keys(legend)
			.filter((letter) => legend[letter].length > 1);
		// Build a legend with only the entities
		const entityTypes = entityCharacters.reduce((obj, letter) => {
			const arrOfTypes = legend[letter].slice(1)
				.map((arrItem) => ((typeof arrItem === 'string') ? { type: arrItem } : arrItem));
			return {
				...obj,
				[letter]: arrOfTypes,
			};
		}, {});
		// Look through map and find all instances of the entity letters
		const ents = [];
		map.forEach((row, y) => {
			row.split('').forEach((letter, x) => {
				if (!entityCharacters.includes(letter)) return;
				entityTypes[letter].forEach((typeObj, legendIndex) => {
					ents.push({
						...structuredClone(typeObj),
						mapId,
						x,
						y,
						origin: {
							mapId,
							x,
							y,
							legendIndex,
						},
					});
				});
			});
		});
		return ents;
	}

	isOffEdge(x, y) {
		return (x < 0 || x > this.maxX || y < 0 || y > this.maxY);
	}

	getOffEdge(x, y) {
		if (x < 0) return 'left';
		if (x > this.maxX) return 'right';
		if (y < 0) return 'top';
		if (y > this.maxY) return 'bottom';
		return false;
	}

	getData() {
		const legend = { ...this.globalLegend, ...this.base.legend };
		return { ...this.base, legend };
		// TODO: Extend this with changes that have happened
	}

	getName() {
		return this.getData().name || this.mapKey;
	}

	getOverflowEntityType() {
		return this.getData()?.overflow || 'void';
	}

	getExit(exitKey) {
		return this.exits[exitKey] || 'BLOCK';
	}

	getLoopedCoordinates(x, y) {
		return [
			(x > 0) ? x % this.width : (((x % this.width) + this.width) % this.width),
			(y > 0) ? y % this.height : (((y % this.height) + this.height) % this.height),
		];
	}

	getCellData(x, y) {
		const { map, legend } = this.getData();
		if (x < 0 || y < 0 || map[y] === undefined || map[y][x] === undefined) {
			return null;
		}
		const mapCellKey = map[y][x];
		const cellDetails = legend[mapCellKey];
		if (!cellDetails) {
			console.warn('Missing', mapCellKey, 'at', x, y, map[y]);
			return null;
		}
		return cellDetails;
	}

	/** @deprecated */
	getTopProperty(propertyName, x, y) {
		const arr = this.getCellData(x, y);
		let item;
		for (let i = arr.length - 1; i >= 0; i -= 1) {
			item = arr[i];
			if (typeof item === 'object') {
				if (item[propertyName] !== undefined) return item[propertyName];
				// if (item.type && )
			}
			// TODO: if item is a string, then check the type
		}
		return null;
	}

	getTopEntityType(x, y) {
		const arr = this.getCellData(x, y);
		if (!arr) return null;
		if (arr.length === 0) return this.getOverflowEntityType();
		const last = arr[arr.length - 1];
		if (typeof last === 'string') return last;
		return last.entityTypeKey || last.entityType || last.type || this.getOverflowEntityType();
	}

	getTerrainTypeKey(x, y) {
		const blockDetails = this.getCellData(x, y);
		if (!blockDetails) return this.getOverflowEntityType();
		const [terrainTypeKey] = blockDetails;
		return terrainTypeKey;
	}

	getTerrainEntity(x, y) {
		// TODO: calculate this once and save it on this object
		const type = this.getTerrainTypeKey(x, y);
		const terrainEnt = this.entityTypes.getExtendedType({ type });
		// console.log(terrainEnt);
		return terrainEnt;
	}

	getEntranceCoordinates() {
		let [entranceX = 0, entranceY = 0] = this.getData().entrance || [];
		if (entranceX === 'center') entranceX = Math.floor(this.width / 2);
		else if (entranceX === 'left') entranceX = 0;
		else if (entranceX === 'right') entranceX = this.maxX;
		if (entranceY === 'bottom') entranceY = this.maxY;
		else if (entranceY === 'top') entranceY = 0;
		else if (entranceY === 'center') entranceY = Math.floor(this.height / 2);
		return [Math.round(entranceX), Math.round(entranceY)];
	}
}
