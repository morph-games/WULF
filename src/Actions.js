import { DEFAULT_COOLDOWN, DEFAULT_WARMUP, COORDINATE_MAP } from './constants.js';
import { randIntInclusive } from './utilities.js';
// Actions are essentially ECS Systems
// They are things that most actors can do, and they
// effect the world (the map) and the entities there.

/* eslint-disable no-param-reassign, no-unused-vars */

// Utilities / Secondary Actions

function parseActionResult(result) {
	let { success = null, message = '' } = result;
	const { followUp = null, cooldownMultiplier = 1, quiet = false } = result;
	if (result instanceof Array) {
		[success, message] = result;
	}
	return { success, message, followUp, cooldownMultiplier, quiet };
}

function getMapEntitiesAt(mapEnts, x, y) {
	return mapEnts.filter((ent) => (ent.x === x && ent.y === y));
}

function getMapEntitiesAtActor(mapEnts, actor) {
	return getMapEntitiesAt(mapEnts, actor.x, actor.y).filter((ent) => ent.entId !== actor.entId);
}

function getTopEntityComponent(ents = [], componentName) {
	const entsWithComp = ents.filter((ent) => ent[componentName]);
	return (entsWithComp.length) ? entsWithComp[0][componentName] : null;
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

function enter(actor, map, mapEnts) {
	if (!actor.canEnter) return [false, 'You cannot enter.'];
	const enterComp = getTopEntityComponent(getMapEntitiesAtActor(mapEnts, actor), 'enter');
	if (!enterComp) {
		const klimbResult = this.klimb(actor, map, mapEnts);
		const { success } = parseActionResult(klimbResult);
		if (success) return klimbResult;
		return [false, 'There is nothing to enter.'];
	}
	if (!enterComp.mapKey) {
		return [false, 'Error entering!'];
	}
	const enterArray = [enterComp.mapKey];
	return {
		success: true,
		message: `You enter a new location.`,
		// quiet: true,
		followUp: ['moveActorMap', actor, enterArray],
	};
}

function dismount(actor, map, mapEnts) {
	return [false, 'Not yet implemented.'];
}

function fight(actor, map, mapEnts, direction) {
	const directionCoordinates = COORDINATE_MAP[direction];
	if (!directionCoordinates) return [false, 'Cannot fight that way.'];
	const newX = actor.x + directionCoordinates[0];
	const newY = actor.y + directionCoordinates[1];
	let targets = getMapEntitiesAt(mapEnts, newX, newY);
	if (!targets.length) return [true, `No one to fight (${direction}).`];
	targets = targets.filter((ent) => ent.health);
	if (!targets.length) return [true, `No effect! (fight ${direction})`];
	// Resolve combat, giving a portion of damage to all targets
	// TODO
	return [true, 'Fighting'];
}

function fire(actor, map, mapEnts, direction) {
	return [false, 'Not yet implemented.'];
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
	return [false, 'Not yet implemented.'];
}

function investigate(actor, map, mapEnts) {
	return [false, 'Not yet implemented.'];
}

function junk(actor, map, mapEnts) {
	return [false, 'Not yet implemented.'];
}

function jump(actor, map, mapEnts) {
	return [true, 'You jump. Wee!'];
}

function jimmy(actor, map, mapEnts) {
	return [false, 'Not yet implemented.'];
}

function klimb(actor, map, mapEnts, actionDirection) {
	if (!actor.canKlimb) return [false, 'You cannot climb.'];
	const klimbable = getTopEntityComponent(getMapEntitiesAtActor(mapEnts, actor), 'klimbable');
	if (!klimbable) {
		return [false, 'There is nothing to climb here.'];
	}
	const { speed = 1, direction } = klimbable;
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
		cooldownMultiplier: speed,
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

function move(actor, map, mapEnts, direction) {
	const directionCoordinates = COORDINATE_MAP[direction];
	if (!directionCoordinates) return [false, 'Invalid direction to move'];
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
		return {
			success: true,
			message: `You leave ${map.getName()}.`,
			followUp: ['moveActorMap', actor, exitValue],
		};
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
		const actionResult = parseActionResult(result);
		const { success, cooldownMultiplier } = actionResult;
		if (success) {
			const cd = (
				this.getCooldownTime(actionName, actionParamsString)
				* cooldownMultiplier
			);
			// console.log(actionName, cd);
			action.cooldown += cd;
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
