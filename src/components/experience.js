function awardXp(ent, amount = 0) {
	if (!ent.experience) return;
	ent.experience.totalXp += amount;
}

// Note: This only works with one killer.
function gainKillXp(killer, victim) {
	if (!killer.experience || !victim.experience) return;
	if (!victim.experience.killXp) return;
	awardXp(killer, victim.experience.killXp);
}

export { awardXp, gainKillXp };
