import KeyboardCommander from './KeyboardCommander.js';

export default class InputController {
	constructor(states) {
		if (!states) console.warn('No states param');
		this.states = states || {};
		this.kbCommander = new KeyboardCommander({}, { triggerOnRepeat: true });
	}

	setup(selector = 'button') {
		document.querySelectorAll(selector).forEach((elt) => {
			if (!elt.dataset.key) return;
			elt.addEventListener('click', () => {
				this.kbCommander.triggerKey(elt.dataset.key);
			});
		});
	}

	on(eventName, listenerFunction) {
		this.kbCommander.on(eventName, listenerFunction);
	}

	setState(stateName, commandListenerFunction) {
		if (!this.states[stateName]) throw new Error(`Unknown state ${stateName}`);
		const keyMapping = this.states[stateName]?.kb || {};
		this.kbCommander.setMapping(keyMapping);
		this.kbCommander.off();
		this.kbCommander.on('command', commandListenerFunction);
		this.kbCommander.on('missingCommand', (...args) => console.warn('Missing command', args));
	}
}
