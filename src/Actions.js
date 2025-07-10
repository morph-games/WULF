import { DEFAULT_COOLDOWN, DEFAULT_WARMUP, COORDINATE_MAP,
	DIRECTIONS_ARRAY
} from './constants.js';
import { randIntInclusive, distance } from './utilities.js';
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

function getMapEntitiesNextToActor(mapEnts, actor, direction) {
	const directionCoordinates = COORDINATE_MAP[direction];
	if (!directionCoordinates) return [];
	const newX = actor.x + directionCoordinates[0];
	const newY = actor.y + directionCoordinates[1];
	return getMapEntitiesAt(mapEnts, newX, newY);
}

function getTopEntityComponent(ents = [], componentName) {
	const entsWithComp = ents.filter((ent) => ent[componentName]);
	return (entsWithComp.length) ? entsWithComp[0][componentName] : null;
}

function findNearest(mapEnts = [], x = 0, y = 0, filterFunction = null) {
	let nearestDistance = Infinity;
	let nearestEnt = null;
	mapEnts.forEach((ent) => {
		if (filterFunction && !filterFunction(ent)) return;
		const d = distance(ent.x, ent.y, x, y);
		if (d < nearestDistance) {
			nearestDistance = d;
			nearestEnt = ent;
		}
	});
	return [nearestEnt, nearestDistance];
}

function getEntityDistance(ent1, ent2) {
	return distance(ent1.x, ent1.y, ent2.x, ent2.y);
}

function getDirectionTo(sourceEnt, destinationEnt) {
	const diffX = destinationEnt.x - sourceEnt.x;
	const diffY = destinationEnt.y - sourceEnt.y;
	if (diffX === 0 && diffY === 0) {
		console.warn('Could not give a direction between', sourceEnt, destinationEnt);
		return '';
	}
	if (Math.abs(diffX) > Math.abs(diffY)) return diffX < 0 ? 'left' : 'right';
	return diffY < 0 ? 'up' : 'down';
}

function combineSpeed(comp1, comp2) {
	return (
		((typeof comp1.speed === 'number') ? comp1.speed : 1)
		* ((typeof comp2.speed === 'number') ? comp2.speed : 1)
	);
}

function calcFactionAlignment(ent1, ent2) {
	const factions1 = ent1?.factions || {};
	const factions2 = ent2?.factions || {};
	const factionKeys = [...Object.keys(factions1), ...Object.keys(factions2)];
	const uniqueFactionKeys = [...(new Set(factionKeys))];
	const alignment = uniqueFactionKeys.reduce((sum, key) => {
		const score1 = factions1[key] || 0;
		const score2 = factions2[key] || 0;
		if (score1 === 0 || score2 === 0) return sum; // Don't contribute to alignment
		if (Math.sign(score1) === Math.sign(score2)) {
			// Add twice the smaller absolute value positively to the alignment sum
			return sum + ((Math.min(Math.abs(score1), Math.abs(score2))) * 2);
		}
		// If there is disalignment, then subtract the difference
		return sum - Math.abs(score1 - score2);
	}, 0);
	console.log(alignment);
	return alignment;
}

function damageEntity(ent, damageAmount, damageType) {
	ent.health.hp -= damageAmount;
	console.log('\t', ent.name, 'took', damageAmount, 'damage. HP:', ent.health.hp);
}

function damageEntities(ents = [], damageAmount, damageType) {
	const damageableEnts = ents.filter((ent) => ent.health);
	const dmgPer = Math.floor(damageAmount / damageableEnts.length);
	const leftover = damageAmount - (dmgPer * damageableEnts.length);
	const outcomes = damageableEnts.map((ent, i) => {
		return damageEntity(ent, (i === 0) ? dmgPer + leftover : dmgPer, damageType);
	});
	return outcomes;
}

// ---------- Primary Actions

/** Melee Attack */
function attack(actor, map, mapEnts, direction) {
	let targets = getMapEntitiesNextToActor(mapEnts, actor, direction);
	if (!targets.length) return [true, `No one to fight (${direction}).`];
	targets = targets.filter((ent) => ent.health);
	if (!targets.length) return [true, `No effect! (fight ${direction})`];
	// TODO: Get melee damage amount
	damageEntities(targets, 10, 'physical');
	return [true, 'Fighting'];
}

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
	// if (!actor.fighter)
	// if (actor.attacker)
	const neighborTargets = getMapEntitiesNextToActor(mapEnts, actor, direction)
		.filter((ent) => ent.health);
	if (neighborTargets.length) return attack(actor, map, mapEnts, direction);
	return fire(actor, map, mapEnts, direction);
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
			message: `You move ${direction}.`,
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
				const attackRange = actor?.attacker?.range || 0;
				const fireRange = actor?.firer?.range || 0;
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
