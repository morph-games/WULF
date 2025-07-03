// Copied from https://github.com/rocket-boots/keyboard-commander/blob/main/src/Observer.js

class Observer {
	constructor() {
		this.eventListeners = {};
	}

	/** Add event, analogous to `addEventListener` and jQuery's `on` */
	on(eventTypeName, listener) {
		let eventListenerSet = this.eventListeners[eventTypeName];
		if (!eventListenerSet) {
			this.eventListeners[eventTypeName] = new Set();
			eventListenerSet = this.eventListeners[eventTypeName];
		}
		eventListenerSet.add(listener);
	}

	/** Remove event, analogous to `removeEventListener` and jQuery's `off` */
	off(eventTypeName, listener) {
		if (typeof eventTypeName === 'undefined') {
			this.eventListeners = {};
			return;
		}
		const eventListenerSet = this.eventListeners[eventTypeName];
		if (!eventListenerSet) return;
		if (typeof listener === 'undefined') {
			eventListenerSet.clear();
			return;
		}
		eventListenerSet.delete(listener);
	}

	/** Trigger an event */
	trigger(eventTypeName, data) {
		const eventListenerSet = this.eventListeners[eventTypeName];
		if (!eventListenerSet) return;
		eventListenerSet.forEach((listener) => listener(data));
	}
}

export default Observer;
