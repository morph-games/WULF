import { getTopEntityComponent, getMapEntitiesAtActor, parseActionResult } from '../actionUtilities.js';

function enter(actor, map, mapEnts) {
	if (!actor.enterer) return [false, 'You cannot enter.'];
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
	// TODO: use enterer.speed
	return {
		success: true,
		message: 'You enter a new location.',
		// quiet: true,
		followUp: ['moveActorMap', actor, enterArray],
	};
}

export { enter };
export default enter;
