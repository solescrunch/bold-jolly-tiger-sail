import { checkedSkillLife } from './skill-life.js';
import { checkedSupplies } from './mountain-mine.js';
import { checkedXamBrain, XAM_TASKS } from './xam-brain.js';
import { ALL_SKILLS } from './skill-directory.js';
import { MAX_XP } from './progression.js';
import { checkedInventory } from './inventory.js';
import { RESOURCES } from './skilling.js';
export function checkedXamView(value) { const v = value; if (!v || typeof v !== 'object' || v.kind !== 'xam' || v.name !== 'Xam' || v.protected !== true || v.untouchable !== true || v.autoRetaliate !== false || v.collision !== 'nonblocking' || v.armor !== 'legendary_holographic_rustic' || v.mainHand !== 'diamond_scythe' || v.offHand !== 'gilded_secateurs' || !/^p[1-9][0-9]{0,15}$/.test(v.id) || !v.position || ![v.position.x, v.position.y, v.position.z].every(n => Number.isFinite(n) && Math.abs(n) <= 1e6) || typeof v.phase !== 'string' || v.phase.length > 80 || typeof v.examine !== 'string' || v.examine.length > 200 || !Array.isArray(v.skills) || v.skills.length !== ALL_SKILLS.length)
    throw Error('Invalid Xam view'); for (const [i, row] of v.skills.entries())
    if (row.id !== ALL_SKILLS[i] || !Number.isInteger(row.level) || row.level < 1 || row.level > 99 || !Number.isSafeInteger(row.xp) || row.xp < 0 || row.xp > MAX_XP)
        throw Error('Invalid Xam skills'); if (v.totalXp !== v.skills.reduce((n, s) => n + s.xp, 0) || v.totalLevel !== v.skills.reduce((n, s) => n + s.level, 0))
    throw Error('Invalid Xam totals'); for (const [counts, cap] of [[v.pack, 12], [v.bank, 1000000]])
    if (!counts || Object.keys(counts).sort().join() !== [...RESOURCES].sort().join() || !Object.values(counts).every(n => Number.isSafeInteger(n) && n >= 0 && n <= cap))
        throw Error('Invalid Xam storage'); if (Object.values(v.pack).reduce((a, b) => a + b, 0) > 12)
    throw Error('Invalid Xam pack'); if (!Number.isSafeInteger(v.tick) || v.tick < 0)
    throw Error('Invalid Xam tick'); const d = v.diagnostics; if (!d || Object.keys(d).sort().join() !== 'controller,coverage,covered,currentTask,limitations,recent,selection,selections,total' || d.controller !== 'rule-based coverage bot' || d.selection !== 'seeded shuffled coverage bag' || d.total !== XAM_TASKS.length || !XAM_TASKS.some(t => t.id === d.currentTask) || !Array.isArray(d.recent) || d.recent.length > 32 || !Array.isArray(d.limitations) || d.limitations.length > 8 || !d.limitations.every(t => typeof t === 'string' && t.length < 200))
    throw Error('Invalid Xam diagnostics'); const brain = checkedXamBrain({ version: 2, rng: 1, bag: [], selections: d.selections, recent: d.recent.map(id => XAM_TASKS.findIndex(t => t.id === id)), coverage: d.coverage }); if (d.covered !== Object.values(brain.coverage).filter(c => c.completed > 0).length)
    throw Error('Invalid Xam coverage totals'); return { ...v, supplies: checkedSkillLife(v.supplies, v.tick), caveSupplies: checkedSupplies(v.caveSupplies, v.tick), diagnostics: structuredClone(d), position: { ...v.position }, skills: v.skills.map(s => ({ ...s })), inventory: checkedInventory(v.inventory), pack: { ...v.pack }, bank: { ...v.bank } }; }
