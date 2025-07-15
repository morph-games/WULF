function hasFood(actor) {
	return (actor?.currencies?.food || 0) > 0;
}

function isHungry(actor) {
	return (actor?.eater && !hasFood(actor));
}

function eatMoveMeal(actor) {
	if (!actor?.currencies?.food || !actor?.eater?.moveMeal) return false;
	actor.currencies.food = Math.max(
		0,
		actor.currencies.food - (actor?.eater?.moveMeal || 0),
	);
	return true;
}

export { hasFood, isHungry, eatMoveMeal };
