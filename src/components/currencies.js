import { randIntInclusive } from '../utilities.js';

function moveAllCurrencies(source, destination) {
	if (!source.currencies || !destination.currencies) return;
	Object.entries(source.currencies).forEach(([currKey, value]) => {
		destination.currencies[currKey] = (destination.currencies[currKey] || 0)
			+ value;
		source.currencies[currKey] = 0;
	});
}

function generateCurrencies(ent) {
	if (!ent.currencies) return;
	Object.entries(ent.currencies).forEach(([currKey, value]) => {
		if (!(value instanceof Array)) return;
		ent.currencies[currKey] = randIntInclusive(value[0] || 0, value[1] || 0);
	});
}

export { moveAllCurrencies, generateCurrencies };
