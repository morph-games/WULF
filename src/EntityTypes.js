import { capitalizeFirst } from './utilities.js';

export default class EntityTypes {
	constructor(entityTypesConfig) {
		// this.entityTypesConfig = entityTypesConfig || {};
		this.allTypes = {};
		this.allTypesArray = [];
		this.buildAllTypes(entityTypesConfig);
	}

	static getExtendedType(obj = {}, allTypes = {}, n = 0) {
		let newObj = structuredClone(obj);
		const { type, typeKey } = newObj;
		// if (type) console.log(n, type);
		if (!newObj.types) newObj.types = [];
		if (typeKey) newObj.types.push(typeKey);

		if (type) {
			if (allTypes[type]) {
				const parent = EntityTypes.getExtendedType(allTypes[type], allTypes, n + 1);
				newObj.types = [
					...parent.types,
					type,
				];
				newObj = { ...parent, ...newObj };
			} else {
				console.log(newObj);
				console.error('Could not find type', obj.type);
			}
		}
		newObj.types = Array.from(new Set(newObj.types)); // Remove duplicates
		return structuredClone(newObj);
	}

	getExtendedType(obj = {}) {
		return EntityTypes.getExtendedType(obj, this.allTypes);
	}

	/** Create an "untracked" entity, i.e. one without an `entId` */
	createUntrackedEntityByType(type) {
		return this.getExtendedType({ type });
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
		// console.log('All types:', this.allTypes);
		this.allTypesArray.forEach((typeObj) => {
			const extendedTypeObj = EntityTypes.getExtendedType(typeObj, this.allTypes);
			this.allTypes[extendedTypeObj.typeKey] = extendedTypeObj;
			this.allTypesArray[extendedTypeObj.entTypeId] = extendedTypeObj;
		});
		this.allTypesArray.forEach((typeObj) => {
			if (!typeObj.name) typeObj.name = capitalizeFirst(typeObj.typeKey);
		});
		console.log('All types:', this.allTypes);
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
