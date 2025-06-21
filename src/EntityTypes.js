export default class EntityTypes {
	constructor(terrainTypes, propTypes, itemTypes, actorTypes) {
		this.terrainTypes = terrainTypes || {};
		this.propTypes = propTypes || {};
		this.itemTypes = itemTypes || {};
		this.actorTypes = actorTypes || {};
		this.allTypes = {};
		this.allTypesArray = [];
		this.buildAllTypes();
	}

	buildAllTypes() {
		this.allTypes = {};
		this.allTypesArray = [];
		const addTypes = (types, coreType, isCoreKey) => {
			const typeKeys = Object.keys(types).sort();
			typeKeys.forEach((typeKey) => {
				const typeObj = types[typeKey];
				if (this.allTypesArray[typeKey]) {
					console.error('Type', typeKey, 'already exists and will be skipped.');
					return;
				}
				this.allTypes[typeKey] = typeObj;
				this.allTypesArray.push(typeObj);
				if (typeObj.typeKey && typeObj.typeKey !== typeKey) {
					console.warn('Existing typeKey does not match', typeKey, 'and will be overwritten');
				}
				typeObj.id = this.allTypesArray.length - 1;
				typeObj.typeKey = typeKey;
				typeObj.coreType = coreType;
				typeObj[isCoreKey] = true;
			});
		};
		addTypes(this.terrainTypes, 'terrain', 'isTerrain');
		addTypes(this.propTypes, 'prop', 'isProp');
		addTypes(this.itemTypes, 'item', 'isItem');
		addTypes(this.actorTypes, 'actor', 'isActor');
	}

	get(typeKey) {
		// if (!this.allTypes[typeKey]) console.warn('Could not find entity type', typeKey);
		return this.allTypes[typeKey];
	}

	getTerrainSpriteName(terrainKey) {
		const terrObj = this.get(terrainKey);
		if (!terrObj) {
			console.error('Unknown terrain key', terrainKey);
			return '';
		}
		const { sprite, variations } = terrObj;
		if (!variations) return sprite;
		const n = (!variations) ? '0' : Math.floor(Math.random() * variations);
		const s = `${sprite}-${n}`;
		// console.log(type, key, s);
		return s;
	}

	getPropSpriteName(propKey) {
		const terrObj = this.get(propKey);
		if (!terrObj) return '';
		const { sprite, variations } = terrObj;
		if (!variations) return sprite;
		const n = Math.floor(Math.random() * variations);
		const s = `${sprite}-${n}`;
		// console.log(type, key, s);
		return s;
	}
}
