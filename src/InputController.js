import KeyboardCommander from './KeyboardCommander.js';

export default class InputController {
	constructor(states) {
		if (!states) console.warn('No states param');
		this.states = states || {};
		this.kbCommander = new KeyboardCommander();
	}

	on(eventName, listenerFunction) {
		this.kbCommander.on(eventName, listenerFunction);
	}

	setState(stateName) {
		if (!this.states[stateName]) throw new Error(`Unknown state ${stateName}`);
		const keyMapping = this.states[stateName]?.kb || {};
		this.kbCommander.setMapping(keyMapping);
	}
}
