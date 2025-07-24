const FREE_SLOT = null;
const HELD_SLOTS = ['mainHandHeld', 'offHandHeld'];
const STANDARD_BODY_EQUIPMENT = { // Standard body
	head: FREE_SLOT,
	neck: FREE_SLOT,
	torso: FREE_SLOT,
	waist: FREE_SLOT,
	legs: FREE_SLOT,
	leftHand: FREE_SLOT,
	rightHand: FREE_SLOT,
	back: FREE_SLOT,
	leftFinger: FREE_SLOT,
	rightFinger: FREE_SLOT,
	mainHandHeld: FREE_SLOT,
	offHandHeld: FREE_SLOT,
};
// Note: These slot names need to be unique even when all lowercase.
const LOWERCASE_SLOT_MAPPING = Object.keys(STANDARD_BODY_EQUIPMENT)
	.map((key) => [key.toLowerCase(), key])
	.reduce((obj, [lowKey, key]) => ({ ...obj, [lowKey]: key }), {});

function areEntitiesTheSame(ent1, ent2) {
	if (ent1 === ent2) return true;
	return (typeof ent1.entId === 'number' && ent1.entId === ent2.entId);
}

function addEquipmentComponentToEntity(ent) {
	ent.equipment = structuredClone(STANDARD_BODY_EQUIPMENT);
}

function getCamelCaseSlotName(lowerSlotName) {
	return LOWERCASE_SLOT_MAPPING[lowerSlotName.toLowerCase()];
}

function canEquip(ent, slotName) {
	if (!slotName) return Boolean(ent.equipment && Object.keys(ent.equipment).length);
	return typeof ent.equipment[slotName] !== 'undefined';
}

function isEquippable(itemEnt) {
	return Boolean(itemEnt?.equippable?.slots && itemEnt.equippable.slots.length);
}

function isEquippableBy(itemEnt, equipperEnt) {
	if (!canEquip(equipperEnt) || !isEquippable(itemEnt)) return false;
	const validSlots = itemEnt.equippable.slots.filter((slot) => canEquip(equipperEnt, slot));
	return validSlots.length > 0;
}

function isSlotFree(equipperEnt, slotName) {
	if (!canEquip(equipperEnt)) return false;
	return equipperEnt.equipment[slotName] === FREE_SLOT;
}

function findEquippedBy(itemEntOrId, equipperEnt) {
	if (!equipperEnt.equipment) return [];
	const isEntId = typeof itemEntOrId === 'number';
	const found = Object.entries(equipperEnt.equipment).find(([, item]) => {
		if (!item || item === FREE_SLOT) return false;
		if (isEntId) return item.entId === itemEntOrId;
		return areEntitiesTheSame(item, itemEntOrId);
	});
	return found || [];
}

function findEquippedSlot(itemEntOrId, equipperEnt) {
	if (!equipperEnt.equipment) return null;
	const [slot] = findEquippedBy(itemEntOrId, equipperEnt);
	return slot;
}

function isItemEquippedBy(itemEnt, equipperEnt) {
	if (!canEquip(equipperEnt)) return false;
	const slot = findEquippedSlot(itemEnt, equipperEnt);
	return Boolean(slot);
}

function getEquippedItems(equipperEnt) {
	if (!canEquip(equipperEnt)) return [];
	return Object.values(equipperEnt.equipment).filter((item) => item);
}

function getHeldItems(equipperEnt) {
	if (!canEquip(equipperEnt)) return [];
	return Object.entires(equipperEnt.equipment)
		.filter(([slot, item]) => item && HELD_SLOTS.includes(slot))
		.map(([, item]) => item);
}

function equipItem(equipperEnt, itemEnt, slotName) {
	if (!isEquippableBy(itemEnt, equipperEnt)) return false;
	if (isItemEquippedBy(itemEnt, equipperEnt)) {
		console.warn('Already equipped. Will not try to equip again. Unequip first.');
		return true;
	}
	const equipInSlot = (slot) => {
		const occupied = equipperEnt.equipment[slot];
		equipperEnt.equipment[slot] = itemEnt;
		return occupied || true;
	};
	// const canEquipFree = (slot) => (canEquip(equipperEnt, slot) && isSlotFree(equipperEnt, slot));
	if (slotName) {
		if (canEquip(equipperEnt, slotName)) {
			return equipInSlot(slotName);
		}
		return false;
	}
	// If not slot defined, then try to find the best one
	const validSlots = itemEnt.equippable.slots.filter((slot) => canEquip(equipperEnt, slot));
	if (!validSlots.length) return false;
	const freeSlots = validSlots.filter((slot) => isSlotFree(equipperEnt, slot));
	// If no free slots, then use the best occupied one
	const bestSlot = (freeSlots.length) ? freeSlots[0] : validSlots[0];
	return equipInSlot(bestSlot);
}

function unequipItem(equipperEnt, itemEntOrId) {
	const [slot, item] = findEquippedBy(itemEntOrId, equipperEnt);
	if (!slot) return false;
	equipperEnt.equipment[slot] = FREE_SLOT;
	return item;
}

export {
	FREE_SLOT,
	addEquipmentComponentToEntity,
	getCamelCaseSlotName,
	canEquip,
	isEquippable,
	isEquippableBy,
	isSlotFree,
	findEquippedBy,
	findEquippedSlot,
	isItemEquippedBy,
	getEquippedItems,
	getHeldItems,
	equipItem,
	unequipItem,
};
