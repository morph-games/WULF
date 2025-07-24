import { getMapEntitiesNextToActor, isAlive } from '../actionUtilities.js';
import { randIntInclusive, stringToNumber } from '../utilities.js';

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
	const { sell = {} } = shopObj;
	if (sell.stock) return shopObj;
	const sellingTypes = sell.types.filter((type, i) => {
		if (!sell.gateByMovesCount) return true;
		return (stepCount >= sell.gateByMovesCount?.[i] || 0);
	});
	sell.stock = sellingTypes.map((type, i) => {
		const item = map.entityTypes.createUntrackedEntityByType(type);
		const price = getEntityValue(item);
		const quantity = (sell.quantity?.[i] === 0)
			? 0 : sell.quantity?.[i] || randIntInclusive(1, DEFAULT_STOCK_QUANTITY);
		return [item.name, type, price, quantity];
	});
	return shopObj;
}

function restockShop(shopObj = {}, map = null, stepCount = 0) {
	shopObj.stock = false;
	return addStockToShop(shopObj, map, stepCount);
}

function addBuyPricesToShop(shopObj = {}, map = null) {
	// const { sell = {}, markUp = 2 } = shopObj;
	// const buyPrice = Math.round(getEntityValue(item) / markUp);
	// TODO
}

/** Buy something from shopActor's stock, to the actor's inventory */
function buy(actor, shopActor, stockIndex, quantity = 1) {
	// TODO WIP
}

/** Sell something from actor's inventory to the shopActor's stock */
function sell(actor, shopActor, inventoryIndex, quantity = 1) {
	// TODO WIP
}

function transact(actor, map, mapEnts, paramsString, actions) {
	const params = paramsString.split(' ');
	const directionOrEntId = params.shift();
	const targets = getMapEntitiesNextToActor(mapEnts, actor, directionOrEntId)
		.filter((ent) => isAlive(ent));
	if (!targets.length) return [true, `No one to transact (${directionOrEntId}).`];
	const shopActor = targets[0];
	if (!shopActor.shop) return [true, `${shopActor.name} does not buy or sell.`];
	const shop = structuredClone(shopActor.shop);
	shop.entId = shopActor.entId;
	addStockToShop(shop, map);
	addBuyPricesToShop(shop, map);
	// Transacting is a two-way action, so we cool-down the shop keeper
	// Also we want to slow down the shopkeeper so they don't move away
	actions.coolDownActor(shopActor, 'transact');
	const transactionParams = params.filter((str) => str[0] === '+' || str[0] === '-');
	if (!transactionParams.length) {
		return {
			success: true,
			message: `${shopActor.name} shows what they buy and sell...`,
			deltaData: { shop },
		};
	}
	// We have some params, so we're doing transactions
	let buyCount = 0;
	let sellCount = 0;
	transactionParams.forEach((param) => {
		const type = ({ '+': 'buy', '-': 'sell' })[param.substr(0, 1)];
		const transaction = param.substr(1).split(',')
			.map((str) => {
				const [stockIndex, quantity = 1] = str.split('x');
				return [stringToNumber(stockIndex), stringToNumber(quantity) || 0];
			})
			.filter(([stockIndex, quantity]) => {
				return typeof stockIndex === 'number' && quantity && quantity > 0;
			});
		const [index, quantity] = transaction;
		if (type === 'buy') {
			if (buy(actor, shopActor, index, quantity)) buyCount += 1;
		} else if (type === 'sell') {
			if (sell(actor, shopActor, index, quantity)) sellCount += 1;
		}
	});
	return [true, `Bought: ${buyCount}, Sold: ${sellCount}`];
}

export { addStockToShop, restockShop, getEntityValue, transact };
export default transact;
