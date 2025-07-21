import { isItemEquippedBy, equipItem, unequipItem, getEquippedItems } from './components/equipment.js';
import { giveToInventory, takeFromInventory } from './components/inventory.js';
import { capitalizeFirst } from './utilities.js';

export default class InventoryInterface {
	constructor(party) {
		this.party = party;
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
		this.currentCharacter = this.party.avatar;
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
			' (Enter) Ready and close',
			' (Esc) (r) Cancel',
			' (Up/Down/W/S) Select item',
			' (Left/Right/A/D) Equip/Unequip item',
		] : [' (Arrows, Esc, Enter) (?) Help'];
		const details = this.list.map((item, i) => {
			const isEquipped = isItemEquippedBy(item, this.currentCharacter);
			let cursor = (isEquipped) ? ' <' : ' >';
			if (i !== this.index) cursor = '  ';
			const padding = isEquipped ? '.' : ' ';
			return [
				cursor,
				' ',
				capitalizeFirst(item.name || item.type).padEnd(20, padding),
				isEquipped ? 'Equipped' : '',
			].join('');
		});
		details.length = 10;
		return [
			'--- Inventory ---',
			'',
			...details,
			'',
			...helpLines,
		];
	}
}
