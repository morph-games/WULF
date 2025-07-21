import { damageEntities, getMapEntitiesNextToActor, isAlive } from '../actionUtilities.js';
import { lootActor } from './loot.js';
import { gainKillXp } from '../components/experience.js';
import { getEquippedItems } from '../components/equipment.js';

function getMeleeAttackDamage(actor) {
	if (!actor.attacker) return [0, ''];
	// Get natural attack and compare to item attack
	const naturalDmg = actor.attacker?.natural.damage || 0;
	const maxNaturalDmg = (typeof naturalDmg === 'number') ? naturalDmg : naturalDmg[1] || 0;
	const equippedItems = getEquippedItems(actor);
	const attackingItem = equippedItems.find((item) => item?.attackable?.damage);
	// TODO: ^ Don't take first found. Look at all and take the best
	const { damage = 0, type = '' } = attackingItem?.attackable || {};
	const maxEquipmentDmg = (damage instanceof Array) ? damage[damage.length - 1] : damage;
	console.log(attackingItem, 'vs', actor.attacker?.natural);
	if (maxNaturalDmg > maxEquipmentDmg) {
		return [naturalDmg, actor.attacker?.natural?.damageType || ''];
	}
	console.log('Using item for attack', attackingItem);
	return [damage, type];
}

function getMeleeAttackRange(actor) {
	const equippedItems = getEquippedItems(actor);
	const maxRange = Math.max(
		actor?.attacker?.range || 1, // Natural attack
		...equippedItems.map((item) => item?.attackable?.range || 0),
	);
	return maxRange;
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
