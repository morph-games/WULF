import SimplerIndexedDB from './SimplerIndexedDB.js';

export default class WorldSaveLoadManager {
	constructor() {
		this.db = new SimplerIndexedDB('worldSaves', 1);
		this.tableName = 'test-save';
	}

	async setup() {
		await this.db.create((db) => {
			db.createObjectStore(this.tableName, { keyPath: 'path' });
		});
	}

	async saveWorld(world, saveName) {
		console.log('Saving world');
		// await this.db.createObjectStore(saveName, { keyPath: 'path' });
		await this.db.addToObjectStore(this.tableName, { path: 1, test: 123, saveName });
	}
}