import { isItemEquippedBy, equipItem, unequipItem, getEquippedItems } from './components/equipment.js';
import { giveToInventory, takeFromInventory } from './components/inventory.js';
// TODO: Can't decide whether it is good or bad to be using component functions on the "front end"
import { capitalizeFirst } from './utilities.js';

export default class InventoryInterface {
	constructor(partyMembers) {
		this.partyMembers = partyMembers || [];
		this.originalEquipment = partyMembers.map((member) => structuredClone(member.equipment));
		this.currentCharacter = null;
		this.helpOn = false;
		this.index = 0;
		this.list = [];
		this.switchPartyMember(0);
	}

	static buildList(actor) {
		const { inventory = {} } = actor;
		const equippedItems = getEquippedItems(actor);
		const { contents = [] } = inventory;
		return [
			...equippedItems,
			...contents,
		];
	}

	buildList(actor) {
		this.list = InventoryInterface.buildList(actor);
	}

	switchPartyMember(/* memberIndex */) {
		// LATER: Make this work for multiple party members
		this.currentCharacter = this.partyMembers[0]; // eslint-disable-line
		this.buildList(this.currentCharacter);
	}

	toggleHelp() {
		this.helpOn = !this.helpOn;
	}

	next(inc = 1) {
		const max = this.list.length;
		this.index = (max + this.index + inc) % max;
	}

	previous(n = 1) {
		this.next(-n);
	}

	equip() {
		const item = this.list[this.index];
		const swap = equipItem(this.currentCharacter, item);
		if (!swap) return false;
		if (typeof swap === 'object') {
			giveToInventory(this.currentCharacter, swap);
		}
		// return takeFromInventory(this.currentCharacter, item);
		const takenItems = takeFromInventory(this.currentCharacter, item);
		// console.log(this.currentCharacter, takenItems, swap);
		return (takenItems && takenItems.length);
	}

	unequip() {
		const item = this.list[this.index];
		const removedItem = unequipItem(this.currentCharacter, item);
		if (!removedItem) return false;
		return giveToInventory(this.currentCharacter, removedItem);
		// const gave = giveToInventory(this.currentCharacter, removedItem);
		// console.log(this.currentCharacter, gave);
	}

	toggle() {
		const item = this.list[this.index];
		const isEquipped = isItemEquippedBy(item, this.currentCharacter);
		if (isEquipped) this.unequip();
		else this.equip();
	}

	getTextLines() {
		const helpLines = (this.helpOn) ? [
			' (Up/Down/W/S) Select item',
			' (Right/D) Equip item',
			' (Left/A) Unequip item',
			' (Space) Toggle',
			' (Enter) (Esc) (r) Close',
		] : [' (Arrows, r, Enter) (?) Help'];
		// TODO: ^ Make this help text based on the config
		const details = this.list.map((item, i) => {
			const isEquipped = isItemEquippedBy(item, this.currentCharacter);
			let cursor = (isEquipped) ? ' <' : ' >';
			if (i !== this.index) cursor = '  ';
			const name = capitalizeFirst(item.name || item.type);
			return [
				cursor,
				' ',
				isEquipped ? `${('.').repeat(17)}${name}` : name,
			].join('');
		});
		details.length = 10;
		return [
			'--- Inventory ---   --- Equipped ---',
			'',
			...details,
			'',
			...helpLines,
		];
	}

	completeTransaction() {
		let totalChanges = 0;
		const partyChanges = [];
		this.partyMembers.forEach((member, memberIndex) => {
			const memberChanges = [];
			Object.entries(member.equipment).forEach(([slot, item]) => {
				if ((item || this.originalEquipment[slot])
					&& item?.entId !== this.originalEquipment[slot]?.entId
				) {
					memberChanges.push(`${slot}:${item.entId}`);
					totalChanges += 1;
				}
			});
			partyChanges[memberIndex] = memberChanges.join(',');
		});
		if (!totalChanges) return '';
		const partyChangesString = partyChanges.map((changesString, i) => `${i}=${changesString}`);
		return `ready ${partyChangesString}`;
	}
}
