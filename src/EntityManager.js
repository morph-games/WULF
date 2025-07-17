import { generateCurrencies } from './components/currencies.js';

export default class EntityManager {
	constructor(entityTypes) {
		this.entityTypes = entityTypes;
		this.all = []; // maps.reduce((arr, map) => ([...arr, ...map.getEntities()]), []);
		this.nextEntId = this.all.length;
	}

	add(entObj = {}) {
		const extendedEnt = this.entityTypes.getExtendedType(entObj);
		const entData = structuredClone(extendedEnt);
		// Any components that entail random generation will need to be added here
		generateCurrencies(entData);
		this.all.push({
			...entData,
			entId: this.nextEntId,
		});
		this.nextEntId += 1;
	}

	addActor(obj) {
		const { whoId = String(`actor-ent-${this.nextEntId}`) } = obj;
		if (this.getActor(whoId)) throw new Error(`Already have an actor with whoId ${whoId}`);
		this.add({
			...obj,
			whoId,
			isActor: true,
		});
	}

	addAvatar(obj) {
		this.addActor({ ...obj, type: 'avatar', isAvatar: true });
	}

	allAllFromMaps(maps) {
		const allEntsFromMaps = maps.reduce((arr, map) => ([...arr, ...map.getEntities()]), []);
		allEntsFromMaps.forEach((ent) => {
			const extendedEnt = this.entityTypes.getExtendedType(ent);
			if (extendedEnt.isActor) this.addActor(extendedEnt);
			else this.add(extendedEnt);
		});
		console.log('All Entities', this.all);
	}

	getActor(whoId) {
		return this.all.find((ent) => ent.whoId === whoId);
	}

	getAvatars() {
		return this.all.filter((ent) => ent.isAvatar);
	}

	getActors() {
		return this.all.filter((ent) => ent.isActor);
	}

	getAvatarMapIds() {
		const mapIds = new Set();
		this.getAvatars().forEach((ent) => mapIds.add(ent.mapId));
		return [...mapIds];
	}

	getActorsOnMap(mapId) {
		return this.all.filter((ent) => ent.isActor && ent.mapId === mapId);
	}

	getEntitiesOnMap(mapId) {
		return this.all.filter((ent) => ent.mapId === mapId);
	}

	getEntitiesOnMapRange(mapId, startX = 0, startY = 0, w = 10, h = 10) {
		const endX = startX + w;
		const endY = startY + h;
		return this.all.filter((ent) => (
			ent.mapId === mapId
			&& ent.x >= startX && ent.x < endX
			&& ent.y >= startY && ent.y < endY
		));
	}
}
