import EntityTypes from './EntityTypes.js';
import EntityManager from './EntityManager.js';
import WorldMap from './WorldMap.js';
import SchedulerQueue from './SchedulerQueue.js';
import WorldSaveLoadManager from './WorldSaveLoadManager.js';
import Actions from './Actions.js';
import { isAlive } from './actionUtilities.js';
import { wait } from './utilities.js';

export default class World {
	constructor(worldOptions = {}, actionConfig = {}, worldComm = null) {
		this.worldComm = worldComm;
		this.entityTypes = new EntityTypes(worldOptions?.entityTypes);
		this.actions = new Actions(actionConfig, worldOptions?.timing);
		this.time = 0;
		this.maps = WorldMap.makeMaps(
			worldOptions?.maps || {},
			worldOptions?.globalLegend,
			this.entityTypes,
		);
		// const overworldMapId = this.maps.findIndex((map) => map.mapKey === 'overworld');
		// this.actors = [];
		// this.props = [];
		// this.items = [];
		this.connections = {};
		this.ents = new EntityManager(this.entityTypes);
		this.schedulerQueues = {}; // Add objects keyed off the maps
		this.worldLog = [];
		this.deltas = [];
		this.maxDeltas = 99;
		this.ents.allAllFromMaps(this.maps);
		this.saveLoadManager = new WorldSaveLoadManager();
	}

	async load() {
		const overworldMapId = this.maps.findIndex((map) => map.mapKey === 'overworld');
		this.ents.addAvatar({
			type: 'avatar',
			whoId: 'my-avatar-1',
			mapId: overworldMapId,
			x: 10,
			y: 6,
			stats: {}, // TODO
		});
		this.time = 100; // TODO: load from disk
		// eslint-disable-next-line no-param-reassign
		this.maps.forEach((map) => { map.time = this.time; }); // TODO: load from disk
		this.ents.getActors().forEach((actor) => { // TODO: Remove this if we load ents from disk
			actor.action.cooldown = this.time; // eslint-disable-line no-param-reassign
		});
		this.updateAllClients();

		await this.saveLoadManager.setup();
		this.save();
	}

	async save() {
		await this.saveLoadManager.saveWorld(this, 'test-save');
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

	// FIXME: Do this different - this is very inefficient
	getEntitySpriteAt(map, x, y) {
		const mapEnts = this.ents.getEntitiesOnMap(map.id);
		const entHere = mapEnts.find((ent) => ent.x === x && ent.y === y);
		return (entHere) ? entHere.sprite : '';
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
		// const ents = this.ents.getEntitiesOnMap(mapId);
		for (let y = 0; y < h; y += 1) {
			if (!sprites[y]) sprites[y] = [];
			for (let x = 0; x < w; x += 1) {
				sprites[y][x] = this.getEntitySpriteAt(map, startX + x, startY + y);
			}
		}
		return sprites;
	}

	makeVisibleThing(ent, startX, startY) { // eslint-disable-line class-methods-use-this
		return [ent.sprite, ent.x - startX, ent.y - startY];
	}

	async getParty(whoId) {
		const { centerVisibleWorldX, centerVisibleWorldY } = this.getVisibleWorldDimensions(whoId);
		const avatarActor = this.getActor(whoId);
		return {
			avatar: {
				...avatarActor,
				sprite: isAlive(avatarActor) ? avatarActor.sprite : avatarActor.deadSprite,
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
		// const map = this.getMap(mapId);
		const allVisibleEnts = this.ents.getEntitiesOnMapRange(mapId, worldLeftX, worldTopY, w, h);
		const visibleWorld = {
			terrain: {
				sprites: this.getTerrainSprites(mapId, worldLeftX, worldTopY, w, h),
			},
			props: allVisibleEnts
				.filter((ent) => ent.isProp || ent.isDestination)
				.map((ent) => this.makeVisibleThing(ent, worldLeftX, worldTopY)),
			items: allVisibleEnts
				.filter((ent) => ent.isItem)
				.map((ent) => this.makeVisibleThing(ent, worldLeftX, worldTopY)),
			actors: allVisibleEnts
				.filter((ent) => ent.isActor)
				.map((ent) => {
					const visibleActor = this.makeVisibleThing(ent, worldLeftX, worldTopY);
					return isAlive(ent) ? visibleActor
						: [ent.deadSprite, visibleActor[1], visibleActor[2]];
				}),
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
		this.worldComm.sendDataToClient({ visibleWorld, party, deltas: this.deltas });
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
		const { success, message, followUp, quiet } = this.actions.perform(who, map, mapEnts, mapTime);
		// console.log('Performed action', who.whoId, success, message);
		if (followUp) { // World methods that need to be called afterwards
			this[followUp[0]](...followUp.slice(1));
		}
		if (this.connections[whoId]) await this.updateClient(whoId);
		// console.log(success, message);
		// Return a "delta" (WIP)
		return { mapId, mapTime, success, message, quiet, whoId, worldTime: this.time };
	}

	getSimMapIds() {
		return this.ents.getAvatarMapIds();
	}

	async sim(tStep = 1) {
		this.time += tStep;
		let stops = 0;
		// console.log('world sim', this.time);
		const mapIds = this.getSimMapIds();
		for (let i = 0; i < mapIds.length; i += 1) {
			const mapId = mapIds[i];
			const map = this.getMap(mapId);
			// Keep simulating the map until we catch up with world time, or we are asked to stop
			let stop = false;
			let timeDiff;
			while (map.time < this.time && !stop) {
				timeDiff = this.time - map.time;
				// If we want to allow full simulation to catch-up to world time, then
				// we can change the tStep for simMap here to world's tStep (1) rather than
				// using this diff.
				stop = await this.simMap(mapId, timeDiff); // eslint-disable-line no-await-in-loop
			}
			if (stop) stops += 1;
		}
		// console.log('world sim stops:', stops);
		if (stops) {
			this.updateAllClients();
		} else {
			await wait(10);
			this.sim(tStep);
		}
	}

	async simMap(mapId, tStep) {
		if (tStep < 0) throw new Error('Invalid time step');
		if (tStep > 1) console.log('Simulating map', tStep, 'steps to get to', this.time);
		const map = this.getMap(mapId);
		map.time = Math.min(this.time, map.time + tStep);
		// console.log('\tMap', mapId, 'sim', map.time);

		const actors = this.ents.getActorsOnMap(mapId);
		if (!this.schedulerQueues[mapId]) {
			this.schedulerQueues[mapId] = new SchedulerQueue(actors);
		}
		const q = this.schedulerQueues[mapId];
		const topActor = q.top();
		// Is the top actor's action queue empty? If so, then they need to make a plan
		if (Actions.isWaitingForAction(topActor, map.time)) {
			// If avatar is next in line but doesn't have an action to perform,
			// then stop and wait for input
			if (topActor.isAvatar) {
				console.log('Map Sim', map.time, 'Top actor is avatar and has nothing to do.');
				return true;
			}
			this.actions.enqueuePlan(topActor);
			// console.log('Map Sim', map.time, topActor.name, 'queued a plan', topActor.action.cooldown);
		}
		// console.log('Map Sim', map.time, topActor.name, topActor.whoId,
		// 'performing action', topActor.action);
		const delta = await this.performAction(topActor, map.time);
		if (delta) {
			if (delta.quiet) {
				// If delta was not a success, we could assume it did not change the world, and
				// don't need to  track it, but then we wouldn't display failed actions to the user
				// so we also have to consider 'quiet'.
			} else {
				this.deltas.push(delta);
				if (this.deltas.length > this.maxDeltas) {
					this.deltas.splice(0, this.deltas.length - this.maxDeltas);
				}
			}
		}
		// action or planning may have changed cooldowns, so need to resort
		q.sort();
		return false;
	}

	// Perform secondary actions

	moveActorMap(who, exitArray = [], isRelativeCoords = false) {
		/* eslint-disable no-param-reassign */
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
		/* eslint-enable no-param-reassign */
	}

	// Commands

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
			'exit', // alias for dismount
			'karma', // get karma score?
			'look', // (direction)
			'map',
			'navigate', // but maybe add cooldown time?
			'party', // but maybe add cooldown time?
			'ping',
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
			console.log('World enqueue action:', firstCommand, commandParams);
			this.actions.enqueue(who, firstCommand, commandParams.join(' '));
			this.sim();
			return { success: true, message: 'Action queued' };
		}

		console.error('Invalid command', firstCommand);
		return { success: false, message: `Invalid command '${firstCommand}'` };
	}
}
