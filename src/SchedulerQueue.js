export default class SchedulerQueue {
	constructor(actors) {
		this.queue = [];
		actors.forEach((actor) => this.add(actor));
		this.sort();
		this.time = 0;
	}

	add(actor) {
		if (!actor.action) {
			console.warn('Actor does not have action component so cannot be added to schedule', actor);
			return;
		}
		this.queue.push(actor);
		this.sort();
	}

	sort() {
		// let display = this.queue.map((ent) => ([ent.name, ent.action.cooldown].join(': ')));
		// console.log(display.join(', '));
		this.queue.sort((a, b) => {
			if (a.action.cooldown === b.action.cooldown) {
				return (a.isAvatar) ? -1 : 0;
			}
			return a.action.cooldown - b.action.cooldown;
		});
		// display = this.queue.map((ent) => ([ent.name, ent.action.cooldown].join(': ')));
		// console.log(display.join(', '));
	}

	top() {
		return this.queue[0];
	}

	coolToTop() {
		const actor = this.top();
		const [whoId, isWarmingUp, cooldownTime] = actor.action;
		const deltaT = cooldownTime - this.time;
		this.time = cooldownTime;
		actor.action.isWarmingUp = 0;
		return { whoId, isWarmingUp, deltaT };
	}
}
