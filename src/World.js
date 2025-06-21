import EntityTypes from './EntityTypes.js';
import EntityManager from './EntityManager.js';
import WorldMap from './WorldMap.js';
import SchedulerQueue from './SchedulerQueue.js';
import Actions from './Actions.js';

const wait = (t) => new Promise((resolve) => { setTimeout(resolve, t); });

export default class World {
	constructor(worldOptions = {}, worldComm = null) {
		this.worldComm = worldComm;
		this.entityTypes = new EntityTypes(
			worldOptions?.terrainTypes,
			worldOptions?.propTypes,
			worldOptions?.itemTypes,
			worldOptions?.actorTypes,
		);
		this.time = 0;
		this.maps = WorldMap.makeMaps(worldOptions?.maps || {});
		// const overworldMapId = this.maps.findIndex((map) => map.mapKey === 'overworld');
		// this.actors = [];
		// this.props = [];
		// this.items = [];
		this.connections = {};
		this.ents = new EntityManager(this.maps);
		this.schedulerQueues = {}; // Add objects keyed off the maps
		this.worldLog = [];
		this.deltas = [];
	}

	async load() {
		const overworldMapId = this.maps.findIndex((map) => map.mapKey === 'overworld');
		this.ents.addAvatar({
			whoId: 'my-avatar-1',
			mapId: overworldMapId,
			// mapName: 'overworld',
			x: 5,
			y: 5,
			sprite: 'spearman-0',
			health: 99,
			stats: {}, // TODO
			mountId: null,
		});
		this.time = 100; // TODO: load from disk
		// eslint-disable-next-line no-param-reassign
		this.maps.forEach((map) => { map.time = 100; }); // TODO: load from disk
	}

	// Connection-related

	connect(whoId, data = {}) {
		this.connections[whoId] = {
			visibleWorldHeight: 3,
			visibleWorldWidth: 3,
			...data,
			commandQueue: [],
		};
		// If whoId does not exist, then create them?
	}

	// Query the World

	getActor(whoId) { // TODO FIXME
		const actor = this.ents.getActor(whoId);
		if (!actor) console.warn('Could not find', whoId);
		return actor;
	}

	getActorMapId(whoId) {
		return this.getActor(whoId).mapId;
	}

	getActorMap(whoId) {
		return this.getMap(this.getActorMapId(whoId));
	}

	getMap(mapParam) {
		if (typeof mapParam === 'number') return this.maps[mapParam];
		return this.maps.find((map) => map.mapKey === mapParam);
	}

	getMapData(mapId) {
		return this.maps[mapId]?.getData() || {};
	}

	getTerrainSpriteAt(mapId, x, y) {
		const map = this.getMap(mapId);
		const ttk = map.getTerrainTypeKey(x, y);
		const s = this.entityTypes.getTerrainSpriteName(ttk);
		return s;
	}

	getPropSpriteAt(map, x, y) {
		const typeKey = map.getTopEntityType(x, y);
		return this.entityTypes.getPropSpriteName(typeKey);
	}

	getTerrainSprites(mapId, startX = 0, startY = 0, w = 10, h = 10) {
		const sprites = [];
		for (let y = 0; y < h; y += 1) {
			if (!sprites[y]) sprites[y] = [];
			for (let x = 0; x < w; x += 1) {
				sprites[y][x] = this.getTerrainSpriteAt(mapId, startX + x, startY + y);
			}
		}
		return sprites;
	}

	getPropsSprites(mapId, startX = 0, startY = 0, w = 10, h = 10) {
		const map = this.getMap(mapId);
		const sprites = [];
		for (let y = 0; y < h; y += 1) {
			if (!sprites[y]) sprites[y] = [];
			for (let x = 0; x < w; x += 1) {
				sprites[y][x] = this.getPropSpriteAt(map, startX + x, startY + y);
			}
		}
		// console.log(sprites);
		return sprites;
	}

	async getParty(whoId) {
		const { centerVisibleWorldX, centerVisibleWorldY } = this.getVisibleWorldDimensions(whoId);
		return {
			avatar: {
				...this.getActor(whoId),
				visibleWorldX: centerVisibleWorldX,
				visibleWorldY: centerVisibleWorldY,
			},
		};
	}

	getVisibleWorldDimensions(whoId) {
		const connectionData = this.connections[whoId];
		const { visibleWorldHeight, visibleWorldWidth } = connectionData;
		const who = this.getActor(whoId);
		const centerVisibleWorldX = Math.floor(visibleWorldWidth / 2);
		const centerVisibleWorldY = Math.floor(visibleWorldHeight / 2);
		const centerWorldX = who.x;
		const centerWorldY = who.y;
		const worldLeftX = centerWorldX - centerVisibleWorldX;
		const worldTopY = centerWorldY - centerVisibleWorldY;
		return {
			// "Visible world" coordinates
			w: visibleWorldWidth,
			h: visibleWorldHeight,
			centerVisibleWorldX,
			centerVisibleWorldY,
			// World coordinates
			centerWorldX,
			centerWorldY,
			worldLeftX,
			worldTopY,
		};
	}

	async getVisibleWorld(whoId) {
		if (!whoId) throw new Error('Need a whoId for getting visible world');
		const { w, h, worldLeftX, worldTopY } = this.getVisibleWorldDimensions(whoId);
		const mapId = this.getActorMapId(whoId);
		const visibleWorld = {
			terrain: {
				sprites: this.getTerrainSprites(mapId, worldLeftX, worldTopY, w, h),
			},
			props: {
				sprites: this.getPropsSprites(mapId, worldLeftX, worldTopY, w, h),
			},
			items: [],
			actors: [],
		};
		return visibleWorld;
	}

	// Communications

	updateAllClients() {
		Object.keys(this.connections).forEach((connKey) => this.updateClient(connKey));
	}

	async updateClient(whoId) {
		const visibleWorld = await this.getVisibleWorld(whoId);
		const party = await this.getParty(whoId);
		this.worldComm.sendDataToClient({ visibleWorld, party });
	}

	// Simulate

	/**
	 * Performs actions that an actor may have queued up.
	 * - All actions happen in zero time, but they may have a warmup action before they trigger,
	 * and usually have a cooldown afterwards.
	 * @returns a delta for the world (WIP)
	 */
	async performAction(who, mapTime) {
		const { mapId, whoId } = who;
		// Let's check first because it takes effort to find all the entities on the map
		if (!Actions.hasReadyAction(who, mapTime)) {
			return null;
		}
		const map = this.getMap(mapId);
		const mapEnts = this.ents.getEntitiesOnMap(mapId);
		const [success, message, followUp] = Actions.perform(who, map, mapEnts, mapTime);
		if (followUp) { // World methods that need to be called afterwards
			this[followUp[0]](...followUp.slice(1));
		}
		if (this.connections[whoId]) await this.updateClient(whoId);
		// console.log(success, message);
		// Return a "delta" (WIP)
		return { mapId, mapTime, success, message, whoId, worldTime: this.time };
	}

	getSimMapIds() {
		return this.ents.getAvatarMapIds();
	}

	async sim(tStep = 1) {
		this.time += tStep;
		let stops = 0;
		console.log('world sim', this.time);
		const mapIds = this.getSimMapIds();
		for (let i = 0; i < mapIds.length; i += 1) {
			const mapId = mapIds[i];
			const map = this.getMap(mapId);
			// Keep simulating the map until we catch up with world time, or we are asked to stop
			let stop = false;
			while (map.time < this.time && !stop) {
				stop = await this.simMap(mapId, tStep);
			}
			if (stop) stops += 1;
		}
		console.log('world sim stops:', stops);
		if (stops) {
			this.updateAllClients();
		} else {
			await wait(20);
			this.sim(tStep);
		}
	}

	async simMap(mapId, tStep) {
		const map = this.getMap(mapId);
		map.time = Math.min(this.time, map.time + tStep);
		console.log('\tMap', mapId, 'sim', map.time);

		const actors = this.ents.getActorsOnMap(mapId);
		if (!this.schedulerQueues[mapId]) {
			this.schedulerQueues[mapId] = new SchedulerQueue(actors);
		}
		const q = this.schedulerQueues[mapId];
		const topActor = q.top();
		if (Actions.isWaitingForAction(topActor, map.time)) {
			// If avatar is next in line but doesn't have an action to perform,
			// then stop and wait for input
			if (topActor.isAvatar) {
				console.log('\tTop actor is avatar and has nothing to do.', topActor);
				return true;
			}
			// TODO: Do thinking then enqueue
			Actions.enqueue(topActor, 'move', 'left');
		}
		const delta = await this.performAction(topActor, map.time);
		if (!delta) return false; // Didn't do anything - just leave
		// If delta was not a success, then assume it did not change the world, and don't bother
		// tracking it
		if (delta.success) this.deltas.push(delta);
		// action may have changed cooldowns, so need to resort
		q.sort();
		return false;
	}

	// Perform secondary actions

	moveActorMap(who, exitArray = [], isRelativeCoords = false) {
		const [mapName, x, y] = exitArray;
		const newMap = this.getMap(mapName);
		who.mapId = newMap.id;
		if (isRelativeCoords) {
			if (typeof x === 'number' && typeof y === 'number') {
				who.x += x;
				who.y += y;
			} else {
				console.error('invalid coordinates');
			}
			return;
		}
		if (typeof x === 'number' && typeof y === 'number') {
			who.x = x;
			who.y = y;
		} else {
			const [entranceX, entranceY] = newMap.getEntranceCoordinates();
			who.x = entranceX;
			who.y = entranceY;
		}
	}

	// Commands
	/* eslint-disable class-methods-use-this, no-param-reassign */

	engage(who, direction) {
		// Enter or talk
		// TODO: Determine if this should be entering or talking
		return this.enter(who);
	}

	enter(who) {
		const map = this.getMap(who.mapId);
		const enterValue = map.getTopProperty('enter', who.x, who.y);
		if (!enterValue) {
			const [successfulClimb, message] = this.klimb(who);
			if (successfulClimb) return [true, message];
			return [false, 'There is nothing to enter.'];
		}
		this.moveActorMap(who, enterValue);
		return [true, `You enter ${map.getName()}.`];
	}

	klimb(who, direction) {
		const map = this.getMap(who.mapId);
		const klimbDirection = map.getTopProperty('klimb', who.x, who.y);
		if (!klimbDirection) {
			return [false, 'There is nothing to climb here.'];
		}
		if (direction && klimbDirection !== direction) {
			return [false, `Cannot climb ${direction} here.`];
		}
		const exitValue = map.getExit(klimbDirection);
		if (!exitValue) {
			return [false, 'Cannot exit the area.'];
		}
		this.moveActorMap(who, exitValue, true);
		return [true, `You climb ${klimbDirection}.`];
	}

	move1(who, direction) {
		// TODO: add time cost
		const coordinateMap = {
			up: [0, -1],
			down: [0, 1],
			left: [-1, 0],
			right: [1, 0],
		};
		const coordinates = coordinateMap[direction];
		if (!coordinates) {
			return [false, 'Invalid direction to move'];
		}
		const newX = who.x + coordinates[0];
		const newY = who.y + coordinates[1];
		const map = this.getMap(who.mapId);
		const edge = map.getOffEdge(newX, newY);
		if (!edge) {
			who.x = newX;
			who.y = newY;
			return [true, `You move ${direction}`];
		}
		const exitValue = map.getExit(edge);
		if (exitValue instanceof Array) {
			this.moveActorMap(who, exitValue);
			return [true, 'You leave.'];
		}
		if (exitValue === 'BLOCK') {
			return [false, `Blocked ${direction}.`];
		}
		if (exitValue === 'LOOP') {
			const [x, y] = map.getLoopedCoordinates(newX, newY);
			who.x = x;
			who.y = y;
			return [true, `You move ${direction}`];
		}
		return [false, 'You cannot move.'];
	}

	ping() { return [true, 'ping']; } // eslint-disable-line class-methods-use-this

	/**
	 * Commands are messages from the client/game telling the world/server to do something.
	 * Often the commands are actions that the avatar should do. Sometimes they are just
	 * requests for information or things that are not performed by the avatar.
	 */
	async runCommand(commandStringOrArray, whoId) {
		const commandWords = (commandStringOrArray instanceof Array)
			? [...commandStringOrArray]
			: String(commandStringOrArray).toLowerCase().split(' ');
		const aliases = {
			hole: 'camp',
			inform: 'investigate',
			search: 'investigate',
			steal: 'pickpocket',
			wear: 'ready',
			equip: 'ready',
			exit: 'dismount',
			mount: 'board',
			stats: 'ztats',
			go: 'move',
		};
		const aliasCommand = aliases[commandWords[0]];
		if (aliasCommand) commandWords[0] = aliasCommand;
		const firstCommand = commandWords[0];

		// These are commands that are not actions, but the player is allowed to run
		const ALLOWED_WORLD_COMMANDS = [
			'chat',
			'descend', // alias for klimb down
			'engage', // enter or talk
			'exit', // alias for dismount
			'karma', // get karma score?
			'look', // (direction)
			'map',
			'navigate', // but maybe add cooldown time?
			'party', // but maybe add cooldown time?
			'quicksave',
			'quit',
			'view', // (?)
			'zstats',
		];

		const commandParams = commandWords.slice(1);
		const who = this.getActor(whoId);

		if (this[firstCommand]) {
			if (!ALLOWED_WORLD_COMMANDS.includes(firstCommand)) {
				return { success: false, message: `Command not allowed '${firstCommand}'` };
			}
			const [success, message] = await this[firstCommand](who, ...commandParams);
			this.sim();
			return { success, message };
		}

		if (Actions.has(firstCommand)) {
			if (!who.action) return { success: false, message: `${whoId} cannot do actions.` };
			Actions.enqueue(who, firstCommand, commandParams.join(' '));
			this.sim();
			return { success: true, message: 'Action queued' };
		}

		console.error('Invalid command', firstCommand);
		return { success: false, message: `Invalid command '${firstCommand}'` };
	}
}
