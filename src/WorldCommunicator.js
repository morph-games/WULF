import World from './World.js';
import Observer from './Observer.js';

export default class WorldCommunicator extends Observer {
	constructor(localWorldOptions) {
		super();
		this.localWorld = null;
		this.visibleWorldHeight = 0;
		this.visibleWorldWidth = 0;
		if (localWorldOptions) {
			this.startLocalWorld(localWorldOptions);
		}
	}

	async startLocalWorld(worldOptions) {
		this.localWorld = new World(worldOptions, this);
		window.world = this.localWorld;
		// await this.localWorld.load();
	}

	async connect(whoId, visibleWorldWidth, visibleWorldHeight) {
		this.localWorld.connect(
			whoId,
			{
				visibleWorldHeight,
				visibleWorldWidth,
			},
		);
	}

	async load() {
		await this.localWorld.load();
	}

	async sendCommandToWorld(commandStringOrArray, whoId) {
		if (!commandStringOrArray) {
			console.warn('Cannot send a blank command');
			return [];
		}
		if (!whoId) throw new Error('Must send a command on behalf of a user (whoId missing)');
		const outcome = await this.localWorld.runCommand(commandStringOrArray, whoId);
		const visibleWorld = await this.localWorld.getVisibleWorld(whoId);
		const party = await this.localWorld.getParty(whoId);
		return [outcome, visibleWorld, party];
	}

	async sendDataToClient(data) {
		this.trigger('data', data);
	}
}
