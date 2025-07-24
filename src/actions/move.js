import { isAlive } from '../actionUtilities.js';
import { COORDINATE_MAP } from '../constants.js';
import { isHungry, eatMoveMeal } from './eat.js';

function moveSideEffects(actor, map) {
	if (actor.isAvatar && actor.mover) {
		actor.mover.movesCount = (actor.movesCount || 0) + 1;
	}
	eatMoveMeal(actor, map);
	if (typeof actor?.experience?.totalXp === 'number') {
		const { moveXpMultiplier = 0 } = map.base;
		actor.experience.totalXp += (1 * moveXpMultiplier);
	}
}

function moveOffEdge(actor, map, edge, newX, newY, direction) {
	if (!actor.exitor) return [false, 'You cannot exit.'];
	const exitValue = map.getExit(edge);
	if (exitValue instanceof Array) {
		// TODO: Use exitor.speed
		// this.moveActorMap(actor, exitValue);
		moveSideEffects(actor, map);
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
		moveSideEffects(actor, map);
		return [true, `You move ${direction}`];
	}
	return [false, 'You cannot move.'];
}

function move(actor, map, mapEnts, direction) {
	const { mover } = actor;
	if (!mover) return [false, 'You cannot move'];
	const directionCoordinates = COORDINATE_MAP[direction];
	if (!directionCoordinates) return [false, 'Invalid direction to move'];
	const newX = actor.x + directionCoordinates[0];
	const newY = actor.y + directionCoordinates[1];
	const edge = map.getOffEdge(newX, newY);
	if (edge) return moveOffEdge(actor, map, edge, newX, newY, direction); // Handle off the edge
	// Not off the edge...
	const terrainObstacleId = map.getTerrainObstacleId(newX, newY);
	// Get obstacle Ids for everything on the cell we want to move to
	const obstacleIds = [
		terrainObstacleId,
		...mapEnts
			.filter((ent) => ent.x === newX && ent.y === newY)
			.filter((ent) => !ent.isActor || isAlive(ent))
			.map((ent) => ent.obstacleId),
	];
	// Get actor's transversal values for the obstacle Ids
	const transversalValues = obstacleIds.map((obId) => mover?.transversal[obId] || 0);
	const minTransversal = Math.min(...transversalValues); // Only the lowest value matters
	if (!minTransversal) return [false, `Blocked ${direction}.`];
	actor.x = newX;
	actor.y = newY;
	moveSideEffects(actor, map);
	const HUNGRY_COOLDOWN_MULTIPLIER = 2; // TODO: Get this from config
	const cooldownMultiplier = (1 / minTransversal)
		* (isHungry(actor) ? HUNGRY_COOLDOWN_MULTIPLIER : 1);
	return {
		success: true,
		message: `You move ${direction}.`,
		cooldownMultiplier,
	};
}

export { move };
export default move;
