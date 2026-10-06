import { awardSkillXP, combatBonuses, level } from './progression.js';
import { awardNoncombatXP } from './skilling.js';
export const LIFE_ITEMS = ['seeds', 'herbs', 'bars', 'lanterns', 'arrows', 'runes', 'meals', 'potions'];
export const LIFE_CAP = 100;
const recipes = [
    { id: 'track', skill: 'hunter', name: 'Track and release a seed-mouse', seconds: 6, xp: 30, location: 'far', resources: {}, supplies: {}, outputs: { seeds: 1 }, description: 'Follow tracks at the far landing; release the animal and collect one seed.' },
    { id: 'lockbox', skill: 'thieving', name: 'Open a commissioned lockbox', seconds: 6, xp: 25, location: 'camp', resources: {}, supplies: {}, outputs: { seeds: 1 }, description: 'Halden’s permitted lockbox commission yields one garden seed.' },
    { id: 'plant', skill: 'farming', name: 'Plant the herb bed', seconds: 3, xp: 0, location: 'camp', resources: {}, supplies: { seeds: 1 }, outputs: {}, effect: 'crop', description: 'One seed grows for 30 seconds of connected play. Harvest for two herbs and 35 Farming XP.' },
    { id: 'cook', skill: 'cooking', name: 'Cook a river meal', seconds: 5, xp: 30, location: 'camp', resources: { fish: 1 }, supplies: {}, outputs: { meals: 1 }, description: 'One banked fish becomes a meal that heals 6 HP.' },
    { id: 'smelt', skill: 'smithing', name: 'Smelt a lantern bar', seconds: 6, xp: 30, location: 'camp', resources: { ore: 1, logs: 1 }, supplies: {}, outputs: { bars: 1 }, description: 'One banked ore and log become one metal bar.' },
    { id: 'craft', skill: 'crafting', name: 'Assemble a lantern kit', seconds: 5, xp: 30, location: 'camp', resources: { logs: 1 }, supplies: { bars: 1 }, outputs: { lanterns: 1 }, description: 'One bar and banked log become a kit for settlement repairs.' },
    { id: 'repair', skill: 'construction', name: 'Contribute a settlement repair', seconds: 6, xp: 35, location: 'camp', resources: {}, supplies: { lanterns: 1 }, outputs: {}, effect: 'repair', description: 'Spend one lantern kit; record one personal repair contribution. No player housing yet.' },
    { id: 'fletch', skill: 'fletching', name: 'Fletch six reed arrows', seconds: 5, xp: 30, location: 'camp', resources: { logs: 1 }, supplies: {}, outputs: { arrows: 6 }, description: 'One banked log becomes six arrows for the provided field bow.' },
    { id: 'runes', skill: 'runecrafting', name: 'Inscribe four field runes', seconds: 6, xp: 30, location: 'camp', resources: { ore: 1 }, supplies: {}, outputs: { runes: 4 }, description: 'One banked ore becomes four runes used by field spells. Runecrafting is its own skill.' },
    { id: 'brew', skill: 'herblore', name: 'Brew a restorative tonic', seconds: 6, xp: 35, location: 'camp', resources: {}, supplies: { herbs: 1 }, outputs: { potions: 1 }, description: 'One harvested herb becomes a potion that heals 8 HP.' },
    { id: 'fire', skill: 'firemaking', name: 'Fuel the settlement hearth', seconds: 4, xp: 25, location: 'camp', resources: { logs: 1 }, supplies: {}, outputs: {}, effect: 'hearth', description: 'One banked log keeps the hearth warm for 30 seconds; nearby meals heal 2 extra HP.' },
    { id: 'offer', skill: 'prayer', name: 'Offer earned Warden essence', seconds: 4, xp: 30, location: 'camp', resources: { warden_essence: 1 }, supplies: {}, outputs: {}, effect: 'prayer', description: 'Offer one banked essence to refill Prayer; active protection reduces incoming damage by 1.' }
];
export const LIFE_RECIPES = Object.freeze(recipes.map(r => Object.freeze({ ...r, resources: Object.freeze(r.resources), supplies: Object.freeze(r.supplies), outputs: Object.freeze(r.outputs) })));
const recipeMap = new Map(LIFE_RECIPES.map(r => [r.id, r]));
export const lifeRecipe = (id) => recipeMap.get(id);
const simple = ['cancel', 'harvest', 'eat-meal', 'drink-potion', 'deposit', 'withdraw-seeds', 'withdraw-herbs', 'withdraw-bars', 'withdraw-lanterns', 'withdraw-arrows', 'withdraw-runes', 'withdraw-meals', 'withdraw-potions', 'agility', 'checkpoint', 'task', 'ward-on', 'ward-off', 'shoot-warden', 'spell-warden', ...['shoot', 'spell'].flatMap(k => [0, 1, 2].map(i => `${k}-${i}`))];
export function isLifeCommand(v) { return typeof v === 'string' && (recipeMap.has(v) || simple.includes(v)); }
export const LIFE_RESULTS = { life_started: 'Skill action started. Stay nearby; costs and rewards resolve on completion.', life_done: 'Skill action complete. Supplies and XP updated.', life_cancelled: 'Skill action cancelled without spending supplies or awarding XP.', life_busy: 'Finish or cancel your current skill action first.', life_range: 'Move to the action’s settlement or far-landing site.', life_materials: 'Bank gathered resources and carry the listed skill supplies.', life_full: 'Your 100-unit skill pouch or bank is full.', life_growing: 'This herb bed is growing or ready to harvest.', life_harvest: 'Herb bed harvested: two herbs and 35 Farming XP.', life_not_ready: 'The herb bed is not ready to harvest.', life_consumed: 'Supply consumed; health restored.', life_food_wait: 'Full health, no supply, or the shared food cooldown is active.', life_banked: 'Skill supplies deposited at Halden.', life_withdrawn: 'One skill supply withdrawn.', life_empty: 'No banked supply is available.', life_course: 'Agility route started. Cross to the far beacon, then return to Halden.', life_checkpoint: 'Far checkpoint reached. Return to Halden to finish.', life_course_done: 'Agility route completed: 40 Agility XP.', life_course_early: 'Keep travelling; the next checkpoint is not ready yet.', life_task: 'Slayer task accepted: defeat three Venomcrag scorpions.', life_task_active: 'Finish your current three-scorpion task first.', life_task_progress: 'Scorpion task progressed: 15 Slayer XP.', life_task_done: 'Slayer task completed: 15 Slayer XP plus a 25-XP completion bonus.', life_ward_on: 'Prayer protection enabled; one point drains every two seconds.', life_ward_off: 'Prayer protection disabled.', life_prayer_empty: 'Offer Warden essence to refill your Prayer points.', life_ammo: 'Carry an arrow for Ranged or a rune for Magic.', life_shot: 'Field attack landed; actual damage trained Ranged or Magic and Hitpoints.' };
const empty = () => Object.fromEntries(LIFE_ITEMS.map(k => [k, 0]));
export const freshLifeLedger = () => ({ pack: empty(), bank: empty(), cropTicks: 0, cropReady: false, prayerPoints: 0, repairs: 0, taskRemaining: 0 });
const keys = (v, names) => { if (!v || typeof v !== 'object' || Array.isArray(v) || Object.keys(v).length !== names.length || !names.every(k => Object.hasOwn(v, k)))
    throw Error('Invalid skill-life fields'); return v; };
const integer = (v, max = Number.MAX_SAFE_INTEGER) => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0 && v <= max;
export function checkedLifeLedger(v) {
    const r = keys(v, ['pack', 'bank', 'cropTicks', 'cropReady', 'prayerPoints', 'repairs', 'taskRemaining']);
    for (const field of ['pack', 'bank']) {
        const counts = keys(r[field], LIFE_ITEMS);
        if (!Object.values(counts).every(n => integer(n, field === 'pack' ? LIFE_CAP : 1_000_000)))
            throw Error('Invalid skill supplies');
        if (field === 'pack' && Object.values(counts).reduce((a, b) => a + Number(b), 0) > LIFE_CAP)
            throw Error('Skill pouch exceeded');
    }
    if (!integer(r.cropTicks, 600) || typeof r.cropReady !== 'boolean' || r.cropReady && r.cropTicks !== 0 || !integer(r.prayerPoints, 109) || !integer(r.repairs, 1_000_000) || !integer(r.taskRemaining, 3))
        throw Error('Invalid skill ledger');
    return structuredClone(r);
}
export function checkedSkillLife(v, tick) {
    const r = keys(v, ['pack', 'bank', 'cropTicks', 'cropReady', 'prayerPoints', 'repairs', 'taskRemaining', 'job', 'course', 'ward', 'drainAt', 'hearthUntil']);
    checkedLifeLedger(Object.fromEntries(['pack', 'bank', 'cropTicks', 'cropReady', 'prayerPoints', 'repairs', 'taskRemaining'].map(k => [k, r[k]])));
    if (!integer(tick) || typeof r.ward !== 'boolean' || !integer(r.drainAt, tick + 40) || !integer(r.hearthUntil, tick + 600) || (r.ward && (r.prayerPoints === 0 || Number(r.drainAt) <= tick)) || (!r.ward && r.drainAt !== 0))
        throw Error('Invalid skill utility clocks');
    if (r.job !== null) {
        const j = keys(r.job, ['id', 'startedTick', 'finishTick']), recipe = typeof j.id === 'string' ? lifeRecipe(j.id) : undefined;
        if (!recipe || !integer(j.startedTick, tick) || !integer(j.finishTick, tick + 120) || Number(j.finishTick) <= tick || Number(j.finishTick) - Number(j.startedTick) !== recipe.seconds * 20)
            throw Error('Invalid skill job');
    }
    if (r.course !== null) {
        const c = keys(r.course, ['step', 'startedTick', 'expiresTick']);
        if (![0, 1].includes(Number(c.step)) || !integer(c.step, 1) || !integer(c.startedTick, tick) || !integer(c.expiresTick, tick + 3600) || Number(c.expiresTick) <= tick || Number(c.expiresTick) - Number(c.startedTick) !== 3600 || r.job !== null)
            throw Error('Invalid agility course');
    }
    return structuredClone(r);
}
export const freshSkillLife = (ledger = freshLifeLedger()) => ({ ...checkedLifeLedger(ledger), job: null, course: null, ward: false, drainAt: 0, hearthUntil: 0 });
export function persistSkillLife(l) { return checkedLifeLedger({ pack: l.pack, bank: l.bank, cropTicks: l.cropTicks, cropReady: l.cropReady, prayerPoints: l.prayerPoints, repairs: l.repairs, taskRemaining: l.taskRemaining }); }
export const prayerCapacity = (p) => 10 + level(p.xp.prayer);
export const lifeBusy = (l) => !!(l.job || l.course);
export const nearLife = (pos, target, radius = 3) => !!pos && Math.hypot(pos.x - target.x, pos.y - target.y, pos.z - target.z) <= radius;
export function recipeReady(p, r) {
    if (r.effect === 'crop' && (p.life.cropTicks > 0 || p.life.cropReady))
        return 'life_growing';
    if (Object.entries(r.resources).some(([k, n]) => p.skilling.bank[k] < n) || Object.entries(r.supplies).some(([k, n]) => p.life.pack[k] < n))
        return 'life_materials';
    if (r.effect === 'repair' && p.life.repairs >= 1_000_000)
        return 'life_full';
    const after = LIFE_ITEMS.reduce((n, k) => n + p.life.pack[k] - (r.supplies[k] ?? 0) + (r.outputs[k] ?? 0), 0);
    if (after > LIFE_CAP)
        return 'life_full';
    return;
}
function award(p, skill, xp) { if (skill === 'prayer')
    awardSkillXP(p.progression, 'prayer', xp);
else
    awardNoncombatXP(p.skilling, skill, xp); }
export function lifeCommand(p, command, pos, camp, beacon, tick) {
    const l = p.life;
    if (command === 'cancel') {
        l.job = null;
        l.course = null;
        return 'life_cancelled';
    }
    if (command === 'ward-off') {
        l.ward = false;
        l.drainAt = 0;
        return 'life_ward_off';
    }
    if (p.fighter.hp === 0)
        return 'recovering';
    if (command === 'ward-on') {
        if (!l.prayerPoints)
            return 'life_prayer_empty';
        if (!l.ward) {
            l.ward = true;
            l.drainAt = tick + 40;
        }
        return 'life_ward_on';
    }
    if (lifeBusy(l) && command !== 'checkpoint')
        return 'life_busy';
    if (command === 'checkpoint') {
        const c = l.course;
        if (!c)
            return 'life_course_early';
        const target = c.step === 0 ? beacon : camp;
        if (!nearLife(pos, target, c.step === 0 ? 3 : 3))
            return 'life_range';
        const wait = c.step === 0 ? 100 : 200;
        if (tick < c.startedTick + wait)
            return 'life_course_early';
        if (c.step === 0) {
            c.step = 1;
            return 'life_checkpoint';
        }
        l.course = null;
        awardNoncombatXP(p.skilling, 'agility', 40);
        return 'life_course_done';
    }
    const r = lifeRecipe(command);
    if (r) {
        if (!nearLife(pos, r.location === 'camp' ? camp : beacon, r.location === 'camp' ? 3 : 8))
            return 'life_range';
        const reason = recipeReady(p, r);
        if (reason)
            return reason;
        l.job = { id: r.id, startedTick: tick, finishTick: tick + r.seconds * 20 };
        return 'life_started';
    }
    if (command === 'eat-meal' || command === 'drink-potion') {
        const item = command === 'eat-meal' ? 'meals' : 'potions', max = combatBonuses(p.progression).maxHealth;
        if (!l.pack[item] || tick < p.cave.foodReady || p.fighter.hp >= max)
            return 'life_food_wait';
        l.pack[item]--;
        p.fighter.hp = Math.min(max, p.fighter.hp + (item === 'meals' ? 6 + (l.hearthUntil > tick && nearLife(pos, camp) ? 2 : 0) : 8));
        p.cave.foodReady = tick + 40;
        return 'life_consumed';
    }
    if (!nearLife(pos, camp))
        return 'life_range';
    if (command === 'harvest') {
        if (!l.cropReady)
            return 'life_not_ready';
        if (Object.values(l.pack).reduce((a, b) => a + b, 0) + 2 > LIFE_CAP)
            return 'life_full';
        l.cropReady = false;
        l.pack.herbs += 2;
        awardNoncombatXP(p.skilling, 'farming', 35);
        return 'life_harvest';
    }
    if (command === 'agility') {
        l.course = { step: 0, startedTick: tick, expiresTick: tick + 3600 };
        return 'life_course';
    }
    if (command === 'task') {
        if (l.taskRemaining)
            return 'life_task_active';
        l.taskRemaining = 3;
        return 'life_task';
    }
    if (command === 'deposit') {
        if (LIFE_ITEMS.some(k => l.bank[k] + l.pack[k] > 1_000_000))
            return 'life_full';
        for (const k of LIFE_ITEMS) {
            l.bank[k] += l.pack[k];
            l.pack[k] = 0;
        }
        return 'life_banked';
    }
    if (command.startsWith('withdraw-')) {
        const item = command.slice(9);
        if (!LIFE_ITEMS.includes(item))
            throw Error('Invalid supply');
        if (!l.bank[item])
            return 'life_empty';
        if (Object.values(l.pack).reduce((a, b) => a + b, 0) >= LIFE_CAP)
            return 'life_full';
        l.bank[item]--;
        l.pack[item]++;
        return 'life_withdrawn';
    }
    throw Error('Skill command must be resolved by combat host');
}
export function advanceSkillLife(p, pos, camp, beacon, tick) {
    const l = p.life;
    if (l.cropTicks > 0) {
        l.cropTicks--;
        if (l.cropTicks === 0)
            l.cropReady = true;
    }
    if (l.ward && tick >= l.drainAt) {
        l.prayerPoints--;
        if (!l.prayerPoints) {
            l.ward = false;
            l.drainAt = 0;
        }
        else
            l.drainAt = tick + 40;
    }
    if (p.fighter.hp === 0) {
        l.ward = false;
        l.drainAt = 0;
        if (lifeBusy(l)) {
            l.job = null;
            l.course = null;
            return 'life_cancelled';
        }
    }
    if (l.course && tick >= l.course.expiresTick) {
        l.course = null;
        return 'life_cancelled';
    }
    const job = l.job;
    if (!job)
        return;
    const r = lifeRecipe(job.id);
    if (!nearLife(pos, r.location === 'camp' ? camp : beacon, r.location === 'camp' ? 3 : 8)) {
        l.job = null;
        return 'life_cancelled';
    }
    if (tick < job.finishTick)
        return;
    l.job = null;
    const reason = recipeReady(p, r);
    if (reason)
        return reason;
    for (const [k, n] of Object.entries(r.resources))
        p.skilling.bank[k] -= n;
    for (const [k, n] of Object.entries(r.supplies))
        l.pack[k] -= n;
    for (const [k, n] of Object.entries(r.outputs))
        l.pack[k] += n;
    if (r.effect === 'crop')
        l.cropTicks = 600;
    if (r.effect === 'hearth')
        l.hearthUntil = tick + 600;
    if (r.effect === 'prayer')
        l.prayerPoints = prayerCapacity(p.progression);
    if (r.effect === 'repair')
        l.repairs++;
    award(p, r.skill, r.xp);
    if (r.effect === 'prayer')
        l.prayerPoints = prayerCapacity(p.progression);
    return 'life_done';
}
export function creditSlayer(p) { if (!p.life.taskRemaining)
    return; p.life.taskRemaining--; awardNoncombatXP(p.skilling, 'slayer', 15 + (p.life.taskRemaining === 0 ? 25 : 0)); return p.life.taskRemaining ? 'life_task_progress' : 'life_task_done'; }
