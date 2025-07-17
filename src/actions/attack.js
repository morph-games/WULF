import { damageEntities, getMapEntitiesNextToActor, isAlive } from '../actionUtilities.js';
import { lootActor } from './loot.js';
import { gainKillXp } from '../components/experience.js';

function getMeleeAttackDamage(actor) {
	if (!actor.attacker) return [0, ''];
	const naturalDmg = actor.attacker?.natural.damage || 0;
	const maxNaturalDmg = (typeof naturalDmg === 'number') ? naturalDmg : naturalDmg[1] || 0;
	// TODO: Look at equipment
	const equipmentDmg = 0;
	const equipmentDmgType = '';
	const maxEquipmentDmg = 0;

	if (maxNaturalDmg > maxEquipmentDmg) {
		return [naturalDmg, actor.attacker?.natural.damageType || ''];
	}
	return [equipmentDmg, equipmentDmgType];
}

function getMeleeAttackRange(actor) {
	return actor?.attacker?.range || 0; // TODO: Look at equipment and natural attack
}

/** Melee Attack */
function attack(actor, map, mapEnts, direction) {
	let targets = getMapEntitiesNextToActor(mapEnts, actor, direction);
	if (!targets.length) return [true, `No one to fight (${direction}).`];
	targets = targets.filter((ent) => isAlive(ent));
	if (!targets.length) return [true, `No effect! (fight ${direction})`];
	const [dmg, type] = getMeleeAttackDamage(actor);
	const damageOutcomes = damageEntities(targets, dmg, type); // TODO: Make 'damage' an action?
	const damageAmounts = damageOutcomes.map((outcome) => (outcome[0]));
	const dmgDisplay = damageAmounts.join(',');
	// Look for kills from the attack
	let kills = 0;
	targets.forEach((target) => {
		if (isAlive(target)) return;
		kills += 1;
		// Handle kills
		// TODO: Whether or not we auto-loot should be a world-based config
		lootActor(actor, target);
		gainKillXp(actor, target);
	});
	let killText = '';
	if (kills === 1) killText = ` and kill ${targets[0].name}`;
	else if (kills > 1) killText = ` and kill ${kills} enemies`;
	return [true, `Attack for ${dmgDisplay} damage${killText}`];
}

export { attack, getMeleeAttackDamage, getMeleeAttackRange };
export default attack;
