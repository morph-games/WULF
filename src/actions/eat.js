function hasFood(actor) {
	return (actor?.currencies?.food || 0) > 0;
}

function isHungry(actor) {
	return (actor?.eater && !hasFood(actor));
}

function eatMoveMeal(actor, map) {
	if (!actor?.currencies?.food || !actor?.eater?.moveMeal) return false;
	const { moveMealMultiplier = 1 } = map.base;
	const eatAmount = (actor?.eater?.moveMeal || 0) * moveMealMultiplier;
	actor.currencies.food = Math.max(0, actor.currencies.food - eatAmount);
	return true;
}

export { hasFood, isHungry, eatMoveMeal };
