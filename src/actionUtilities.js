import {
	COORDINATE_MAP,
} from './constants.js';
import { distance, randIntInclusive } from './utilities.js';

/** result param can be array or object */
function parseActionResult(result = {}) {
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

function getTopEntityComponent(ents = [], componentName = '') {
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
	// console.log(alignment);
	return alignment;
}

function getDamageAmount(damage) {
	let damageAmount = 0;
	if (typeof damage === 'object') {
		damageAmount = randIntInclusive(damage[0], damage[1]);
	} else if (typeof damage === 'number') {
		damageAmount = damage;
	}
	if (Number.isNaN(damageAmount)) {
		console.error(damage, '-->', damageAmount);
		return 0;
	}
	return damageAmount;
}

function damageEntity(ent, damage, damageType) {
	const damageAmount = getDamageAmount(damage);
	ent.health.hp -= damageAmount;
	console.log('\t', ent.name, 'took', damageAmount, 'damage. HP:', ent.health.hp, damageType);
	return [damageAmount, ent.health.hp];
}

function damageEntities(ents = [], damage = 0, damageType = '') {
	const damageAmount = getDamageAmount(damage);
	const damageableEnts = ents.filter((ent) => ent.health);
	const dmgPer = Math.floor(damageAmount / damageableEnts.length);
	const leftover = damageAmount - (dmgPer * damageableEnts.length);
	const outcomes = damageableEnts.map((ent, i) => {
		return damageEntity(ent, (i === 0) ? dmgPer + leftover : dmgPer, damageType);
	});
	return outcomes;
}

function getRangedFireRange(actor) {
	if (!actor.firer || !actor.firer.natural) return 0;
	// TODO: Look at equipment
	return actor?.firer?.range || 0;
}

function isAlive(actor) {
	return actor?.health?.hp && actor?.health?.hp > 0;
}

export {
	parseActionResult,
	getMapEntitiesAt,
	getMapEntitiesAtActor,
	getMapEntitiesNextToActor,
	getTopEntityComponent,
	findNearest,
	getEntityDistance,
	getDirectionTo,
	combineSpeed,
	calcFactionAlignment,
	damageEntity,
	damageEntities,
	getRangedFireRange,
	isAlive,
};
