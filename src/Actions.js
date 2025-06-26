import { DEFAULT_COOLDOWN, DEFAULT_WARMUP, COORDINATE_MAP } from './constants.js';
import { randIntInclusive } from './utilities.js';
// Actions are essentially ECS Systems
// They are things that most actors can do, and they
// effect the world (the map) and the entities there.

/* eslint-disable no-param-reassign, no-unused-vars */

// Utilities

function parseActionResult(result) {
	let { success = null, message = '' } = result;
	const { followUp = null, cooldownMultiplier = 1 } = result;
	if (result instanceof Array) {
		[success, message] = result;
	}
	return { success, message, followUp, cooldownMultiplier };
}

// Primary Actions

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

function enter(actor, map) {
	const enterValue = map.getTopProperty('enter', actor.x, actor.y);
	if (!enterValue) {
		const klimbResult = this.klimb(actor, map);
		const { success } = parseActionResult(klimbResult);
		if (success) return klimbResult;
		return [false, 'There is nothing to enter.'];
	}
	if (!actor.canEnter) return [false, 'You cannot enter.'];
	return {
		success: true,
		message: `You enter ${map.getName()}.`,
		followUp: ['moveActorMap', actor, enterValue],
	};
}

function dismount(actor, map, mapEnts) {
	return [false, 'Not yet implemented.'];
}

function fight(actor, map, mapEnts) {
	return [false, 'Not yet implemented.'];
}

function fire(actor, map, mapEnts) {
	return [false, 'Not yet implemented.'];
}

function get(actor, map, mapEnts) {
	return [false, 'Not yet implemented.'];
}

function heal(actor, map, mapEnts) {
	return [false, 'Without precise calculations you could fly right through a star!'];
}

function hyperjump(actor, map, mapEnts) {
	return [false, 'Not yet implemented.'];
}

function ignite(actor, map, mapEnts) {
	return [false, 'Not yet implemented.'];
}

function investigate(actor, map, mapEnts) {
	return [false, 'Not yet implemented.'];
}

function junk(actor, map, mapEnts) {
	return [false, 'Not yet implemented.'];
}

function jump(actor, map, mapEnts) {
	return [false, 'You jump. Wee!'];
}

function jimmy(actor, map, mapEnts) {
	return [false, 'Not yet implemented.'];
}

function klimb(actor, map, mapEnts, direction) {
	const klimbDirection = map.getTopProperty('klimb', actor.x, actor.y);
	if (!klimbDirection) {
		return [false, 'There is nothing to climb here.'];
	}
	if (direction && klimbDirection !== direction) {
		return [false, `Cannot climb ${direction} here.`];
	}
	const exitValue = map.getExit(klimbDirection);
	if (!exitValue) {
		return [false, 'Cannot exit the area.'];
	}
	// this.moveActorMap(who, exitValue, true);
	const isRelativeCoords = true;
	return {
		success: true,
		message: `You climb ${klimbDirection}.`,
		followUp: ['moveActorMap', actor, exitValue, isRelativeCoords],
	};
}

function launch(actor, map, mapEnts) {
	return [false, 'You pretend to be a rocket. Wee!'];
}

function locate(actor, map, mapEnts) {
	return [false, 'Not yet implemented.'];
}

function mix(actor, map, mapEnts, what) {
	return [false, 'You do not have a mortar and pestle.'];
}

function move(actor, map, mapEnts, direction) {
	const directionCoordinates = COORDINATE_MAP[direction];
	if (!directionCoordinates) {
		return [false, 'Invalid direction to move'];
	}
	const newX = actor.x + directionCoordinates[0];
	const newY = actor.y + directionCoordinates[1];
	const edge = map.getOffEdge(newX, newY);
	if (!edge) {
		const terrainEnt = map.getTerrainEntity(newX, newY);
		// Get obstacle Ids for everything on the cell we want to move to
		const obstacleIds = [
			terrainEnt.obstacleId,
			...mapEnts
				.filter((ent) => ent.x === newX && ent.y === newY)
				.map((ent) => ent.obstacleId),
		];
		// Get actor's transversal values for the obstacle Ids
		const transversalValues = obstacleIds.map((obId) => actor?.move?.transversal[obId] || 0);
		const minTransversal = Math.min(...transversalValues); // Only the lowest value matters
		if (!minTransversal) return [false, `Blocked ${direction}.`];
		actor.x = newX;
		actor.y = newY;
		return {
			success: true,
			message: `You move ${direction}`,
			cooldownMultiplier: (1 / minTransversal),
		};
	}
	// Handle off the edge
	if (!actor.canExit) return [false, 'You cannot exit.'];
	const exitValue = map.getExit(edge);
	if (exitValue instanceof Array) {
		// this.moveActorMap(actor, exitValue);
		return { success: true, message: 'You leave.', followUp: ['moveActorMap', actor, exitValue] };
	}
	if (exitValue === 'BLOCK') {
		return [false, `Blocked ${direction}.`];
	}
	if (exitValue === 'LOOP') {
		const [x, y] = map.getLoopedCoordinates(newX, newY);
		actor.x = x;
		actor.y = y;
		return [true, `You move ${direction}`];
	}
	return [false, 'You cannot move.'];
}

function navigate(actor, map, mapEnts) {
	return [false, 'Not yet implemented.'];
}

function negate(actor, map, mapEnts) {
	return [false, 'You have no powers of negation yet.'];
}

function open(actor, map, mapEnts, direction) {
	// direction could be "coffin"
	return [false, 'Not yet implemented.'];
}

function offer(actor, map, mapEnts) {
	// for a bribe or payment
	return [false, 'Not yet implemented.'];
}

function pass() { // pass time -- eat?
	return [true, 'You wait a moment.'];
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
		return [false, 'No thinking.'];
	}
	const { randomMove = 0.5 } = actor.plan;
	if (Math.random() < randomMove) {
		const dir = ['up', 'down', 'left', 'right'];
		const i = Math.floor(Math.random() * 4) + 1;
		Actions.enqueueWithoutWarmup(actor, 'move', dir[i]);
	} else {
		Actions.enqueueWithoutWarmup(actor, 'pass');
	}
	return [true, ''];
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

function talk(actor, map, mapEnts, direction) {
	return [false, 'Not yet implemented.'];
}

function transact(actor, map, mapEnts, direction) {
	return [false, 'Not yet implemented.'];
}

function unlock(actor, map, mapEnts, item) {
	return [false, 'Not yet implemented.'];
}

function warmup(actor, map, mapEnts, actionName) {
	return [true, `You prepare to ${actionName}.`];
}

function yell(actor, map, mapEnts) {
	return [false, 'You yell loudly.'];
}

/* eslint-enable no-param-reassign */

const actions = {
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
const actionNames = Object.keys(actions);

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
		return actionNames.includes(actionName.toLowerCase());
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
		return (!Actions.hasAction(actor) && actor.action.cooldown <= timeNow);
	}

	// static cool(actor, timeNow) {
	// const { action } = actor;
	// if (action.cooldown < timeNow) return 0;
	// const deltaT = action.cooldown - timeNow;
	// action.cooldown = timeNow;
	// return deltaT;
	// }

	static enqueueWithoutWarmup(actor, actionName, actionParamsString) {
		actor.action.queue.push([actionName, actionParamsString]);
	}

	enqueue(actor, actionName, actionParamsString) {
		if (this.getWarmupTime(actionName)) {
			actor.action.queue.push(['warmup', actionName]);
		}
		actor.action.queue.push([actionName, actionParamsString]);
	}

	perform(actor, map, mapEnts, timeNow) {
		if (!Actions.hasReadyAction(actor, timeNow)) {
			return [false, 'No ready actions.'];
		}
		const { action } = actor;
		const actionArray = action.queue.shift();
		// console.log('\t\t', actionArray);
		const [actionName, actionParamsString = ''] = actionArray;
		if (!actionName) throw new Error('Missing actionName');
		if (!actions[actionName]) throw new Error(`Invalid actionName ${actionName}`);
		const result = actions[actionName](actor, map, mapEnts, actionParamsString);
		const { success, message, followUp, cooldownMultiplier } = parseActionResult(result);
		if (success) {
			const cd = (
				this.getCooldownTime(actionName, actionParamsString)
				* cooldownMultiplier
			);
			// console.log(actionName, cd);
			action.cooldown += cd;
		}
		// console.log(actor.entId, actor, result);
		return [success, message, followUp];
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
