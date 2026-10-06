import { level, MAX_XP } from './progression.js';
export const HARVEST_ITEMS = Object.freeze([
    { id: 'pine-log', name: 'Pine logs', skill: 'woodcutting', level: 1, xp: 25, color: '#648754' },
    { id: 'oak-log', name: 'Oak logs', skill: 'woodcutting', level: 15, xp: 38, color: '#738D44' },
    { id: 'willow-log', name: 'Willow logs', skill: 'woodcutting', level: 30, xp: 55, color: '#79A873' },
    { id: 'maple-log', name: 'Maple logs', skill: 'woodcutting', level: 45, xp: 75, color: '#B68853' },
    { id: 'yew-log', name: 'Yew logs', skill: 'woodcutting', level: 60, xp: 105, color: '#3E6C59' },
    { id: 'moonwood-log', name: 'Moonwood logs', skill: 'woodcutting', level: 75, xp: 145, color: '#8FACC4' },
    { id: 'shrimp', name: 'Raw shrimp', skill: 'fishing', level: 1, xp: 20, color: '#D7978A' },
    { id: 'sardine', name: 'Raw sardine', skill: 'fishing', level: 10, xp: 30, color: '#ABB6CB' },
    { id: 'trout', name: 'Raw trout', skill: 'fishing', level: 20, xp: 45, color: '#A7C8B5' },
    { id: 'salmon', name: 'Raw salmon', skill: 'fishing', level: 30, xp: 60, color: '#D7988A' },
    { id: 'river-lobster', name: 'Raw river lobster', skill: 'fishing', level: 40, xp: 85, color: '#BD7867' },
    { id: 'sturgeon', name: 'Raw sturgeon', skill: 'fishing', level: 60, xp: 120, color: '#889FAE' },
    { id: 'copper-ore', name: 'Copper ore', skill: 'mining', level: 1, xp: 25, color: '#CB9361' },
    { id: 'tin-ore', name: 'Tin ore', skill: 'mining', level: 1, xp: 25, color: '#B8BFBD' },
    { id: 'iron-ore', name: 'Iron ore', skill: 'mining', level: 15, xp: 40, color: '#9D8272' },
    { id: 'coal', name: 'Coal', skill: 'mining', level: 30, xp: 60, color: '#414C59' },
    { id: 'mithril-ore', name: 'Mithril ore', skill: 'mining', level: 55, xp: 95, color: '#769BBE' },
    { id: 'adamant-ore', name: 'Adamant ore', skill: 'mining', level: 70, xp: 125, color: '#77A488' },
    { id: 'runestone-ore', name: 'Runestone ore', skill: 'mining', level: 85, xp: 160, color: '#8BBACB' },
]);
for (const item of HARVEST_ITEMS)
    Object.freeze(item);
export const HARVEST_IDS = Object.freeze(HARVEST_ITEMS.map(i => i.id));
export const harvestItem = (id) => HARVEST_ITEMS.find(i => i.id === id);
const empty = () => Object.fromEntries(HARVEST_IDS.map(id => [id, 0]));
export const freshHarvest = () => ({ pack: empty(), bank: empty(), activity: null });
export const freshHarvestWorld = () => Object.fromEntries(HARVEST_IDS.map(id => [id, { stock: 3, readyTick: 0 }]));
export function checkedHarvest(v, tick) {
    if (!v || typeof v !== 'object' || Array.isArray(v))
        throw Error('Invalid harvest');
    const r = v;
    if (Object.keys(r).sort().join() !== (tick === undefined ? 'bank,pack' : 'activity,bank,pack'))
        throw Error('Invalid harvest fields');
    for (const k of ['pack', 'bank'])
        if (!r[k] || Object.keys(r[k]).sort().join() !== [...HARVEST_IDS].sort().join() || !Object.values(r[k]).every(n => Number.isSafeInteger(n) && n >= 0 && n <= (k === 'pack' ? 28 : 1000000)))
            throw Error('Invalid harvest counts');
    if (Object.values(r.pack).reduce((a, b) => a + b, 0) > 28)
        throw Error('Harvest backpack full');
    if (tick !== undefined && r.activity !== null && (!r.activity || Object.keys(r.activity).sort().join() !== 'finishTick,id' || !harvestItem(r.activity.id) || !Number.isSafeInteger(r.activity.finishTick) || r.activity.finishTick <= tick || r.activity.finishTick > tick + 100))
        throw Error('Invalid harvest activity');
    return { pack: { ...r.pack }, bank: { ...r.bank }, activity: tick === undefined ? null : r.activity ? { ...r.activity } : null };
}
export function checkedHarvestWorld(v, tick) { if (!v || typeof v !== 'object' || Array.isArray(v) || Object.keys(v).sort().join() !== [...HARVEST_IDS].sort().join())
    throw Error('Invalid harvest world'); const r = v; for (const n of Object.values(r))
    if (!n || Object.keys(n).sort().join() !== 'readyTick,stock' || !Number.isSafeInteger(n.stock) || n.stock < 0 || n.stock > 3 || !Number.isSafeInteger(n.readyTick) || n.readyTick < 0 || n.readyTick > tick + 1200 || (n.stock ? n.readyTick !== 0 : n.readyTick <= tick))
        throw Error('Invalid harvest node'); return structuredClone(r); }
/** Sites are computed identically from the authoritative navigation, with clear approaches. */
export function harvestSites(camp, beacon, nav, strict = false) {
    const sites = [];
    for (const [i, item] of HARVEST_ITEMS.entries()) {
        const anchor = item.skill === 'woodcutting' ? camp : beacon, side = item.skill === 'fishing' ? 1 : -1;
        let p = { x: anchor.x + ((i % 7) - 3) * 2.3, y: anchor.y, z: anchor.z + side * (16 + Math.floor(i / 7) * 6) };
        if (nav) {
            let found;
            for (let j = 0; j < 160; j++) {
                const x = anchor.x + ((j % 12) - 5) * 1.6, z = anchor.z + side * (12 + Math.floor(j / 12) * 2.2);
                if (sites.some(s => Math.hypot(s.position.x - x, s.position.z - z) < 2.8))
                    continue;
                const check = nav.check({ x, z });
                if (check.ok && nav.findPath(anchor, check.position, 4096).status === 'found') {
                    found = check.position;
                    break;
                }
            }
            if (!found) {
                if (strict)
                    throw Error('No harvest site ' + item.id);
                const fallback = nav.check(anchor);
                if (fallback.ok)
                    found = fallback.position;
            }
            if (found)
                p = found;
        }
        sites.push({ id: item.id, position: p });
    }
    return sites;
}
export const HARVEST_RESULTS = { harvest_started: 'Harvesting started. Stay at this named resource site.', harvest_gathered: 'Named resource collected; profession XP awarded.', harvest_level: 'Your skill level is too low for this resource.', harvest_empty: 'This resource is depleted and regrowing.', harvest_range: 'Move within 2.5 metres of the selected resource.', harvest_full: 'Your 28-slot harvest backpack is full.', harvest_cancelled: 'Harvest cancelled without rewards.', harvest_busy: 'Finish or cancel the current skill action.' };
export function startHarvest(h, s, w, id, tick, freeSlots) { if (!Number.isSafeInteger(tick) || tick < 0 || tick > Number.MAX_SAFE_INTEGER - 1260 || !harvestItem(id))
    throw Error('Invalid harvest clock or ID'); const item = harvestItem(id); if (h.activity)
    return 'harvest_busy'; if (level(s.xp[item.skill]) < item.level)
    return 'harvest_level'; if (w[id].stock <= 0)
    return 'harvest_empty'; if (freeSlots < 1)
    return 'harvest_full'; h.activity = { id, finishTick: tick + 60 }; return 'harvest_started'; }
export function finishHarvest(h, s, w, tick, near, freeSlots) { if (!Number.isSafeInteger(tick) || tick < 0 || tick > Number.MAX_SAFE_INTEGER - 1200)
    throw Error('Invalid harvest clock'); const activity = h.activity; if (!activity)
    return; const item = harvestItem(activity.id); if (!near) {
    h.activity = null;
    return 'harvest_cancelled';
} if (tick < activity.finishTick)
    return; h.activity = null; if (level(s.xp[item.skill]) < item.level)
    return 'harvest_level'; if (freeSlots < 1)
    return 'harvest_full'; const node = w[item.id]; if (node.stock <= 0)
    return 'harvest_empty'; node.stock--; if (!node.stock)
    node.readyTick = tick + 1200; h.pack[item.id]++; s.xp[item.skill] = Math.min(MAX_XP, s.xp[item.skill] + item.xp); return 'harvest_gathered'; }
