import { clamp } from './utilities.js';

// Tab 0: User is "Buying", but shop is "sell"
// Tab 1: User is "Selling", but shop is "buy"
const TABS = ['sell', 'buy'];

export default class GameShop {
	constructor(shopObj, sellingInventory) {
		this.shopName = shopObj.shopName || 'Shop';
		this.entId = shopObj.entId || console.warn('No entId for shop');
		this.sell = shopObj.sell;
		this.buy = shopObj.buy;
		// What the shop is agreeing to buy or sell
		this.transaction = { buy: [], sell: [], complete: false };
		// Current interface values
		this.tabIndex = 0;
		this.indices = [0, 0];
		this.sellingInventory = sellingInventory || []; // What the player is selling
		this.helpOn = false;
	}

	add(n = 1) {
		if (this.transaction.complete) return;
		const side = TABS[this.tabIndex];
		const transactionSide = this.transaction[side];
		let quantity = 255;
		const index = this.indices[this.tabIndex];
		if (side === 'sell') {
			const stockItem = this.sell.stock[index];
			[,,, quantity] = stockItem;
		} else { // Each item is currently unique so the shop can only buy one of each
			quantity = 1;
		}
		transactionSide[index] = clamp(
			((transactionSide[index] || 0) + n),
			0,
			quantity,
		);
	}

	subtract(n = 1) {
		this.add(-n);
	}

	tab(inc = 1) {
		this.tabIndex = (TABS.length + this.tabIndex + inc) % TABS.length;
	}

	next(inc = 1) {
		const side = TABS[this.tabIndex];
		const max = (side === 'sell') ? this.sell.stock.length : this.sellingInventory.contents.length;
		const index = this.indices[this.tabIndex];
		this.indices[this.tabIndex] = (max + index + inc) % max;
	}

	toggleHelp() {
		this.helpOn = !this.helpOn;
	}

	/** Get price that the shop will buy an item at */
	getBuyPrice(item) {
		// TODO
		return 10;
	}

	getTransactionAmount() {
		const { buy = [], sell = [] } = this.transaction;
		let total = 0;
		sell.forEach((n, i) => {
			const [,, price] = this.sell.stock[i];
			total -= price * n;
		});
		buy.forEach((n, i) => {
			const item = this.sellingInventory[i];
			const price = this.getBuyPrice(item);
			total += price * n;
		});
		return total;
	}

	getTextLines() {
		const { shopName = 'Shop', sell = {}, transaction = {} } = this;
		let tabs = '';
		let details = [];
		const index = this.indices[this.tabIndex];
		if (this.tabIndex === 0) {
			tabs = ' (Tab)  -BUY-   Sell ';
			details = sell.stock.map((stockItem, i) => {
				const [name, , price, quantity] = stockItem;
				const canAdd = !transaction.sell[i] || transaction.sell[i] < quantity;
				const canRemove = transaction.sell[i] > 0;
				const cursor = (i === index) ? `${canRemove ? '<' : ' '}${canAdd ? '>' : ' '}` : '  ';
				return [
					cursor,
					' ',
					name.padEnd(14, '.'),
					String(transaction.sell[i] || 0).padStart(3, ' '),
					'/',
					String(quantity).padEnd(4, ' '),
					String(price).padStart(4, ' '),
					' c.',
				].join('');
			});
		} else if (this.tabIndex === 1) {
			tabs = ' (Tab)   Buy   -SELL- ';
			const { contents = [] } = this.sellingInventory;
			if (contents.length === 0) {
				details = ['', '', 'You have nothing in your inventory.', '', ''];
			} else {
				const quantity = 1;
				details = contents.map((item, i) => {
					const canAdd = !transaction.buy[i] || transaction.buy[i] < quantity;
					const canRemove = transaction.buy[i] > 0;
					const cursor = (i === index) ? `${canRemove ? '<' : ' '}${canAdd ? '>' : ' '}` : '  ';
					return [
						cursor,
						' ',
						item.name.padEnd(14, '.'),
						String(transaction.buy[i] || 0).padStart(3, ' '),
						String(this.getBuyPrice(item)).padStart(4, ' '),
						' c.',
						canRemove ? ' SELL' : '     ',
					].join('');
				});
			}
		}
		details.length = 10;
		const finalAmount = this.getTransactionAmount();
		const finalAmountString = finalAmount > 0 ? `+${finalAmount}` : String(finalAmount);
		const finalLine = [
			' Transaction:',
			String(finalAmountString).padStart(12, ' '),
			' coins',
		].join('');
		const helpLines = (this.helpOn) ? [
			' (Enter) Complete transaction',
			' (Esc) Cancel transaction',
			' (Up/Down/W/S) Select item',
			' (Left/Right/A/D) Add/remove item',
			' (t) Talk instead',
		] : [' (Enter) Complete (t) Talk (?) Help'];
		return [
			`--- ${shopName} ---`, '',
			tabs, '',
			...details,
			'',
			finalLine,
			'',
			...helpLines,
		];
	}

	completeTransaction() {
		this.transaction.complete = true;
		const { buy = [], sell = [] } = this.transaction;
		if (!buy.length && !sell.length) return '';
		const getIndexXQuantityCSV = (arr) => (
			arr.map((n, i) => (n ? `${i}x${n}` : null)).filter((n) => n).join(',')
		);
		// const sellCommand = (sell.length) ? `sell ${this.entId} ${getIndexXQuantityCSV(sell)}` : '';
		// const buyCommand = (buy.length) ? `buy ${this.entId} ${getIndexXQuantityCSV(buy)}` : '';
		const params = [];
		// "+" Character buys, Shop sells
		if (sell.length) params.push(`+${getIndexXQuantityCSV(sell)}`);
		// "-" Character sells, Shop buys
		if (buy.length) params.push(`-${getIndexXQuantityCSV(buy)}`);
		return `transact ${this.entId} ${params.join(' ')}`;
	}
}
