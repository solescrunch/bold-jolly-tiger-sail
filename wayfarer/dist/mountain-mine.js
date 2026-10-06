import { WEAPONS } from './encounter.js';
import { awardDamage, awardSkillXP, combatBonuses } from './progression.js';
import { awardNoncombatXP } from './skilling.js';
export const MINE_ID = 'mountain-mine';
export const MINE_SPOTS = Object.freeze({ ore: Object.freeze({ x: 764, y: -18, z: -4 }), lobster: Object.freeze({ x: 778, y: -18, z: 4 }) });
export const SCORPION_POINTS = Object.freeze([{ x: 772, y: -18, z: 0 }, { x: 768, y: -18, z: 6 }, { x: 776, y: -18, z: -6 }].map(Object.freeze));
export const CAVE_ITEMS = Object.freeze({ scorpion_venom: { name: 'Scorpion venom', description: 'One vial coats the equipped weapon for 60 seconds.' }, cave_lobster: { name: 'Cave lobster', description: 'Eat to restore 6 Hitpoints; two-second food cooldown.' } });
export const isMineCommand = (v) => typeof v === 'string' && ['mine', 'lobster', 'coat', 'eat', 'bank', 'attack-0', 'attack-1', 'attack-2', 'withdraw-venom', 'withdraw-lobster'].includes(v);
export const MINE_RESULTS = { cave_withdrawn: 'One banked supply withdrawn into your cave pouch.', mine_started: 'Mining the mountain vein · five seconds.', lobster_started: 'Fishing for cave lobsters · seven seconds.', mine_gathered: 'Ore added to your resource pack · +25 Mining XP.', lobster_caught: 'Cave lobster added to your cave pouch · +30 Fishing XP.', mine_busy: 'Finish or cancel the current gathering action.', mine_range: 'Move close to the cave resource or scorpion.', mine_empty: 'The shared cave resource is regenerating.', mine_full: 'Your resource pack or cave pouch is full.', mine_cancelled: 'Cave gathering cancelled: move back to the resource to try again.', scorpion_hit: 'You hit the cave scorpion.', scorpion_dead: 'Scorpion defeated.', venom_drop: 'Scorpion defeated · a vial of venom dropped into your cave pouch!', venom_coated: 'Weapon coated for 60 seconds. Successful hits may inflict poison.', venom_missing: 'You need scorpion venom and an equipped weapon.', venom_active: 'This weapon is already coated.', lobster_eaten: 'Cave lobster eaten · restored up to 6 Hitpoints.', lobster_unavailable: 'No cave lobster, full health or food recovery is active.', cave_banked: 'Cave pouch deposited in your personal bank.', cave_bank_full: 'Cave bank limit reached.' };
export const freshLedger = () => ({ venom: 0, lobsters: 0, bankVenom: 0, bankLobsters: 0 });
export const freshSupplies = (ledger = freshLedger()) => ({ ...checkedLedger(ledger), coatingWeapon: null, coatingUntil: 0, foodReady: 0, activity: null });
export const freshMineWorld = () => ({ oreStock: 3, oreRespawn: 0, lobsterStock: 3, lobsterRespawn: 0, scorpions: SCORPION_POINTS.map(() => ({ hp: 20, respawnAt: 0, attackAt: 0, round: 1, target: null, poison: null })), wardenPoison: null, rng: 20261005 });
const exact = (v, keys) => { if (!v || typeof v !== 'object' || Array.isArray(v) || Object.keys(v).length !== keys.length || !keys.every(k => Object.hasOwn(v, k)))
    throw Error('Invalid cave fields'); return v; };
const integer = (v, max = Number.MAX_SAFE_INTEGER) => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0 && v <= max;
export function checkedLedger(v) { const r = exact(v, ['venom', 'lobsters', 'bankVenom', 'bankLobsters']); if (!integer(r.venom, 20) || !integer(r.lobsters, 20) || Number(r.venom) + Number(r.lobsters) > 20 || !integer(r.bankVenom, 1000000) || !integer(r.bankLobsters, 1000000))
    throw Error('Invalid cave inventory'); return { ...r }; }
export function checkedSupplies(v, tick) { const r = exact(v, ['venom', 'lobsters', 'bankVenom', 'bankLobsters', 'coatingWeapon', 'coatingUntil', 'foodReady', 'activity']); checkedLedger({ venom: r.venom, lobsters: r.lobsters, bankVenom: r.bankVenom, bankLobsters: r.bankLobsters }); if (!(r.coatingWeapon === null || Object.hasOwn(WEAPONS, String(r.coatingWeapon)) && r.coatingWeapon !== 'unarmed') || !integer(r.coatingUntil, tick + 1200) || !integer(r.foodReady, tick + 40) || (r.coatingWeapon === null) !== (r.coatingUntil === 0))
    throw Error('Invalid weapon coating'); if (r.activity !== null) {
    const a = exact(r.activity, ['kind', 'finishTick']);
    if (!['mine', 'lobster'].includes(String(a.kind)) || !integer(a.finishTick, tick + 140) || Number(a.finishTick) <= tick)
        throw Error('Invalid cave activity');
} return structuredClone(r); }
function checkedPoison(v, tick) { if (v === null)
    return; const r = exact(v, ['owner', 'until', 'next']); if (typeof r.owner !== 'string' || !/^p[1-9][0-9]{0,15}$/.test(r.owner) || !integer(r.until, tick + 120) || !integer(r.next, tick + 40) || Number(r.next) > Number(r.until))
    throw Error('Invalid poison'); }
export function checkedMineView(v, tick) { const r = exact(v, ['oreStock', 'oreRespawn', 'lobsterStock', 'lobsterRespawn', 'scorpions', 'wardenPoison']); for (const kind of ['ore', 'lobster']) {
    if (!integer(r[kind + 'Stock'], 3) || !integer(r[kind + 'Respawn'], tick + 500) || (r[kind + 'Stock'] === 0) !== (Number(r[kind + 'Respawn']) > 0))
        throw Error('Invalid cave stock');
} if (!Array.isArray(r.scorpions) || r.scorpions.length !== 3)
    throw Error('Invalid cave mobs'); for (const m of r.scorpions) {
    const s = exact(m, ['hp', 'respawnAt', 'attackAt', 'round', 'target', 'poison']);
    if (!integer(s.hp, 20) || !integer(s.respawnAt, tick + 240) || !integer(s.attackAt, tick + 30) || !integer(s.round, 1000000) || s.round === 0 || (s.hp === 0) !== (Number(s.respawnAt) > 0) || !(s.target === null || typeof s.target === 'string' && /^p[1-9][0-9]{0,15}$/.test(s.target)))
        throw Error('Invalid scorpion');
    checkedPoison(s.poison, tick);
} checkedPoison(r.wardenPoison, tick); return structuredClone(r); }
export function mineView(w, tick) { const { rng, ...view } = w; return checkedMineView(view, tick); }
const near = (p, t, r = 3) => !!p && Math.hypot(p.x - t.x, p.y - t.y, p.z - t.z) <= r;
const roll = (w) => { w.rng = (Math.imul(w.rng, 1664525) + 1013904223) >>> 0; return w.rng / 4294967296; };
export function inflictPoison(w, p, tick, set) { if (p.inventory.weapon && p.cave.coatingWeapon === p.inventory.weapon && tick < p.cave.coatingUntil && roll(w) < .25)
    set({ owner: p.id, until: tick + 120, next: tick + 40 }); }
function defeat(w, m, p, tick) { m.hp = 0; m.respawnAt = tick + 240; m.attackAt = 0; m.target = null; m.poison = null; if (p && roll(w) < .25 && p.cave.venom + p.cave.lobsters < 20) {
    p.cave.venom++;
    return 'venom_drop';
} return 'scorpion_dead'; }
export function mineCommand(w, p, command, pos, camp, tick, protectedCombat = false, override) {
    const c = p.cave;
    if (p.fighter.hp === 0)
        return 'recovering';
    if (command === 'bank') {
        if (!near(pos, camp))
            return 'out_of_range';
        if (c.bankVenom + c.venom > 1000000 || c.bankLobsters + c.lobsters > 1000000)
            return 'cave_bank_full';
        c.bankVenom += c.venom;
        c.bankLobsters += c.lobsters;
        c.venom = c.lobsters = 0;
        return 'cave_banked';
    }
    if (command === 'withdraw-venom' || command === 'withdraw-lobster') {
        if (!near(pos, camp))
            return 'out_of_range';
        if (c.venom + c.lobsters >= 20)
            return 'mine_full';
        const field = command === 'withdraw-venom' ? 'venom' : 'lobsters', bank = command === 'withdraw-venom' ? 'bankVenom' : 'bankLobsters';
        if (!c[bank])
            return 'mine_empty';
        c[bank]--;
        c[field]++;
        return 'cave_withdrawn';
    }
    if (command === 'coat') {
        if (!p.inventory.weapon || !c.venom)
            return 'venom_missing';
        if (c.coatingWeapon === p.inventory.weapon && tick < c.coatingUntil)
            return 'venom_active';
        c.venom--;
        c.coatingWeapon = p.inventory.weapon;
        c.coatingUntil = tick + 1200;
        return 'venom_coated';
    }
    if (command === 'eat') {
        if (!c.lobsters || tick < c.foodReady || p.fighter.hp >= combatBonuses(p.progression).maxHealth)
            return 'lobster_unavailable';
        c.lobsters--;
        p.fighter.hp = Math.min(combatBonuses(p.progression).maxHealth, p.fighter.hp + 6);
        c.foodReady = tick + 40;
        return 'lobster_eaten';
    }
    if (command === 'mine' || command === 'lobster') {
        if (!near(pos, MINE_SPOTS[command === 'mine' ? 'ore' : 'lobster']))
            return 'mine_range';
        if (c.activity)
            return 'mine_busy';
        if (w[command === 'mine' ? 'oreStock' : 'lobsterStock'] === 0)
            return 'mine_empty';
        if (command === 'mine' ? Object.values(p.skilling.pack).reduce((a, b) => a + b, 0) >= 12 : c.venom + c.lobsters >= 20)
            return 'mine_full';
        c.activity = { kind: command, finishTick: tick + (command === 'mine' ? 100 : 140) };
        return command === 'mine' ? 'mine_started' : 'lobster_started';
    }
    const i = Number(command.slice(-1)), m = w.scorpions[i], target = SCORPION_POINTS[i];
    if (!near(pos, target, (override ?? WEAPONS[p.inventory.weapon ?? 'unarmed']).range))
        return 'mine_range';
    if (c.activity)
        return 'mine_busy';
    if (m.hp === 0)
        return 'scorpion_dead';
    if (tick < p.fighter.attackReady)
        return 'attack_cooldown';
    p.fighter.attackReady = tick + (override ?? WEAPONS[p.inventory.weapon ?? 'unarmed']).cooldown;
    const damage = Math.min(m.hp, override?.damage ?? (WEAPONS[p.inventory.weapon ?? 'unarmed'].damage + (p.inventory.weapon === 'ash_staff' ? combatBonuses(p.progression).magicDamage : combatBonuses(p.progression).meleeDamage)));
    m.hp -= damage;
    if (override) {
        awardSkillXP(p.progression, override.skill, damage * 4);
        awardSkillXP(p.progression, 'hitpoints', damage);
    }
    else
        awardDamage(p.progression, damage);
    if (m.hp === 0)
        return defeat(w, m, p, tick);
    if (!protectedCombat) {
        m.target = p.id;
        if (!m.attackAt)
            m.attackAt = tick + 30;
    }
    if (!override)
        inflictPoison(w, p, tick, v => m.poison = v);
    return 'scorpion_hit';
}
export function advanceMine(w, players, encounter, tick, onResult) {
    for (const kind of ['ore', 'lobster']) {
        const stock = kind === 'ore' ? 'oreStock' : 'lobsterStock', respawn = kind === 'ore' ? 'oreRespawn' : 'lobsterRespawn';
        if (w[stock] === 0 && tick >= w[respawn]) {
            w[stock] = 3;
            w[respawn] = 0;
        }
    }
    for (const { player: p, position } of players) {
        const c = p.cave;
        if (c.coatingWeapon && (tick >= c.coatingUntil || p.inventory.weapon !== c.coatingWeapon)) {
            c.coatingWeapon = null;
            c.coatingUntil = 0;
        }
        const a = c.activity;
        if (!a)
            continue;
        const spot = MINE_SPOTS[a.kind === 'mine' ? 'ore' : 'lobster'];
        if (!near(position, spot) || p.fighter.hp === 0) {
            c.activity = null;
            onResult(p, 'mine_cancelled');
        }
        else if (tick >= a.finishTick) {
            c.activity = null;
            const stock = a.kind === 'mine' ? 'oreStock' : 'lobsterStock', respawn = a.kind === 'mine' ? 'oreRespawn' : 'lobsterRespawn';
            if (w[stock] === 0) {
                onResult(p, 'mine_empty');
                continue;
            }
            if (a.kind === 'mine' ? Object.values(p.skilling.pack).reduce((n, v) => n + v, 0) >= 12 : c.venom + c.lobsters >= 20) {
                onResult(p, 'mine_full');
                continue;
            }
            w[stock]--;
            if (w[stock] === 0)
                w[respawn] = tick + (a.kind === 'mine' ? 500 : 400);
            if (a.kind === 'mine') {
                p.skilling.pack.ore++;
                awardNoncombatXP(p.skilling, 'mining', 25);
                onResult(p, 'mine_gathered');
            }
            else {
                c.lobsters++;
                awardNoncombatXP(p.skilling, 'fishing', 30);
                onResult(p, 'lobster_caught');
            }
        }
    }
    const pulse = (poison, hp) => { if (!poison)
        return { poison: null, hp }; if (tick > poison.until)
        return { poison: null, hp }; if (tick >= poison.next) {
        hp = Math.max(0, hp - 1);
        poison.next += 40;
        if (poison.next > poison.until)
            return { poison: null, hp };
    } return { poison, hp }; };
    for (const [i, m] of w.scorpions.entries()) {
        if (m.hp === 0) {
            if (tick >= m.respawnAt) {
                Object.assign(m, { hp: 20, respawnAt: 0, attackAt: 0, target: null, poison: null, round: Math.min(1000000, m.round + 1) });
            }
            continue;
        }
        const owner = m.poison?.owner, pulsed = pulse(m.poison, m.hp);
        m.hp = pulsed.hp;
        m.poison = pulsed.poison;
        if (m.hp === 0) {
            const credited = players.find(v => v.player.id === owner && near(v.position, SCORPION_POINTS[i], 12));
            const code = defeat(w, m, credited?.player, tick);
            if (credited)
                onResult(credited.player, code);
            continue;
        }
        if (m.attackAt && tick >= m.attackAt) {
            const target = players.find(v => v.player.id === m.target && !v.protectedCombat && v.player.fighter.hp > 0 && near(v.position, SCORPION_POINTS[i], 3));
            if (target) {
                const f = target.player.fighter;
                if (tick > f.guardUntil) {
                    f.hp = Math.max(0, f.hp - Math.max(1, 2 - combatBonuses(target.player.progression).damageReduction - Number(target.player.life?.ward ?? false)));
                    if (f.hp === 0) {
                        f.recoverAt = tick + 100;
                        f.contributed = false;
                    }
                }
                m.attackAt = tick + 30;
            }
            else {
                m.attackAt = 0;
                m.target = null;
            }
        }
    }
    if (encounter.hp === 0)
        w.wardenPoison = null;
    else {
        const v = pulse(w.wardenPoison, encounter.hp);
        encounter.hp = v.hp;
        w.wardenPoison = v.poison;
        if (encounter.hp === 0) {
            encounter.strikeAt = 0;
            encounter.respawnAt = tick + 160;
            w.wardenPoison = null;
        }
    }
}
