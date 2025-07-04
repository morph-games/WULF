import Observer from './Observer.js';

// Events
const COMMAND_EVENT = 'command';
const MISSING_COMMAND_EVENT = 'missingCommand';
const MOUNT_EVENT = 'mount';
const UNMOUNT_EVENT = 'unmount';
const MAPPING_EVENT = 'mapping';
const ALL_EVENTS = [
	COMMAND_EVENT, MISSING_COMMAND_EVENT, MOUNT_EVENT, UNMOUNT_EVENT, MAPPING_EVENT,
];
// Other constants
const KEY_EVENT = 'keydown'; // Note that keyPress acts different and doesn't trigger for some keys
const KEY_UP_EVENT = 'keyup';

class KeyboardCommander extends Observer {
	constructor(keyCommandMapping = {}, options = {}) {
		super();
		const {
			autoMount = true,
			triggerOnRepeat = false,
			document = window.document,
		} = options;
		// an id is useful for debugging - identifying unique instantiations
		this.id = Math.round(Math.random() * 99999);
		// Do we want an individual command to fire off if the key is held down
		this.triggerOnRepeat = Boolean(triggerOnRepeat);
		// this.state = options.state || 'default';
		this.mapping = {};
		this.setMapping(keyCommandMapping);
		this.document = document;
		if (!this.document.addEventListener) throw new Error('document with addEventListener is required');
		this.keysDown = {};
		this.commandsDown = {};
		this.keyDownListener = (event) => this.handleKeyDown(event);
		this.keyUpListener = (event) => this.handleKeyUp(event);
		// Set up event hooks, if provided
		this.setupEventListeners(options);
		// Advanced settings
		this.nodeNamesDontTrigger = ['TEXTAREA', 'INPUT'];
		this.nodeNamesAllowDefault = ['TEXTAREA', 'INPUT']; // redundant since they won't get triggered
		// Start it up - default is to automatically mount
		if (autoMount) this.mount();
	}

	setMapping(mappingParam = {}) {
		if (typeof mappingParam !== 'object') throw new Error('Invalid type for mapping param');
		this.mapping = { ...mappingParam };
		this.trigger(MAPPING_EVENT);
		return this.mapping;
	}

	mapKey(key, command) {
		this.mapping[key] = command;
		this.trigger(MAPPING_EVENT);
		return true;
	}

	mapUnmappedKey(key, command) {
		if (this.mapping[key]) return false; // Don't overwrite a mapping
		return this.mapKey(key, command);
	}

	unmapKey(key) {
		if (this.mapping[key]) return false;
		delete this.mapping[key];
		this.trigger(MAPPING_EVENT);
		return true;
	}

	mount() {
		this.document.addEventListener(KEY_EVENT, this.keyDownListener);
		this.document.addEventListener(KEY_UP_EVENT, this.keyUpListener);
		this.trigger(MOUNT_EVENT);
	}

	unmount() {
		this.document.removeEventListener(KEY_EVENT, this.keyDownListener);
		this.document.removeEventListener(KEY_UP_EVENT, this.keyUpListener);
		this.trigger(UNMOUNT_EVENT);
	}

	handleKeyDown(event) {
		// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
		const { key, code, keyCode, altKey, ctrlKey, shiftKey, metaKey, repeat } = event;
		const details = { code, keyCode, altKey, ctrlKey, shiftKey, metaKey, repeat };
		const { nodeName } = event.target;
		if (this.nodeNamesDontTrigger.includes(nodeName)) return;
		if (!this.nodeNamesAllowDefault.includes(nodeName)) {
			event.preventDefault();
		}
		if (!repeat) {
			const command = this.mapping[key];
			this.keysDown[key] = true;
			if (command) this.commandsDown[command] = true;
		}
		const trigger = (!repeat || this.triggerOnRepeat);
		if (trigger) this.triggerKey(key, details);
	}

	handleKeyUp(event) {
		const { key } = event;
		const command = this.mapping[key];
		this.keysDown[key] = false;
		if (command) this.commandsDown[command] = false;
	}

	setupEventListeners(listenersObj = {}) {
		ALL_EVENTS.forEach((eventName) => {
			// Assumes that the value will be a function
			if (listenersObj[eventName]) this.on(eventName, listenersObj[eventName]);
		});
	}

	triggerCommand(command) {
		this.trigger(COMMAND_EVENT, command);
	}

	triggerMissingCommand(key) {
		// console.warn('No command for', key);
		this.trigger(MISSING_COMMAND_EVENT, key);
	}

	triggerKey(key /* , details = {} */) {
		const command = this.mapping[key];
		// TODO: Look at details and handle them in the mapping
		if (command) {
			this.triggerCommand(command);
		} else {
			this.triggerMissingCommand(key);
		}
	}

	getKeysMapped() {
		return Object.keys(this.mapping);
	}

	getCommands() {
		const uniqueCommands = new Set();
		this.getKeysMapped().forEach((key) => uniqueCommands.add(this.mapping[key]));
		return Array.from(uniqueCommands);
	}

	isKeyDown(key) {
		return this.keysDown[key];
	}

	isCommandDown(command) {
		return this.commandsDown[command];
	}

	getKeysDown() {
		return Object.keys(this.keysDown).filter((key) => this.keysDown[key]);
	}

	getCommandsDown() {
		return Object.keys(this.commandsDown).filter((key) => this.commandsDown[key]);
	}

	clearDown() {
		this.keysDown = {};
		this.commandsDown = {};
	}
}

export default KeyboardCommander;
