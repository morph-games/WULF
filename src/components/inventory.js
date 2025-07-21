import { areEntitiesTheSame, isEntityShaped } from '../utilities.js';

const DEFAULT_INVENTORY_MAX = 255;

function giveToInventory(destinationEnt, thingEnt) {
	if (!destinationEnt.inventory) return false;
	const { max = DEFAULT_INVENTORY_MAX } = destinationEnt.inventory;
	if (!isEntityShaped(thingEnt)) {
		console.warn('Trying to give a non entity', thingEnt, 'to', destinationEnt);
		return false;
	}
	if (destinationEnt.inventory.contents.length >= max) return false;
	destinationEnt.inventory.contents.push(thingEnt);
	return true;
}

function takeFromInventory(sourceEnt, thingTypeOrId, quantity = 1) {
	if (!sourceEnt.inventory) return false;
	const taken = [];
	sourceEnt.inventory.contents = sourceEnt.inventory.contents.map((thing) => {
		if (taken.length >= quantity) return thing;
		if (typeof thingTypeOrId === 'number') {
			if (thing.entId === thingTypeOrId) {
				taken.push(thing);
				return null;
			}
		} else if (typeof thingTypeOrId === 'string') {
			if (thing.type === thingTypeOrId) {
				taken.push(thing);
				return null;
			}
		} else if (typeof thingTypeOrId === 'object') {
			if (areEntitiesTheSame(thing, thingTypeOrId)) {
				taken.push(thing);
				return null;
			}
		}
		return thing;
	}).filter((itemEnt) => Boolean(itemEnt)); // Remove anything falsey
	return taken;
}

function createEntitiesInInventory(ent, entityTypes) {
	if (!ent.inventory) return false;
	if (!ent.inventory.contents) ent.inventory.contents = [];
	ent.inventory.contents = ent.inventory.contents.map((thing) => {
		if (typeof thing === 'string') {
			return entityTypes.createEntityByType(thing);
		}
		if (isEntityShaped(thing)) {
			// TODO: Do some check to make sure the item can fit in an inventory?
			return thing;
		}
		console.warn('Unexpected thing found in inventory', thing, ent, 'Removing it.');
		return null;
	}).filter((itemEnt) => Boolean(itemEnt)); // Remove anything falsey
	return true;
}

export { createEntitiesInInventory, giveToInventory, takeFromInventory };
