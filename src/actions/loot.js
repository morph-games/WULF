import { moveAllCurrencies } from '../components/currencies.js';

function lootActor(looterActor, actor) {
	moveAllCurrencies(actor, looterActor);
}

function loot() {
	// TODO: handle direction
}

export { lootActor, loot };
export default loot;
