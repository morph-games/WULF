function talk(actor, map, mapEnts, direction, actions) {
	const transactResult = actions.runAction('transact', actor, map, mapEnts, direction);
	if (transactResult.success) return transactResult;
	// TODO: Do talking
	return [false, `Talk ${direction} not yet implemented.`];
}

export { talk };
export default talk;
