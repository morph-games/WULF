export default class EntityManager {
	constructor(maps) {
		this.all = maps.reduce((arr, map) => ([...arr, ...map.getEntities()]), []);
		this.all.forEach((ent, i) => {
			/* eslint-disable no-param-reassign */
			ent.entId = i;
			// FIXME
			if (ent.isActor) { // TODO: handle this with base entity-types
				ent.action = {
					queue: [], // array of actions [actionName, params] to do next
					cooldown: 1,
				};
			}
			/* eslint-enable no-param-reassign */
		});
		this.nextEntId = this.all.length;
		console.log(this.all);
	}

	add(entObj = {}) {
		this.all.push({
			x: 0,
			y: 0,
			entId: this.nextEntId,
			...structuredClone(entObj),
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
			action: {
				queue: [], // array of actions [actionName, params] to do next
				cooldown: 1,
			},
		});
	}

	addAvatar(obj) {
		this.addActor({ ...obj, isAvatar: true });
	}

	getActor(whoId) {
		return this.all.find((ent) => ent.whoId === whoId);
	}

	getAvatars() {
		return this.all.filter((ent) => ent.isAvatar);
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
