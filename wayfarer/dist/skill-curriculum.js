/** Original Wayfarer curricula. Data alone never grants XP or bypasses the realm transaction. */
import { ALL_SKILLS } from './skill-directory.js';
import { SKILLS, TIER_LEVELS, level, checkedProgression, awardSkillXP } from './progression.js';
import { PROFESSIONS, RESOURCES, checkedSkilling, awardNoncombatXP } from './skilling.js';
const ranks = ['Novice', 'Apprentice', 'Journeyman', 'Adept', 'Skilled', 'Experienced', 'Artisan', 'Expert', 'Veteran', 'Elite', 'Master', 'Grandmaster', 'Exalted', 'Legendary', 'Ascendant'];
const projects = {
    cooking: { name: 'River kitchen commission', costs: { fish: 1 }, outcome: 'Prepare and donate a meal to Halden’s travellers; Cooking XP. No stored food item yet.' },
    crafting: { name: 'Lantern-frame commission', costs: { logs: 1, ore: 1 }, outcome: 'Build and donate lantern frames; Crafting XP.' },
    firemaking: { name: 'Beacon fuel preparation', costs: { logs: 1 }, outcome: 'Burn supplied fuel safely at the yard; Firemaking XP.' },
    fletching: { name: 'Training-shaft commission', costs: { logs: 1 }, outcome: 'Make and donate practice shafts; Fletching XP. No combat ammunition yet.' },
    herblore: { name: 'Essence-oil preparation', costs: { fish: 1, warden_essence: 1 }, outcome: 'Refine fictional fish oil and Warden essence for the apothecary; Herblore XP. No usable potion yet.' },
    runecrafting: { name: 'Essence-seal commission', costs: { warden_essence: 1 }, outcome: 'Inscribe and donate an essence seal; Runecrafting XP. No stored rune item yet.' },
    smithing: { name: 'Metal-fitting commission', costs: { ore: 1, logs: 1 }, outcome: 'Heat and forge fittings for the settlement; Smithing XP.' },
    construction: { name: 'Joinery commission', costs: { logs: 2, ore: 1 }, outcome: 'Build and donate settlement joints; Construction XP. No player housing yet.' },
    prayer: { name: 'Warden remembrance offering', costs: { warden_essence: 1 }, outcome: 'Offer earned Warden essence at the practice shrine; Prayer XP. No active prayer buffs yet.' }
};
const themes = { attack: 'Precision combat', strength: 'Power combat', defence: 'Defensive combat', ranged: 'Archery encounters', magic: 'Spell encounters', hitpoints: 'Combat endurance', prayer: 'Remembrance offering', woodcutting: 'Selective timber harvest', mining: 'Careful seam extraction', fishing: 'River casting', agility: 'Balance routes', cooking: 'River kitchen', crafting: 'Lantern frames', firemaking: 'Beacon fuel', fletching: 'Practice shafts', herblore: 'Essence oil', runecrafting: 'Essence seals', slayer: 'Creature assignments', smithing: 'Metal fittings', thieving: 'Lockbox commissions', farming: 'Garden plots', construction: 'Settlement joinery', hunter: 'Nonlethal tracking' };
export const TRAINING_METHODS = Object.freeze(ALL_SKILLS.flatMap(skill => TIER_LEVELS.map((required, i) => {
    const gathering = PROFESSIONS.includes(skill), project = projects[skill], kind = gathering ? 'gathering' : project ? 'workshop' : 'guide', scale = 1 + Math.floor(i / 3);
    const costs = Object.freeze(Object.fromEntries(Object.entries(project?.costs ?? {}).map(([resource, n]) => [resource, n * scale])));
    return Object.freeze({ id: `${skill}-${required}`, skill, name: `${ranks[i]} ${gathering ? themes[skill] : project?.name ?? themes[skill]}`, level: required, xp: kind === 'guide' ? 0 : (gathering ? 25 : 12) + i * (gathering ? 5 : 4), kind, location: gathering ? 'Far landing · shared resource site' : kind === 'workshop' ? 'Halden’s workshop / shrine' : 'Future world content', costs, outcome: gathering ? 'Gather existing pooled materials with your earned tools; one shared node charge per completion.' : project?.outcome ?? 'Planned method: use the existing drill or combat system today.', implemented: kind !== 'guide' });
})));
const methods = new Map(TRAINING_METHODS.map(m => [m.id, m]));
export function trainingMethod(id) { return typeof id === 'string' ? methods.get(id) : undefined; }
export function isTrainingMethod(id) { return !!trainingMethod(id)?.implemented; }
export function methodXP(p, s, skill) { return SKILLS.includes(skill) ? p.xp[skill] : s.xp[skill]; }
export function trainingEligibility(p, s, m) {
    if (!m.implemented)
        return 'planned';
    if (level(methodXP(p, s, m.skill)) < m.level)
        return 'level';
    if (RESOURCES.some(k => s.bank[k] < (m.costs[k] ?? 0)))
        return 'materials';
    return 'ready';
}
/** Called on detached server state only, after final prompt/range checks. Bank input is rechecked at completion. */
export function completeWorkshop(p, s, id) {
    const m = trainingMethod(id);
    if (!m || m.kind !== 'workshop' || !m.implemented)
        throw Error('Invalid workshop method');
    checkedSkilling(s);
    checkedProgression(p);
    const eligible = trainingEligibility(p, s, m);
    if (eligible === 'level')
        return 'curriculum_level';
    if (eligible === 'materials')
        return 'curriculum_materials';
    for (const k of RESOURCES)
        s.bank[k] -= m.costs[k] ?? 0;
    if (SKILLS.includes(m.skill))
        awardSkillXP(p, m.skill, m.xp);
    else
        awardNoncombatXP(s, m.skill, m.xp);
    return 'curriculum_done';
}
export function curriculumFor(skill) { return TRAINING_METHODS.filter(m => m.skill === skill); }
