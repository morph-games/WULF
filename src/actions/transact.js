import { getMapEntitiesNextToActor, isAlive } from '../actionUtilities.js';

function transact(actor, map, mapEnts, direction) {
	const targets = getMapEntitiesNextToActor(mapEnts, actor, direction)
		.filter((ent) => isAlive(ent));
	if (!targets.length) return [true, `No one to transact (${direction}).`];
	const shop = targets[0];
	if (!shop.seller && !shop.buyer) {
		return [true, `${shop.name} does not buy or sell.`];
	}
	// TODO: ???
	return [true, 'Buy/sell not implemented'];
}

export { transact };
export default transact;
