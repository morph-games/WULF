export default class GameStorage {
	constructor(gameName) {
		this.gameName = gameName || 'MyGame';
	}

	getObject(itemName) {
		const itemString = localStorage.getItem(`${this.gameName}_${itemName}`);
		if (typeof itemString !== 'string') return null;
		return JSON.parse(itemString);
	}

	setObject(itemName, obj = null) {
		localStorage.setItem(`${this.gameName}_${itemName}`, JSON.stringify(obj));
	}

	loadSavesList() {
		const saves = this.getObject('Saves');
		return saves || [];
	}

	// saveOptions() {
	// TODO:
	// }

	saveSave(index, saveName, data) {
		this.setObject(`Save${index}`, data);
		const saves = this.loadSavesList();
		saves[index] = { saveName };
		this.setObject('Saves', saves);
	}
}
