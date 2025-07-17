import { eatMoveMeal } from './eat.js';

function pass(actor, map /* , mapEnts, direction */) {
	eatMoveMeal(actor, map);
	return [true, 'You wait a moment.'];
}

export { pass };
export default pass;
