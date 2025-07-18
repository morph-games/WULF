import { getMapEntitiesNextToActor, isAlive } from '../actionUtilities.js';

const DEFAULT_STOCK_QUANTITY = 10;

function getEntityValue(ent = {}) {
	let value = 1;
	value += (ent.attackable?.damage || 0) * 1;
	value += (ent.attackable?.range || 0) * 2;
	value += (ent.buff?.spellDamageBonus || 0) * 5;
	value += (ent.buff?.defense || 0) * 5;
	const { valueMultiplier = 1 } = ent.valuable;
	return Math.max(0, Math.round(value * valueMultiplier));
}

/** Mutates a shop object to add sell stock */
function addStockToShop(shopObj = {}, map = null, stepCount = 0) {
	const { sell = {}, markUp = 2 } = shopObj;
	if (sell.stock) return shopObj;
	const sellingTypes = sell.types.filter((type, i) => {
		if (!sell.gateByMovesCount) return true;
		return (stepCount >= sell.gateByMovesCount?.[i] || 0);
	});
	sell.stock = sellingTypes.map((type, i) => {
		const item = map.entityTypes.createEntityByType(type);
		const price = Math.round(getEntityValue(item) / markUp);
		const quantity = (sell.quantity?.[i] === 0)
			? 0 : sell.quantity?.[i] || DEFAULT_STOCK_QUANTITY;
		return [item.name, type, price, quantity];
	});
	return shopObj;
}

function restockShop(shopObj = {}, map = null, stepCount = 0) {
	shopObj.stock = false;
	return addStockToShop(shopObj, map, stepCount);
}

function transact(actor, map, mapEnts, direction) {
	const targets = getMapEntitiesNextToActor(mapEnts, actor, direction)
		.filter((ent) => isAlive(ent));
	if (!targets.length) return [true, `No one to transact (${direction}).`];
	const shopActor = targets[0];
	if (!shopActor.shop) return [true, `${shopActor.name} does not buy or sell.`];
	const shop = structuredClone(shopActor.shop);
	addStockToShop(shop, map);
	return {
		success: true,
		message: `${shopActor.name} shows what they buy and sell...`,
		deltaData: { shop },
	};
}

export { addStockToShop, restockShop, getEntityValue, transact };
export default transact;
