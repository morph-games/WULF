const DEFAULT_VERSION = 1;
const READ_WRITE = 'readwrite';
const READ_ONLY = 'readonly';
// const VERSION_CHANGE = 'versionchange';
const DEFAULT_TIMEOUT = 5000; // in milliseconds
const { indexedDB, setTimeout, clearTimeout, URL, open } = window;

export default class SimplerIndexedDB {
	constructor(dbName, version, db = null) {
		this.dbName = dbName || null;
		this.version = version || DEFAULT_VERSION;
		this.db = db || null;
		this.timeout = DEFAULT_TIMEOUT;
	}

	static READ_WRITE = READ_WRITE;
	static READ_ONLY = READ_ONLY;

	/**
	 * Used to create, upggrade, or open a database.
	 * @param {*} dbName - string name
	 * @param {*} version - positive integer value
	 * @param {*} onUpgradeNeeded - callback function called when an upgrade is needed (creation or upgrades)
	 * @param {*} onSuccess - callback function called when the open is successful
	 * @returns a promise
	 */
	static async openDatabase(dbName, version = DEFAULT_VERSION, onUpgradeNeeded, onSuccess) {
		return new Promise((resolve, reject) => {
			const rejectError = (type, event) => {
				console.error(type, event?.target?.error?.message, event);
				reject(new Error(`open database failed ${type}`));
			};
			const openRequest = indexedDB.open(dbName, version);
			openRequest.onsuccess = (event) => {
				const db = event?.target?.result;
				if (onSuccess) onSuccess(db, event);
				resolve(db);
			};
			openRequest.onupgradeneeded = (event) => {
				const db = event?.target?.result;
				if (onUpgradeNeeded) onUpgradeNeeded(db, event);
				// After this, then onsuccess should be triggered automatically
				// resolve(db);
			};
			openRequest.onerror = (event) => rejectError('error', event);
			openRequest.onabort = (event) => rejectError('abort', event);
			openRequest.onclose = (event) => rejectError('close', event);
		});
	}

	static openBlob(blob) {
		open(URL.createObjectURL(blob));
	}

	/**
	 * Creates a promise that will automatically time-out (and get rejected) after the
	 * specified period of time
	 */
	static makeTimedPromise(fn, info = '', timeout = DEFAULT_TIMEOUT) {
		return new Promise((resolve, reject) => {
			const timeoutTimerId = setTimeout(
				() => reject(new Error(`Timed out ${info}`)), timeout);
			const clearResolve = (...args) => {
				clearTimeout(timeoutTimerId);
				resolve(...args);
			};
			const clearRejectError = (type, ...args) => {
				clearTimeout(timeoutTimerId);
				console.error(type, args);
				reject(new Error(`${type} ${info || ''}`));
			};
			fn(clearResolve, clearRejectError);
		});
	}

	// ------ Extend IDB functionality to use promises and include timeouts

	static waitForTransaction(transaction, info = '', timeout = DEFAULT_TIMEOUT) {
		return SimplerIndexedDB.makeTimedPromise((resolve, reject) => {
			transaction.oncomplete = (event) => resolve(event);
			transaction.onerror = (event) => reject('error', event, transaction);
			transaction.onabort = (event) => reject('abort', event, transaction);
		}, `transaction ${info}`, timeout);
	}

	static waitForRequest(request, info = '', timeout = DEFAULT_TIMEOUT) {
		return SimplerIndexedDB.makeTimedPromise((resolve, reject) => {
			request.onsuccess = (event) => resolve(event.target.result);
			request.onerror = (event) => reject('error', event, request);
			request.onabort = (event) => reject('abort', event, request);
			request.onclose = (event) => reject('close', event, request);
		}, `request ${info}`, timeout);
	}

	static waitForCursorValueRequest(request, info = '', timeout = DEFAULT_TIMEOUT) {
		return SimplerIndexedDB.makeTimedPromise((resolve, reject) => {
			const values = [];
			request.onsuccess = (event) => {
				const cursor = event.target.result;
				if (cursor) {
					values.push(cursor.value);
					cursor.continue();
					return;
				}
				resolve(values)
			};
			request.onerror = (event) => reject('error', event, request);
		}, `cursor request ${info}`, timeout);
	}

	async waitForRequest(req, info = '') {
		await SimplerIndexedDB.waitForRequest(req, info, this.timeout);
		return req;
	}

	// ------ Feedback

	handleError(type, ...args) {
		console.error('SIDB Error:', type, ...args);
	}

	// ------ Wrap indexedDB functionality

	async getDatabases() { const dbs = await indexedDB.databases(); return dbs }

	// ------ Wrap the database functionality

	getDatabaseName() {
		if (!this.db) throw new Error('db is missing');
		return this.db.name;
	}

	getObjectStoreNames() {
		return this.db.objectStoreNames;
	}

	hasObjectStoreName(name) {
		return this.getObjectStoreNames().contains(name);
	}

	getTransaction(objectStoreName, mode = READ_WRITE) {
		if (!this.db) throw new Error('db is missing');
		return this.db.transaction(objectStoreName, mode);
	}

	getObjectStore(objectStoreName, mode = READ_WRITE) {
		return this.getTransaction(objectStoreName, mode).objectStore(objectStoreName);
	}

	async addToObjectStore(objectStoreName, obj, info) {
		const req = this.getObjectStore(objectStoreName).add(obj);
		await this.waitForRequest(req, info || `add to ${objectStoreName}`);
		return req;
	}

	async putToObjectStore(objectStoreName, obj, info) {
		const req = this.getObjectStore(objectStoreName).put(obj);
		await this.waitForRequest(req, info || `put to ${objectStoreName}`);
		return req;
	}

	async deleteFromObjectStore(objectStoreName, id, info) {
		const req = this.getObjectStore(objectStoreName).delete(id);
		await this.waitForRequest(req, info || `delete ${id}`);
		return req;
	}

	async getFromObjectStore(objectStoreName, id, info) {
		const req = this.getObjectStore(objectStoreName).get(id);
		await this.waitForRequest(req, info || `get ${id}`);
		return req;
	}

	async readIndexCursorValues(objectStoreName, indexName) {
		// https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore/openCursor
		const index = this.getObjectStore(objectStoreName);
		const req = index.openCursor();
		const values = await SimplerIndexedDB.waitForCursorValueRequest(req);
		return values;
	}

	// ------ Setup

	/**
	 * Sets `db` and adds event handlers on the db so we can see errors
	 * @private
	*/
	setDatabase(db) {
		this.db = db;
		db.onabort = (...args) => this.handleError('abort', args);
		db.onclose = (...args) => this.handleError('close', args);
		db.onerror = (...args) => this.handleError('error', args);
		db.onversionchange = (...args) => { console.warn('versionchange', args); };
	}

	/**
	 * It's important to close your database connection, especially before attempting to open
	 * another connection to the same database.
	 */
	close() {
		if (!this.db) return;
		this.db.close();
		this.db = null;
	}

	/** - Caution: This will delete your database without backing it up anywhere */
	async delete() {
		this.close();
		const req = indexedDB.deleteDatabase(this.dbName);
		await SimplerIndexedDB.waitForRequest(req, 'delete');
	}

	/**
	 * Closes any previous database, and opens a new one. A new database can be created this way,
	 * but it is preferrable to use the `create` method because that allows you to perform
	 * "edit" functionality inside it.
	 */
	async open() {
		this.close();
		const db = await SimplerIndexedDB.openDatabase(this.dbName, version);
		this.setDatabase(db);
		return this.db;
	}

	/**
	 * Creates a database using the object's dbName and version.
	 * - Any creation methods - like making an object store or adding an index - needs to
	 * happen within the upgradeCallback.
	 * - Caution: This will delete your database without backing it up anywhere
	 */
	async create(upgradeCallback = () => {}) {
		await this.delete();
		const db = await SimplerIndexedDB.openDatabase(this.dbName, this.version, upgradeCallback);
		this.setDatabase(db);
		return this.db;
	}

	// ------ Upgrades - Methods that require the onupgradeneeded "edit mode"
	// Be very careful running these because each one will trigger an upgrade.

	async upgrade(upgradeCallback = () => {}) {
		this.version += 1;
		this.close();
		const db = await SimplerIndexedDB.openDatabase(this.dbName, this.version, upgradeCallback);
		this.setDatabase(db);
		return this.db;
	}

	async createObjectStore(objectStoreName, options) {
		let objStore;
		await this.upgrade((db) => {
			objStore = db.createObjectStore(objectStoreName, options);
		});
		return objStore;
	}

	async deleteObjectStore(objectStoreName, options) {
		let objStore;
		await this.upgrade((db) => {
			objStore = db.deleteObjectStore(objectStoreName, options);
		});
		return objStore;
	}

	// TODO: Add methods for objectStore.createIndex() and objectStore.deleteIndex()
}
