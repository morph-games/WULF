import { generateCurrencies } from './components/currencies.js';
import { generateEntitiesInInventory } from './components/inventory.js';

export default class EntityManager {
	constructor(entityTypes) {
		this.entityTypes = entityTypes;
		this.all = []; // maps.reduce((arr, map) => ([...arr, ...map.getEntities()]), []);
		// Start Ids at one to avoid any falsey issues
		this.nextEntId = 1; // this.all.length;
	}

	add(entObj = {}) {
		console.log('Add', entObj);
		const extendedEnt = this.entityTypes.getExtendedType(entObj);
		const newEnt = structuredClone(extendedEnt);
		// We want to use "add" rather than createUntrackedEntityByType so items get an entId
		const createTrackedEntityByType = (type) => this.add({ type });
		// Any components that entail random generation will need to be added here
		generateCurrencies(newEnt);
		generateEntitiesInInventory(newEnt, createTrackedEntityByType);
		newEnt.entId = this.nextEntId;
		// Actors get a special whoId
		if (newEnt.isActor) {
			const { whoId = String(`actor-ent-${this.nextEntId}`) } = newEnt;
			if (this.getActor(whoId)) throw new Error(`Already have an actor with whoId ${whoId}`);
			newEnt.whoId = whoId;
		}
		// All done? Add it to the list and increment the id
		this.all.push(newEnt);
		this.nextEntId += 1;
		return newEnt;
	}

	addAvatar(obj) {
		this.add({ ...obj, type: 'avatar', isAvatar: true });
	}

	addAllFromMaps(maps) {
		console.log(this.entityTypes);
		const allEntsFromMaps = maps.reduce((arr, map) => ([...arr, ...map.getEntities()]), []);
		allEntsFromMaps.forEach((ent) => this.add(ent));
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
