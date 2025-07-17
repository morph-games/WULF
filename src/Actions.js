import { DEFAULT_COOLDOWN, DEFAULT_WARMUP,
	DIRECTIONS_ARRAY,
} from './constants.js';
import { randIntInclusive } from './utilities.js';
import {
	parseActionResult,
	getMapEntitiesAtActor,
	getMapEntitiesNextToActor,
	getTopEntityComponent,
	findNearest,
	getEntityDistance,
	getDirectionTo,
	combineSpeed,
	calcFactionAlignment,
	getRangedFireRange,
	isAlive,
} from './actionUtilities.js';
import { attack, getMeleeAttackRange } from './actions/attack.js';
import { enter } from './actions/enter.js';
import { move } from './actions/move.js';
import { pass } from './actions/pass.js';
import { talk } from './actions/talk.js';
import { transact } from './actions/transact.js';

const DEATH_COOLDOWN = 100;
// Actions are essentially ECS Systems
// They are things that most actors can do, and they
// effect the world (the map) and the entities there.

/* eslint-disable no-param-reassign, no-unused-vars */

// ---------- Primary Actions

function board(actor, map, mapEnts) {
	return [false, 'Not yet implemented.'];
}

function camp(actor, map, mapEnts) {
	return [false, 'Not yet implemented.'];
}

function cast(actor, map, mapEnts) {
	return [false, 'Not yet implemented.'];
}

// TODO: Should engage logic happen on client side or world side?
function engage(actor, map, mapEnts) {
	// Enter or talk
	// TODO: Determine if this should be entering or talking
	return this.enter(actor, map, mapEnts);
}

function dismount(actor, map, mapEnts) {
	return [false, 'Not yet implemented.'];
}

function fight(actor, map, mapEnts, direction) {
	// if (!actor.fighter)
	// if (actor.attacker)
	const neighborTargets = getMapEntitiesNextToActor(mapEnts, actor, direction)
		.filter((ent) => ent.health);
	if (neighborTargets.length) return this.attack(actor, map, mapEnts, direction);
	return this.fire(actor, map, mapEnts, direction);
}

function fire(actor, map, mapEnts, direction) {
	return [false, 'Firing not yet implemented.'];
}

function get(actor, map, mapEnts) {
	return [false, 'Not yet implemented.'];
}

function heal(actor, map, mapEnts) {
	return [false, 'Not yet implemented.'];
}

function hyperjump(actor, map, mapEnts) {
	return [false, 'Without precise calculations you could fly right through a star!'];
}

function ignite(actor, map, mapEnts) {
	return [false, 'Torches not yet implemented.'];
}

function investigate(actor, map, mapEnts) {
	return [false, 'Not yet implemented.'];
}

function junk(actor, map, mapEnts) {
	return [false, 'Junk not yet implemented.'];
}

function jump(actor, map, mapEnts) {
	return [true, 'You jump. Wee!'];
}

function jimmy(actor, map, mapEnts) {
	return [false, 'Jimmy not yet implemented.'];
}

function klimb(actor, map, mapEnts, actionDirection) {
	if (!actor.klimber) return [false, 'You cannot climb.'];
	const klimbable = getTopEntityComponent(getMapEntitiesAtActor(mapEnts, actor), 'klimbable');
	if (!klimbable) {
		return [false, 'There is nothing to climb here.'];
	}
	const { direction } = klimbable;
	if (actionDirection) {
		// TODO: If directions don't match, then keep looking through the entities to see if one
		// matches the direction. There is a rare issue where 2+ klimbable entities are on the same
		// cell, with different directions. That should almost never happen though.
		if (direction !== actionDirection) {
			return [false, `Cannot climb ${actionDirection} here.`];
		}
	}
	const exitValue = map.getExit(direction);
	if (!exitValue) {
		return [false, 'Cannot exit the area.'];
	}
	const isRelativeCoords = true;
	return {
		success: true,
		message: `You climb ${direction}.`,
		cooldownMultiplier: combineSpeed(actor.klimber, klimbable),
		followUp: ['moveActorMap', actor, exitValue, isRelativeCoords],
	};
}

function launch(actor, map, mapEnts) {
	return [true, 'You pretend to be a rocket. Wee!'];
}

function locate(actor, map, mapEnts) {
	return [false, 'Not yet implemented.'];
}

function mix(actor, map, mapEnts, what) {
	return [true, 'You do not have a mortar and pestle.'];
}

function navigate(actor, map, mapEnts) {
	return [false, 'Not yet implemented.'];
}

function negate(actor, map, mapEnts) {
	return [true, 'You have no powers of negation yet.'];
}

function open(actor, map, mapEnts, direction) {
	// direction could be "coffin"
	return [false, 'Not yet implemented.'];
}

function offer(actor, map, mapEnts) {
	// for a bribe or payment
	return [false, 'Not yet implemented.'];
}

function pickpocket(actor, map, mapEnts, direction) {
	return [false, 'Not yet implemented.'];
}

function peer(actor, map, mapEnts) {
	return [false, 'Not yet implemented.'];
}

function plan(actor, map, mapEnts) {
	if (!actor.plan) {
		Actions.enqueueWithoutWarmup(actor, 'pass');
		return { success: false, quiet: true, message: 'No thinking.' };
	}
	const {
		randomMove = 0.5,
		aggroRange = 0,
		hunt = false,
	} = actor.plan;
	if (hunt) {
		const [nearestEnt, dist] = findNearest(mapEnts, actor.x, actor.y, (ent) => {
			if (!ent.isActor) return false;
			if (actor.whoId === ent.whoId) return false; // Don't find self
			// Filter by aggro range and faction friend vs. foe
			const d = getEntityDistance(ent, actor);
			if (d > aggroRange) return false; // Beyond range
			if (calcFactionAlignment(ent, actor) >= 0) return false; // Friendly?
			return true;
		});
		if (nearestEnt) {
			const dir = getDirectionTo(actor, nearestEnt);
			if (dir) {
				const attackRange = getMeleeAttackRange(actor);
				const fireRange = getRangedFireRange(actor);
				// We could determine 'attack' or 'fire' based on range,
				// or just use the generic 'fight' action to cover both / either.
				const action = (dist <= attackRange || dist <= fireRange) ? 'fight' : 'move';
				// TODO: Could make this more nuanced by allowing some actors to have
				// a preference for melee even if they have a backup ranged attack.
				// console.log('Planning hunt', action, 'in direction', dir);
				Actions.enqueueWithoutWarmup(actor, action, dir);
				return [true, `Planning the hunt (${action})`];
			}
		}
	}

	if (Math.random() < randomMove) {
		const i = Math.floor(Math.random() * 4) + 1;
		Actions.enqueueWithoutWarmup(actor, 'move', DIRECTIONS_ARRAY[i]);
	} else {
		Actions.enqueueWithoutWarmup(actor, 'pass');
	}
	return { success: true, message: 'Plan success', quiet: true };
}

function push(actor, map, mapEnts, direction) {
	return [false, 'Not yet implemented.'];
}

function ready(actor, map, mapEnts, item) {
	return [false, 'Not yet implemented.'];
}

function summon(actor, map, mapEnts) {
	return [false, 'Not yet implemented.'];
}

function unlock(actor, map, mapEnts, item) {
	// TODO: See if there's an unlockable item nearby?
	return [false, 'Not yet implemented.'];
}

function warmup(actor, map, mapEnts, actionName) {
	return {
		success: true,
		message: `You prepare to ${actionName}.`,
		quiet: true,
	};
}

function yell(actor, map, mapEnts) {
	// TODO: Make neartest horse run towards you
	return [true, 'You yell loudly.'];
}

/* eslint-enable no-param-reassign */

const ACTION_FUNCTIONS = {
	attack,
	board,
	camp,
	cast,
	engage,
	enter,
	dismount,
	fight,
	fire,
	get,
	heal,
	hyperjump,
	ignite,
	investigate,
	junk,
	jump,
	jimmy,
	klimb,
	launch,
	locate,
	mix,
	move,
	navigate,
	negate,
	open,
	offer,
	pass,
	pickpocket,
	peer,
	plan,
	push,
	ready,
	summon,
	talk,
	transact,
	unlock,
	warmup,
	yell,
};
const ACTION_NAMES = Object.keys(ACTION_FUNCTIONS);

export default class Actions {
	constructor(actionsConfig = {}, timingConfig = {}) {
		this.actionsConfig = structuredClone(actionsConfig);
		const {
			actionCooldown = DEFAULT_COOLDOWN,
			actionCooldownRandom = 0,
			actionWarmup = DEFAULT_WARMUP,
			actionWarmupRandom = 0,
		} = timingConfig;
		this.actionCooldown = actionCooldown;
		this.actionCooldownRandom = actionCooldownRandom;
		this.actionWarmup = actionWarmup;
		this.actionWarmupRandom = actionWarmupRandom;
	}

	static has(actionName) {
		return ACTION_NAMES.includes(actionName.toLowerCase());
	}

	static hasAction(actor) {
		if (!actor.action) return false;
		return (actor.action.queue && actor.action.queue.length);
	}

	static hasReadyAction(actor, timeNow) {
		if (!Actions.hasAction(actor)) return false;
		return (actor.action.cooldown <= timeNow);
	}

	static isWaitingForAction(actor, timeNow) {
		return (
			!Actions.hasAction(actor)
			&& actor.action.cooldown <= timeNow
			// && isAlive(actor)
		);
	}

	// static cool(actor, timeNow) {
	// const { action } = actor;
	// if (action.cooldown < timeNow) return 0;
	// const deltaT = action.cooldown - timeNow;
	// action.cooldown = timeNow;
	// return deltaT;
	// }

	static handleDeadActor(actor) {
		if (isAlive(actor)) return;
		actor.action.queue = [['pass']];
		actor.action.cooldown += DEATH_COOLDOWN;
	}

	static enqueueWithoutWarmup(actor, actionName, actionParamsString) {
		actor.action.queue.push([actionName, actionParamsString]);
	}

	enqueue(actor, actionName, actionParamsString) {
		if (this.getWarmupTime(actionName)) {
			actor.action.queue.push(['warmup', actionName]);
		}
		actor.action.queue.push([actionName, actionParamsString]);
	}

	enqueuePlan(actor) {
		// console.log(actor.name, 'plans', isAlive(actor));
		if (!isAlive(actor)) {
			Actions.handleDeadActor(actor);
			return;
		}
		this.enqueue(actor, 'plan');
	}

	runAction(actionName, actor, map, mapEnts, actionParamsString) {
		if (!actionName) throw new Error('Missing actionName');
		if (!ACTION_FUNCTIONS[actionName]) throw new Error(`Invalid actionName ${actionName}`);
		const result = ACTION_FUNCTIONS[actionName](actor, map, mapEnts, actionParamsString, this);
		return parseActionResult(result);
	}

	perform(actor, map, mapEnts, timeNow) {
		if (!Actions.hasReadyAction(actor, timeNow)) {
			return parseActionResult([false, 'No ready actions.']);
		}
		const { action } = actor;
		const actionArray = action.queue.shift();
		// console.log('\t\t', actionArray);
		const [actionName, actionParamsString = ''] = actionArray;
		if (!isAlive(actor) && actionName !== 'pass') {
			Actions.handleDeadActor(actor);
			return parseActionResult([false, `Cannot ${actionName} while dead`]);
		}
		const actionResult = this.runAction(actionName, actor, map, mapEnts, actionParamsString);
		const { success, cooldownMultiplier } = actionResult;
		if (success) {
			const cd = Math.max(
				Math.round(this.getCooldownTime(actionName, actionParamsString)
					* cooldownMultiplier),
				1,
			);
			// console.log(actionName, cd);
			action.cooldown = Math.ceil(timeNow + cd);
		}
		// console.log(actor.entId, actor, result);
		return actionResult;
	}

	getWarmupTime(actionName) {
		return (this.actionsConfig[actionName]?.warmup || 0) * (
			this.actionWarmup + randIntInclusive(this.actionWarmupRandom)
		);
	}

	getCooldownTime(actionName, actionParamsString) {
		if (actionName === 'warmup') {
			return this.getWarmupTime(actionParamsString);
		}
		return (this.actionsConfig[actionName]?.cooldown || 0) * (
			this.actionCooldown + randIntInclusive(this.actionCooldownRandom)
		);
	}
}
