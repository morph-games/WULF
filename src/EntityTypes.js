export default class EntityTypes {
	constructor(entityTypesConfig) {
		// this.entityTypesConfig = entityTypesConfig || {};
		this.allTypes = {};
		this.allTypesArray = [];
		this.buildAllTypes(entityTypesConfig);
	}

	static getExtendedType(obj = {}, allTypes = {}) {
		let extendedObj = obj;
		if (obj.type) {
			if (allTypes[obj.type]) {
				extendedObj = {
					...EntityTypes.getExtendedType(allTypes[obj.type], allTypes),
					...extendedObj,
				};
			} else {
				console.error('Could not find type', obj.type);
			}
		}
		return structuredClone(extendedObj);
	}

	getExtendedType(obj = {}) {
		return EntityTypes.getExtendedType(obj, this.allTypes);
	}

	buildAllTypes(entityTypesConfig) {
		this.allTypes = {};
		this.allTypesArray = [];
		const typeKeys = Object.keys(entityTypesConfig).sort();
		typeKeys.forEach((typeKey) => {
			const typeObj = entityTypesConfig[typeKey];
			if (this.allTypesArray[typeKey]) {
				console.error('Type', typeKey, 'already exists and will be skipped.');
				return;
			}
			this.allTypes[typeKey] = typeObj;
			this.allTypesArray.push(typeObj);
			if (typeObj.typeKey && typeObj.typeKey !== typeKey) {
				console.warn('Existing typeKey does not match', typeKey, 'and will be overwritten');
			}
			typeObj.entTypeId = this.allTypesArray.length - 1;
			typeObj.typeKey = typeKey;
		});
		this.allTypesArray.forEach((typeObj) => {
			const extendedTypeObj = EntityTypes.getExtendedType(typeObj, this.allTypes);
			this.allTypes[extendedTypeObj.typeKey] = extendedTypeObj;
			this.allTypesArray[extendedTypeObj.entTypeId] = extendedTypeObj;
		});
		this.allTypesArray.forEach((typeObj) => {
			if (!typeObj.name) typeObj.name = typeObj.typeKey; // eslint-disable-line no-param-reassign
		});
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

	getEntitySpriteName(entKey) {
		const terrObj = this.get(entKey);
		if (!terrObj) return '';
		const { sprite, variations } = terrObj;
		if (!variations) return sprite;
		const n = Math.floor(Math.random() * variations);
		const s = `${sprite}-${n}`;
		// console.log(type, key, s);
		return s;
	}
}
