import { clamp } from './utilities.js';

// Tab 0: User is "Buying", but shop is "sell"
// Tab 1: User is "Selling", but shop is "buy"
const TABS = ['sell', 'buy'];

export default class GameShop {
	constructor(shopObj) {
		this.shopName = shopObj.shopName || 'Shop';
		this.sell = shopObj.sell;
		this.buy = shopObj.buy;
		this.transaction = { buy: [], sell: [] };
		this.maxIndex = 10; // FIXME
		// Current interface values
		this.tabIndex = 0;
		this.index = 0;
	}

	add(n = 1) {
		const side = TABS[this.tabIndex];
		const transactionSide = this.transaction[side];
		let quantity = 255;
		if (side === 'sell') {
			const stockItem = this.sell.stock[this.index];
			[,,, quantity] = stockItem;
		}
		transactionSide[this.index] = clamp(
			((transactionSide[this.index] || 0) + n),
			0,
			quantity,
		);
	}

	subtract(n = 1) {
		this.add(-n);
	}

	tab(n = 1) {
		this.tabIndex = (TABS.length + this.tabIndex + n) % TABS.length;
	}

	next(n = 1) {
		const side = TABS[this.tabIndex];
		const max = (side === 'sell') ? this.sell.stock.length : this.maxIndex;
		this.index = (max + this.index + n) % max;
	}

	getTextLines() {
		const { shopName = 'Shop', sell = {}, transaction = {} } = this;
		let tabs = '';
		let details = [];
		if (this.tabIndex === 0) {
			tabs = ' Tab =  (Buy)   Sell ';
			details = sell.stock.map((stockItem, i) => {
				const [name, type, price, quantity] = stockItem;
				const cursor = (i === this.index) ? '> ' : '  ';
				return [
					cursor,
					name.padEnd(14, '.'),
					String(transaction.sell[i] || 0).padStart(3, ' '),
					'/',
					String(quantity).padEnd(4, ' '),
					`${price} gp`,
				].join('');
			});
		} else if (this.tabIndex === 1) {
			tabs = ' Tab =   Buy   (Sell) ';
			details = ['', '(your inventory goes here)', ''];
		}
		return [
			`--- ${shopName} ---`, '',
			tabs, '',
			...details,
			'',
			' (t) = Talk instead',
			' Up/Dn/W/S = Cycle between items',
			' Space = Select item',
			' (+/-) = Add or remove items',
			' Enter = Complete transaction',
		];
	}
}
