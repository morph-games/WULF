import { equipItem, unequipItem, FREE_SLOT, getCamelCaseSlotName } from '../components/equipment.js';
import { giveToInventory, takeFromInventory } from '../components/inventory.js';

function parseReadyParams(params) {
	return params.split(' ').map((changeStr) => {
		const [memberIndex, equipStr] = changeStr.split('=');
		// LATER: Check "+" and "-" and allow just equips and unequips
		const matchEquip = [];
		equipStr.split(',').forEach((str) => {
			const [slot, entId] = str.split(':');
			if (!slot || !entId) {
				console.error('Bad slot or entId', slot, entId, memberIndex);
				return;
			}
			matchEquip[getCamelCaseSlotName(slot)] = Number(entId);
		});
		return { memberIndex: Number(memberIndex), matchEquip };
	});
}

function equipFromInventory(actor, itemEntId) {
	const takenItems = takeFromInventory(actor, itemEntId);
	if (takenItems.length !== 1) return false;
	const swap = equipItem(actor, takenItems[0]);
	if (!swap) { // There was some kind of problem, so give the item back
		giveToInventory(actor, swap);
		return false;
	}
	if (typeof swap === 'object') {
		giveToInventory(actor, swap);
	}
	return true;
}

function unequipToInventory(actor, itemEntId) {
	const removedItem = unequipItem(actor, itemEntId);
	if (!removedItem) return false;
	const gaveBack = giveToInventory(actor, removedItem);
	if (gaveBack) return true;
	// There was some kind of problem, so re-equip the item so its not lost
	equipItem(actor, removedItem);
	return false;
}

function matchEquipmentIds(actor, matchEquip = {}) {
	const equippedEntIds = [];
	const unequippedEntIds = [];
	Object.entries(actor.equipment).forEach(([slot, item]) => {
		const equipEntId = matchEquip[slot];
		if (item === FREE_SLOT) {
			// Nothing there and nothing to equip - do nothing
			if (!equipEntId) return;
			// Nothing there and just equipping
			if (equipFromInventory(actor, equipEntId)) equippedEntIds.push(equipEntId);
			return;
		}
		// We have an item already in this slot...
		if (equipEntId) { // And are equipping something
			if (item.entId === equipEntId) return; // No change if same item
			// If different than do an equip, which should swap
			if (equipFromInventory(actor, equipEntId)) {
				equippedEntIds.push(equipEntId);
				unequippedEntIds.push(item.entId);
			}
			return;
		}
		// We have an item, but nothing in the match slot, so unequip only
		if (unequipToInventory(actor, item.entId)) {
			unequippedEntIds.push(item.entId);
		}
	});
	return [equippedEntIds, unequippedEntIds];
}

function ready(actor, map, mapEnts, params) {
	const changes = parseReadyParams(params);
	let totalEquipped = [];
	let totalUnequipped = [];
	// console.log('READY', params, changes);
	changes.forEach(({ matchEquip /* , memberIndex */ }) => {
		// TODO LATER: Get the party for the actor
		// For now we'll just make all the modifications
		// to the actor themselves
		const [equippedEntIds, unequippedEntIds] = matchEquipmentIds(actor, matchEquip);
		totalEquipped = totalEquipped.concat(equippedEntIds);
		totalUnequipped = totalUnequipped.concat(unequippedEntIds);
	});
	const e = totalEquipped.length;
	const u = totalUnequipped.length;
	if (!e && !u) return [false, 'Did not change equipment.'];
	let message = '';
	// console.log(totalEquipped, totalUnequipped, actor.equipment);
	if (e) {
		message = `Equipped ${e}`;
		if (u) message += ` and unequipped ${u} item${u > 1 ? 's' : ''}.`;
		else message += ` item${e > 1 ? 's' : ''}.`;
	} else if (u) {
		message = `Unequipped ${u} item${u > 1 ? 's' : ''}.`;
	}
	return [true, message];
}

export { ready };
export default ready;
