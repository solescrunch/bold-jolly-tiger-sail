import { ALL_SKILLS } from './skill-directory.js';
import { RESONANCE_EFFECTS } from './resonance-codex.js';
import { LIFE_RECIPES } from './skill-life.js';
import { CAVE_IDS } from './cave-instances.js';
export const XAM_TASKS = Object.freeze([
    ...ALL_SKILLS.map(value => ({ id: 'drill:' + value, kind: 'drill', value })),
    ...['woodcutting', 'mining', 'fishing'].map(value => ({ id: 'gather:' + value, kind: 'gather', value })),
    ...LIFE_RECIPES.map(r => ({ id: 'recipe:' + r.id, kind: 'recipe', value: r.id })),
    ...['harvest', 'agility', 'task', 'ward-on', 'ward-off', 'deposit', 'eat-meal', 'drink-potion'].map(value => ({ id: 'life:' + value, kind: 'command', value })),
    ...['attack', 'strength', 'defence', 'ranged', 'magic'].map(value => ({ id: 'combat:' + value, kind: 'combat', value })),
    { id: 'quest:quiet-tithe', kind: 'quest', value: 'quiet-tithe' },
    ...['equip', 'unequip', 'upgrade', 'beacon', 'coat', 'cave-bank', 'mine', 'lobster'].map(value => ({ id: 'gear:' + value, kind: 'gear', value })),
    ...['cinder+verdant+moon', 'flare+tide+dusk', 'sunward+bloom+lantern'].map(value => ({ id: 'codex:' + value, kind: 'codex', value })),
    ...CAVE_IDS.map(value => ({ id: 'cave:' + value, kind: 'cave', value })),
    ...['0', '1', '2'].map(value => ({ id: 'building:' + value, kind: 'building', value })),
    ...RESONANCE_EFFECTS.map(e => ({ id: 'trial:' + e.id, kind: 'trial', value: e.id }))
]);
export const freshXamBrain = (seed = 20261005) => ({ version: 2, rng: seed, bag: [], selections: 0, recent: [], coverage: Object.fromEntries(XAM_TASKS.map(t => [t.id, { attempts: 0, completed: 0, blocked: 0, failures: 0, lastCode: 'unvisited' }])) });
const num = (v, max = 1_000_000_000) => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0 && v <= max;
export function checkedXamBrain(v) {
    if (!v || typeof v !== 'object' || Array.isArray(v))
        throw Error('Invalid Xam brain');
    const b = v;
    if (Object.keys(b).sort().join() !== 'bag,coverage,recent,rng,selections,version' || ![1, 2].includes(b.version) || !num(b.rng, 4294967295) || b.rng === 0 || !num(b.selections) || !Array.isArray(b.bag) || b.bag.length > XAM_TASKS.length || new Set(b.bag).size !== b.bag.length || !b.bag.every(n => num(n, XAM_TASKS.length - 1)) || !Array.isArray(b.recent) || b.recent.length > 32 || !b.recent.every(n => num(n, XAM_TASKS.length - 1)) || !b.coverage || Object.keys(b.coverage).sort().join() !== (b.version === 1 ? XAM_TASKS.slice(0, -6) : XAM_TASKS).map(t => t.id).sort().join())
        throw Error('Invalid Xam schedule');
    for (const c of Object.values(b.coverage))
        if (!c || Object.keys(c).sort().join() !== 'attempts,blocked,completed,failures,lastCode' || ![c.attempts, c.blocked, c.completed, c.failures].every(n => num(n)) || typeof c.lastCode !== 'string' || c.lastCode.length > 80)
            throw Error('Invalid Xam coverage');
    const clean = structuredClone(b);
    if (clean.version === 1) {
        clean.version = 2;
        for (const t of XAM_TASKS.slice(-6))
            clean.coverage[t.id] = { attempts: 0, completed: 0, blocked: 0, failures: 0, lastCode: 'unvisited' };
    }
    return clean;
}
function random(b) { let n = b.rng; n ^= n << 13; n ^= n >>> 17; n ^= n << 5; b.rng = n >>> 0; return b.rng / 4294967296; }
/** Seeded shuffle gives diverse order and eventual coverage; replay receives the resulting ordinary packets. */
export function chooseXamTask(b) {
    if (!b.bag.length) {
        b.bag = XAM_TASKS.map((_, i) => i);
        for (let i = b.bag.length - 1; i > 0; i--) {
            const j = Math.floor(random(b) * (i + 1));
            [b.bag[i], b.bag[j]] = [b.bag[j], b.bag[i]];
        }
        if (b.bag.at(-1) === b.recent.at(-1) && b.bag.length > 1)
            [b.bag[0], b.bag[b.bag.length - 1]] = [b.bag.at(-1), b.bag[0]];
    }
    const index = b.bag.pop();
    b.selections = Math.min(1_000_000_000, b.selections + 1);
    b.recent.push(index);
    if (b.recent.length > 32)
        b.recent.shift();
    return index;
}
