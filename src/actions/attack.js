import { damageEntities, getMapEntitiesNextToActor, isAlive } from '../actionUtilities.js';

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
	return [true, `Attack for ${dmgDisplay} damage`];
}

export { attack, getMeleeAttackDamage, getMeleeAttackRange };
export default attack;
