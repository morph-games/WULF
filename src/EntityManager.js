export default class EntityManager {
	constructor(entityTypes) {
		this.entityTypes = entityTypes;
		this.all = []; // maps.reduce((arr, map) => ([...arr, ...map.getEntities()]), []);
		this.nextEntId = this.all.length;
	}

	add(entObj = {}) {
		const extendedEnt = this.entityTypes.getExtendedType(entObj);
		this.all.push({
			x: 0,
			y: 0,
			location: { x: 0, y: 0 },
			...structuredClone(extendedEnt),
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
}
