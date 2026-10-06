import { freshHarvest, freshHarvestWorld, checkedHarvest, checkedHarvestWorld, harvestItem, harvestSites as defaultHarvestSites, startHarvest, finishHarvest, HARVEST_RESULTS, HARVEST_IDS } from './harvest-content.js';
import { freshBanking, checkedBanking, bankAction, isBankCommand, syncBank, harvestSlots, BANK_RESULTS } from './realm-bank.js';
import { LIFE_RESULTS, isLifeCommand, freshLifeLedger, checkedLifeLedger, freshSkillLife, checkedSkillLife, persistSkillLife, lifeCommand, advanceSkillLife, lifeBusy, creditSlayer, prayerCapacity } from './skill-life.js';
import { freshLedger, checkedLedger, freshSupplies, checkedSupplies, freshMineWorld, mineView, checkedMineView, isMineCommand, mineCommand, advanceMine, inflictPoison, MINE_RESULTS } from './mountain-mine.js';
import { isTrainingMethod, trainingMethod, trainingEligibility, completeWorkshop } from './skill-curriculum.js';
import { freshGatherNodes, checkedGatherNodes, regrowNodes, harvestNode } from './gather-nodes.js';
import { freshFighter, freshEncounter, combatAction, finishEncounter, checkedFighter, checkedEncounter } from './encounter.js';
import { isItem, freshInventory, copyInventory, checkedInventory, grantReward, equipItem, unequipItem } from './inventory.js';
import { freshProgression, checkedProgression, migrateProgression, combatBonuses, isTrainingMode, awardDamage } from './progression.js';
import { beginPractice, advancePractice, checkedPracticeChallenge, isPracticeResponse, PRACTICE_STEPS } from './practice-interaction.js';
import { PRACTICE_COOLDOWN_TICKS, PRACTICE_XP, isPracticeSkill, checkedPracticeTick } from './practice.js';
import { SKILLS, awardSkillXP, level } from './progression.js';
import { awardNoncombatXP } from './skilling.js';
import { canEquip, canTrain } from './weapon-builds.js';
import { freshSkilling, checkedSkilling, migrateSkilling, isSkillCommand, skillAction, awardWardenEssence, grantResonanceGatherBonus } from './skilling.js';
import { isResonanceCast } from './resonance-codex.js';
import { checkedResonanceState, checkedPersistentResonance, restoreResonance, persistResonance, expireResonance, castResonance, consumeResonance, resonanceBonus, resonanceEffectForSkill } from './resonance-authority.js';
export const SKINS = ['adventurer', 'elder', 'traveler', 'villager', 'seraphine', 'vector'];
export const RESULT_TEXT = { ...LIFE_RESULTS, ...MINE_RESULTS, practice_started: 'Follow the three marked actions. XP is awarded only on completion.', practice_step: 'Good action. Follow the next marked target.', practice_early: 'Let the action settle before responding.', practice_miss: 'The drill slipped. No XP awarded; try again after recovery.', practice_stale: 'That drill response is no longer current.', practice_busy: 'Finish or cancel the current drill first.', practice_cancelled: 'Drill cancelled. No XP awarded.', practice_done: 'Practice complete. +1 XP to the chosen skill; no items awarded.', practice_wait: 'Practice recovery: one action every five seconds across all skills.', practice_full: 'This skill has reached its XP storage cap.', training_changed: 'Training changed. Style XP goes to the selected skill; damage also trains Hitpoints.', training_incompatible: 'Choose a training mode compatible with your weapon.', equipment_requirements: 'You do not meet the weapon requirements.', attack_hit: 'Hit the Lantern Warden.', attack_cooldown: 'Your weapon is recovering.', guarding: 'Guard raised for 0.8 seconds.', guard_cooldown: 'Guard is recovering.', recovering: 'Recovering — no items are lost.', warden_resting: 'Warden resets in eight seconds.', warden_defeated: 'Warden cleared! Contributors gain a session victory.', item_claimed: 'Reward added to your pack.', item_equipped: 'Weapon equipped and shared with nearby players.', item_unequipped: 'Weapon returned to your pack.', item_unavailable: 'That item is not in your pack.', reward_unavailable: 'Complete Quiet Tithe, then claim one reward from Halden.', equipped: 'Appearance shared with the realm.', lit: 'You lit the landing beacon.', already_lit: 'The beacon is already lit.', out_of_range: 'Move within 3 metres of the target.', quest_accepted: 'Halden: Bring me three bundles from the far reed patch.', quest_unavailable: 'This quest is already accepted or completed.', quest_not_active: 'Speak to Halden before gathering reeds.', gathered: 'Reed bundle gathered.', gather_wait: 'Give the reeds a moment before gathering again.', patch_empty: 'The shared reed patch is regrowing.', inventory_full: 'You have all three bundles. Return to Halden.', requirements_not_met: 'Halden needs three reed bundles.', quest_completed: 'Quiet Tithe completed. You received one offering token.', resonance_cast: 'The PolyCodex answers. Magic and Runecrafting XP awarded; one attunement effect is active.', resonance_wait: 'The PolyCodex is still settling between chords.', resonance_range: 'Stand at the celestial observatory PolyCodex to resonate a chord.', resonance_cap: 'Your PolyCodex attunement ledger is full.', resonance_guard_bonus: 'Ward Glimmer reinforced your guard and granted bonus Defence XP.' };
export const SKILL_RESULT_TEXT = { ...HARVEST_RESULTS, ...BANK_RESULTS, curriculum_done: 'Workshop project complete. Banked inputs consumed; skill XP awarded. Project donated to the settlement.', curriculum_level: 'Your skill level does not meet this method’s requirement.', curriculum_materials: 'Bank the listed materials before starting this project.', skill_node_empty: 'That shared resource is depleted. Wait for it to regrow.', skill_range: 'Gather within 8 metres of the far landing. Bank/craft within 3 metres of Halden.', skill_gathered: 'Resource gathered. The completed method’s profession XP was awarded.', skill_wait: 'Your gathering tool is recovering.', skill_pack_full: 'Your 12-unit resource pack is full. Bank at Halden.', skill_banked: 'Resource pack deposited in your personal bank.', skill_bank_full: 'Bank resource limit reached.', skill_upgraded: 'Next tool tier crafted! Resource yield increased.', skill_requirements: 'Check the next tool recipe: profession levels, banked materials and Warden essence are required.', skill_max_tool: 'Masterwork tools are already unlocked.', skill_resonance_bonus: 'Resonance empowered the successful action with one bonus resource or bonus skill XP.' };
const object = (x, keys) => { if (!x || typeof x !== 'object' || Array.isArray(x) || Object.keys(x).length !== keys.length || !keys.every(k => Object.hasOwn(x, k)))
    throw new Error('Invalid game fields'); return x; };
const seq = (x) => typeof x === 'number' && Number.isSafeInteger(x) && x >= 0;
const skin = (x) => typeof x === 'string' && SKINS.includes(x);
const point = (x) => { const p = object(x, ['x', 'y', 'z']); if (!Object.values(p).every(n => typeof n === 'number' && Number.isFinite(n) && Math.abs(n) <= 1e6))
    throw new Error('Invalid game position'); return p; };
const quest = (x) => { const q = object(x, ['status', 'reeds', 'tithes', 'gatherReadyTick']); if (!['available', 'active', 'completed'].includes(q.status) || !seq(q.reeds) || q.reeds > 3 || !seq(q.tithes) || q.tithes > 1 || !seq(q.gatherReadyTick) || q.status === 'completed' && (q.reeds !== 0) || q.status !== 'completed' && q.tithes !== 0 || q.status === 'available' && (q.reeds !== 0 || q.gatherReadyTick !== 0))
    throw new Error('Invalid quest state'); return q; };
const persistentQuest = (x) => { const q = object(x, ['status', 'reeds', 'tithes', 'gatherCooldownTicks']); if (!['available', 'active', 'completed'].includes(q.status) || !seq(q.reeds) || q.reeds > 3 || !seq(q.tithes) || q.tithes > 1 || !seq(q.gatherCooldownTicks) || q.gatherCooldownTicks > 200 || q.status === 'completed' && (q.reeds !== 0) || q.status !== 'completed' && q.tithes !== 0 || q.status === 'available' && (q.reeds !== 0 || q.gatherCooldownTicks !== 0))
    throw new Error('Invalid persistent quest state'); return q; };
export function checkedPersistentPlayerState(x) {
    const version = !!x && typeof x === 'object' ? x.version : undefined;
    const keys = ['version', 'skin', 'quest', 'inventory'];
    if (version !== 1)
        keys.push('progression');
    if (typeof version === 'number' && version >= 3)
        keys.push('skilling');
    if (typeof version === 'number' && version >= 5)
        keys.push('practiceReadyTick');
    if (typeof version === 'number' && version >= 6)
        keys.push('resonance');
    if (typeof version === 'number' && version >= 7)
        keys.push('cave');
    if (typeof version === 'number' && version >= 8)
        keys.push('life');
    if (typeof version === 'number' && version >= 10)
        keys.push('harvest', 'banking');
    const r = object(x, keys);
    if (![1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(Number(r.version)) || typeof r.version !== 'number' || !skin(r.skin))
        throw Error('Invalid persistent player');
    const q = persistentQuest(r.quest), inventory = checkedInventory(r.inventory, Number(version) < 10), progression = version === 1 ? freshProgression() : Number(version) >= 4 ? checkedProgression(r.progression) : migrateProgression(r.progression), skilling = Number(version) >= 4 ? checkedSkilling(r.skilling) : version === 3 ? migrateSkilling(r.skilling) : freshSkilling(), resonance = Number(version) >= 6 ? checkedPersistentResonance(r.resonance, Number(version) < 9) : checkedPersistentResonance({ cooldownTicks: 0, casts: 0, mastered: [] }), life = Number(version) >= 8 ? checkedLifeLedger(r.life) : freshLifeLedger();
    if (life.prayerPoints > prayerCapacity(progression))
        throw Error('Prayer exceeds earned capacity');
    if (skilling.readyTick > 40)
        throw Error('Invalid persistent skilling cooldown');
    if (inventory.rewardClaimed && (q.status !== 'completed' || q.tithes !== 0) || q.status === 'completed' && !inventory.rewardClaimed && q.tithes !== 1 || inventory.weapon !== null && !canEquip(progression, inventory.weapon))
        throw Error('Invalid persistent reward conservation');
    const h = Number(version) >= 10 ? checkedHarvest(r.harvest) : freshHarvest(), banking = Number(version) >= 10 ? checkedBanking(r.banking) : freshBanking();
    if (Object.values(h.pack).reduce((a, b) => a + b, 0) + Object.values(banking.notes).filter(n => n > 0).length > 28)
        throw Error('Harvest pack slots exceeded');
    return { version: 10, harvest: { pack: h.pack, bank: h.bank }, banking, life, cave: Number(version) >= 7 ? checkedLedger(r.cave) : freshLedger(), practiceReadyTick: Number(version) >= 5 ? checkedPracticeTick(r.practiceReadyTick, PRACTICE_COOLDOWN_TICKS) : 0, skin: r.skin, quest: { ...q }, inventory: copyInventory(inventory), progression, skilling, resonance };
}
export const freshPersistentPlayerState = () => ({ version: 10, harvest: { pack: freshHarvest().pack, bank: freshHarvest().bank }, banking: freshBanking(), life: freshLifeLedger(), cave: freshLedger(), practiceReadyTick: 0, skin: 'adventurer', quest: { status: 'available', reeds: 0, tithes: 0, gatherCooldownTicks: 0 }, inventory: freshInventory(), progression: freshProgression(), skilling: freshSkilling(), resonance: { cooldownTicks: 0, casts: 0, mastered: [] } });
const parse = (text, limit) => { if (typeof text !== 'string' || new TextEncoder().encode(text).length > limit)
    throw new Error('Game message too large'); return JSON.parse(text); };
export function decodeAction(text) { const r = object(parse(text, 256), ['kind', 'sequence', 'action', 'value']); if (r.kind !== 'action' || !seq(r.sequence) || !(r.action === 'bank' && isBankCommand(r.value) || r.action === 'harvest' && (r.value === 'cancel' || !!harvestItem(r.value)) || r.action === 'skill-life' && isLifeCommand(r.value) || r.action === 'cave' && isMineCommand(r.value) || r.action === 'curriculum' && isTrainingMethod(r.value) || r.action === 'practice-step' && isPracticeResponse(r.value) || r.action === 'practice' && isPracticeSkill(r.value) || r.action === 'skilling' && isSkillCommand(r.value) || (r.action === 'claim' || r.action === 'equip') && isItem(r.value) || r.action === 'unequip' && r.value === 'weapon' || r.action === 'combat' && ['attack', 'guard'].includes(r.value) || r.action === 'training' && isTrainingMode(r.value) || r.action === 'appearance' && skin(r.value) || r.action === 'beacon' && r.value === 'light' || r.action === 'quest' && ['accept', 'gather', 'submit'].includes(r.value) || r.action === 'resonance' && isResonanceCast(r.value)))
    throw new Error('Invalid action'); return r; }
export function decodeGameState(text) {
    const r = object(parse(text, 32768), ['kind', 'harvest', 'banking', 'harvestWorld', 'harvestSites', 'life', 'cave', 'caveWorld', 'revision', 'tick', 'beacon', 'camp', 'codex', 'patch', 'gatherNodes', 'quest', 'inventory', 'fighter', 'progression', 'skilling', 'resonance', 'practiceReadyTick', 'practiceChallenge', 'encounter', 'players', 'result']);
    checkedHarvestWorld(r.harvestWorld, Number(r.tick));
    if (!Array.isArray(r.harvestSites) || r.harvestSites.length !== HARVEST_IDS.length || new Set(r.harvestSites.map((s) => s.id)).size !== HARVEST_IDS.length)
        throw Error('Invalid harvest sites');
    for (const site of r.harvestSites) {
        object(site, ['id', 'position']);
        if (!harvestItem(site.id))
            throw Error('Unknown harvest site');
        point(site.position);
    }
    if ((r.quest === null) !== (r.harvest === null) || (r.quest === null) !== (r.banking === null))
        throw Error('Invalid harvest membership');
    if (r.harvest !== null) {
        const h = checkedHarvest(r.harvest, Number(r.tick)), b = checkedBanking(r.banking);
        if (Object.values(h.pack).reduce((a, b) => a + b, 0) + Object.values(b.notes).filter(n => n > 0).length > 28)
            throw Error('Harvest slots exceeded');
        if (h.activity && (r.practiceChallenge || r.life?.job || r.life?.course || r.cave?.activity))
            throw Error('Overlapping harvest');
    }
    if ((r.quest === null) !== (r.life === null))
        throw Error('Invalid skill-life membership');
    if (r.life !== null) {
        const l = checkedSkillLife(r.life, Number(r.tick));
        if (l.prayerPoints > prayerCapacity(checkedProgression(r.progression)))
            throw Error('Invalid Prayer capacity');
    }
    checkedGatherNodes(r.gatherNodes, Number(r.tick));
    checkedMineView(r.caveWorld, Number(r.tick));
    if (r.cave !== null)
        checkedSupplies(r.cave, Number(r.tick));
    if ((r.quest === null) !== (r.cave === null))
        throw Error('Invalid cave membership');
    if (r.life !== null && lifeBusy(r.life) && (r.practiceChallenge !== null || r.cave?.activity))
        throw Error('Overlapping skill activities');
    if (r.practiceChallenge !== null) {
        if (r.quest === null)
            throw Error('Invalid practice membership');
        checkedPracticeChallenge(r.practiceChallenge, Number(r.tick));
    }
    if ((r.quest === null) !== (r.practiceReadyTick === null))
        throw Error('Invalid private practice membership');
    if (r.practiceReadyTick !== null)
        checkedPracticeTick(r.practiceReadyTick, Number(r.tick) + PRACTICE_COOLDOWN_TICKS);
    if ((r.quest === null) !== (r.skilling === null))
        throw Error('Invalid private skilling membership');
    if (r.skilling !== null) {
        const s = checkedSkilling(r.skilling);
        if (s.readyTick > Number(r.tick) + 40)
            throw Error('Invalid skilling cooldown');
    }
    if ((r.quest === null) !== (r.resonance === null))
        throw Error('Invalid private resonance membership');
    if (r.resonance !== null)
        checkedResonanceState(r.resonance, Number(r.tick));
    if (r.kind !== 'game' || !seq(r.revision) || !seq(r.tick) || !Array.isArray(r.players) || r.players.length > 256)
        throw new Error('Invalid game state');
    checkedEncounter(r.encounter, r.tick);
    if (r.fighter !== null)
        checkedFighter(r.fighter, r.tick, r.progression === null ? 40 : combatBonuses(checkedProgression(r.progression)).maxHealth);
    if (r.progression !== null) {
        const p = checkedProgression(r.progression);
        if (r.fighter !== null && r.fighter.hp > combatBonuses(p).maxHealth)
            throw Error('Health exceeds earned level');
    }
    if ((r.quest === null) !== (r.fighter === null) || (r.quest === null) !== (r.progression === null))
        throw Error('Invalid fighter membership');
    const b = object(r.beacon, ['position', 'lit']);
    point(b.position);
    point(r.camp);
    point(r.codex);
    if (typeof b.lit !== 'boolean')
        throw new Error('Invalid beacon');
    const patch = object(r.patch, ['stock', 'respawnTick']);
    if (!seq(patch.stock) || patch.stock > 3 || !seq(patch.respawnTick))
        throw new Error('Invalid patch');
    if (patch.stock === 0 && (patch.respawnTick <= r.tick || patch.respawnTick - r.tick > 200) || patch.stock > 0 && patch.respawnTick !== 0)
        throw Error('Invalid resource clock');
    if (r.quest !== null) {
        const q = quest(r.quest);
        if (q.gatherReadyTick - r.tick > 20)
            throw Error('Invalid gather clock');
    }
    if (r.inventory !== null)
        checkedInventory(r.inventory);
    if ((r.quest === null) !== (r.inventory === null))
        throw Error('Invalid private state');
    if (r.quest !== null) {
        const q = quest(r.quest), inv = checkedInventory(r.inventory);
        if (inv.rewardClaimed && (q.status !== 'completed' || q.tithes !== 0) || q.status === 'completed' && !inv.rewardClaimed && q.tithes !== 1)
            throw Error('Invalid reward conservation');
    }
    const ids = new Set();
    for (const player of r.players) {
        const v = object(player, ['id', 'skin', 'weapon']);
        if (typeof v.id !== 'string' || !/^p[1-9][0-9]{0,15}$/.test(v.id) || ids.has(v.id) || !skin(v.skin) || !(v.weapon === null || isItem(v.weapon)))
            throw new Error('Invalid appearance');
        ids.add(v.id);
    }
    if (r.result !== null) {
        const v = object(r.result, ['sequence', 'code']);
        if (!seq(v.sequence) || typeof v.code !== 'string' || !(Object.hasOwn(RESULT_TEXT, v.code) || Object.hasOwn(SKILL_RESULT_TEXT, v.code)))
            throw new Error('Invalid action result');
    }
    if (r.practiceChallenge !== null) {
        const c = r.practiceChallenge;
        if (c.method && trainingEligibility(checkedProgression(r.progression), checkedSkilling(r.skilling), trainingMethod(c.method)) === 'level')
            throw Error('Challenge exceeds earned skill level');
    }
    return r;
}
const copyPlayer = (p, tick) => ({ ...p, harvest: checkedHarvest(p.harvest, tick), banking: checkedBanking(p.banking), life: checkedSkillLife(p.life, tick), cave: checkedSupplies(p.cave, tick), practiceChallenge: p.practiceChallenge ? { ...p.practiceChallenge } : null, skilling: checkedSkilling(p.skilling), resonance: { ...checkedResonanceState(p.resonance, tick), lastChord: [...p.resonance.lastChord] }, progression: checkedProgression(p.progression), pending: p.pending.map(a => ({ ...a })), result: p.result ? { ...p.result } : null, quest: { ...p.quest }, fighter: { ...p.fighter }, inventory: copyInventory(p.inventory) });
const nearChallenge = (p, c, camp, beacon) => { const target = c.reward === 'gathering' ? beacon : camp; return !!p && Math.hypot(p.x - target.x, p.y - target.y, p.z - target.z) <= (c.reward === 'gathering' ? 8 : 3); };
const near = (p, target, radius = 3) => !!p && Math.hypot(p.x - target.x, p.z - target.z) <= radius;
/** All gameplay transitions are staged with movement by RealmRuntime. */
export class GameActions {
    mineWorld = freshMineWorld();
    players = new Map();
    protectedCombat = new Set();
    lit = false;
    revision = 0;
    tick = 0;
    stock = 3;
    respawnTick = 0;
    harvestWorld = freshHarvestWorld();
    harvestSites;
    gatherNodes = freshGatherNodes();
    encounter = freshEncounter();
    beacon;
    camp;
    codex;
    constructor(beacon, camp = beacon, codex = camp, sites) { this.harvestSites = structuredClone(sites ?? defaultHarvestSites(camp, beacon)); this.beacon = { ...point(beacon) }; this.camp = { ...point(camp) }; this.codex = { ...point(codex) }; }
    join(connection, id, persisted, protectedCombat = false) { if (typeof connection !== 'string' || !connection || connection.length > 128 || this.players.has(connection) || [...this.players.values()].some(p => p.id === id) || this.players.size >= 256 || !/^p[1-9][0-9]{0,15}$/.test(id))
        throw new Error('Invalid action player'); const saved = persisted ? checkedPersistentPlayerState(persisted) : freshPersistentPlayerState(), ready = saved.quest.status === 'available' ? 0 : this.tick + saved.quest.gatherCooldownTicks; if (!Number.isSafeInteger(ready))
        throw new Error('Persistent cooldown overflow'); this.players.set(connection, { id, harvest: checkedHarvest(saved.harvest), banking: checkedBanking(saved.banking), life: freshSkillLife(saved.life), cave: freshSupplies(saved.cave), practiceChallenge: null, practiceReadyTick: checkedPracticeTick(this.tick + saved.practiceReadyTick), skilling: { ...checkedSkilling(saved.skilling), readyTick: this.tick + saved.skilling.readyTick }, resonance: restoreResonance(saved.resonance, this.tick), progression: checkedProgression(saved.progression), fighter: freshFighter(combatBonuses(saved.progression).maxHealth), skin: saved.skin, sequence: -1, pending: [], result: null, inventory: copyInventory(saved.inventory), quest: { status: saved.quest.status, reeds: saved.quest.reeds, tithes: saved.quest.tithes, gatherReadyTick: ready } }); if (protectedCombat)
        this.protectedCombat.add(connection); }
    leave(connection) { this.players.delete(connection); this.protectedCombat.delete(connection); }
    receive(connection, text) { const p = this.players.get(connection); if (!p || p.pending.length >= 8)
        return false; try {
        const a = decodeAction(text);
        if (a.sequence <= p.sequence)
            return false;
        p.sequence = a.sequence;
        p.pending.push(a);
        return true;
    }
    catch {
        return false;
    } }
    stagedCommit(positionFor) {
        const next = new GameActions(this.beacon, this.camp, this.codex, this.harvestSites);
        next.lit = this.lit;
        next.revision = this.revision;
        next.tick = this.tick;
        next.stock = this.stock;
        next.respawnTick = this.respawnTick;
        next.harvestWorld = checkedHarvestWorld(this.harvestWorld, this.tick);
        next.mineWorld = structuredClone(this.mineWorld);
        next.gatherNodes = checkedGatherNodes(this.gatherNodes, this.tick);
        next.encounter = { ...this.encounter };
        next.players = new Map([...this.players].map(([c, p]) => [c, copyPlayer(p, this.tick)]));
        next.protectedCombat = new Set(this.protectedCombat);
        next.commit(positionFor);
        return next;
    }
    inspection() { return { harvestWorld: checkedHarvestWorld(this.harvestWorld, this.tick), harvestSites: structuredClone(this.harvestSites), mineWorld: structuredClone(this.mineWorld), gatherNodes: checkedGatherNodes(this.gatherNodes, this.tick), encounter: { ...this.encounter }, revision: this.revision, tick: this.tick, beacon: { position: { ...this.beacon }, lit: this.lit }, camp: { ...this.camp }, patch: { stock: this.stock, respawnTick: this.respawnTick }, players: [...this.players.values()].map(p => { const { id, skin, sequence, pending, result, quest, inventory, fighter, progression, skilling, resonance, practiceReadyTick, practiceChallenge, cave, life, harvest, banking } = copyPlayer(p, this.tick); return { id, skin, sequence, pending, result, quest, inventory, fighter, progression, skilling, resonance, practiceReadyTick, practiceChallenge, cave, life, harvest, banking }; }).sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0) }; }
    persistentState(connection) { const p = this.players.get(connection); if (!p)
        return; const remaining = p.quest.status === 'active' ? Math.max(0, p.quest.gatherReadyTick - this.tick) : 0; return checkedPersistentPlayerState({ version: 10, harvest: { pack: p.harvest.pack, bank: p.harvest.bank }, banking: p.banking, life: persistSkillLife(p.life), cave: { venom: p.cave.venom, lobsters: p.cave.lobsters, bankVenom: p.cave.bankVenom, bankLobsters: p.cave.bankLobsters }, resonance: persistResonance(p.resonance, this.tick), practiceReadyTick: Math.max(0, p.practiceReadyTick - this.tick), skilling: { ...checkedSkilling(p.skilling), readyTick: Math.max(0, p.skilling.readyTick - this.tick) }, progression: p.progression, skin: p.skin, quest: { status: p.quest.status, reeds: p.quest.reeds, tithes: p.quest.tithes, gatherCooldownTicks: remaining }, inventory: p.inventory }); }
    validate(expectedIds) {
        if (!Number.isSafeInteger(this.mineWorld.rng) || this.mineWorld.rng < 0 || this.mineWorld.rng > 4294967295)
            throw Error('Invalid cave RNG');
        const state = this.snapshot('', expectedIds);
        decodeGameState(JSON.stringify(state));
        if (this.players.size !== expectedIds.length || state.players.length !== expectedIds.length)
            throw new Error('Gameplay membership mismatch');
        for (const [connection, p] of this.players) {
            decodeGameState(JSON.stringify(this.snapshot(connection, [])));
            if (p.pending.length !== 0 || p.sequence !== (p.result?.sequence ?? -1))
                throw new Error('Uncommitted gameplay input');
        }
    }
    commit(positionFor) {
        const harvestWorld = checkedHarvestWorld(this.harvestWorld, this.tick);
        const mineWorld = structuredClone(this.mineWorld);
        const nodes = checkedGatherNodes(this.gatherNodes, this.tick);
        const encounter = { ...this.encounter };
        const candidate = new Map();
        let lit = this.lit, changed = false, stock = this.stock, respawnTick = this.respawnTick;
        const tick = this.tick + 1;
        if (!Number.isSafeInteger(tick))
            throw new Error('Gameplay clock exhausted');
        for (const node of Object.values(harvestWorld))
            if (node.stock === 0 && tick >= node.readyTick) {
                node.stock = 3;
                node.readyTick = 0;
                changed = true;
            }
        if (regrowNodes(nodes, tick))
            changed = true;
        if (stock === 0 && tick >= respawnTick) {
            stock = 3;
            respawnTick = 0;
            changed = true;
        }
        for (const [connection, p] of this.players) {
            const next = copyPlayer(p, this.tick);
            next.pending = [];
            if (expireResonance(next.resonance, tick))
                changed = true;
            if (next.practiceChallenge && (tick >= next.practiceChallenge.expiresTick || next.fighter.hp === 0 || !nearChallenge(positionFor(connection), next.practiceChallenge, this.camp, this.beacon))) {
                next.practiceChallenge = null;
                changed = true;
            }
            for (const a of p.pending) {
                changed = true;
                let code;
                if (next.harvest.activity && a.action !== 'harvest' && a.action !== 'appearance')
                    code = 'harvest_busy';
                else if (lifeBusy(next.life) && a.action !== 'skill-life' && a.action !== 'appearance')
                    code = 'life_busy';
                else if (next.cave.activity && a.action !== 'cave' && a.action !== 'appearance' && !(a.action === 'combat' && a.value === 'guard'))
                    code = 'mine_busy';
                else if (a.action === 'bank') {
                    if (next.fighter.hp === 0)
                        code = 'recovering';
                    else if (!near(positionFor(connection), this.camp))
                        code = 'bank_range';
                    else if (next.practiceChallenge || next.cave.activity || lifeBusy(next.life) || next.harvest.activity)
                        code = 'bank_busy';
                    else
                        code = bankAction(next, a.value);
                }
                else if (a.action === 'harvest') {
                    const site = this.harvestSites.find(s => s.id === a.value);
                    if (a.value === 'cancel') {
                        next.harvest.activity = null;
                        code = 'harvest_cancelled';
                    }
                    else if (next.practiceChallenge || next.cave.activity || lifeBusy(next.life))
                        code = 'harvest_busy';
                    else if (!site || !near(positionFor(connection), site.position, 2.5))
                        code = 'harvest_range';
                    else if (next.fighter.hp === 0)
                        code = 'recovering';
                    else
                        code = startHarvest(next.harvest, next.skilling, harvestWorld, a.value, tick, 28 - harvestSlots(next));
                }
                else if (a.action === 'skill-life') {
                    if (lifeBusy(next.life) && !['cancel', 'checkpoint', 'ward-off'].includes(a.value))
                        code = 'life_busy';
                    else if (next.practiceChallenge || next.cave.activity)
                        code = 'practice_busy';
                    else if (a.value.startsWith('shoot-') || a.value.startsWith('spell-')) {
                        const ranged = a.value.startsWith('shoot-'), skill = ranged ? 'ranged' : 'magic', ammo = ranged ? 'arrows' : 'runes', bonus = Math.floor((level(next.progression.xp[skill]) - 1) / 10), profile = { skill, damage: (ranged ? 6 : 8) + bonus, range: ranged ? 7 : 8, cooldown: ranged ? 24 : 28 };
                        if (next.fighter.hp === 0)
                            code = 'recovering';
                        else if (!next.life.pack[ammo])
                            code = 'life_ammo';
                        else if (a.value.endsWith('warden')) {
                            const before = encounter.hp;
                            code = combatAction(next.fighter, encounter, 'attack', null, positionFor(connection), this.beacon, tick, 0, profile);
                            if (code === 'attack_hit' || code === 'warden_defeated') {
                                next.life.pack[ammo]--;
                                awardSkillXP(next.progression, skill, (before - encounter.hp) * 4);
                                awardSkillXP(next.progression, 'hitpoints', before - encounter.hp);
                                if (code === 'attack_hit')
                                    code = 'life_shot';
                            }
                        }
                        else {
                            code = mineCommand(mineWorld, next, ('attack-' + a.value.slice(-1)), positionFor(connection), this.camp, tick, this.protectedCombat.has(connection), profile);
                            if (['scorpion_hit', 'scorpion_dead', 'venom_drop'].includes(code)) {
                                next.life.pack[ammo]--;
                                if (code === 'scorpion_hit')
                                    code = 'life_shot';
                                else
                                    creditSlayer(next);
                            }
                        }
                    }
                    else
                        code = lifeCommand(next, a.value, positionFor(connection), this.camp, this.beacon, tick);
                }
                else if (a.action === 'cave') {
                    if (a.value.startsWith('attack-') && !canTrain(next.inventory.weapon, next.progression.mode))
                        code = 'training_incompatible';
                    else if (next.practiceChallenge)
                        code = 'practice_busy';
                    else {
                        code = mineCommand(mineWorld, next, a.value, positionFor(connection), this.camp, tick, this.protectedCombat.has(connection));
                        if (code === 'scorpion_dead' || code === 'venom_drop')
                            creditSlayer(next);
                    }
                }
                else if (a.action === 'curriculum') {
                    const m = trainingMethod(a.value);
                    const eligible = trainingEligibility(next.progression, next.skilling, m);
                    if (!nearChallenge(positionFor(connection), { reward: m.kind }, this.camp, this.beacon))
                        code = 'skill_range';
                    else if (next.fighter.hp === 0)
                        code = 'recovering';
                    else if (next.practiceChallenge)
                        code = 'practice_busy';
                    else if (tick < next.practiceReadyTick || m.kind === 'gathering' && tick < next.skilling.readyTick)
                        code = 'skill_wait';
                    else if (eligible === 'level')
                        code = 'curriculum_level';
                    else if (eligible === 'materials')
                        code = 'curriculum_materials';
                    else if (m.kind === 'gathering' && nodes[m.skill].stock === 0)
                        code = 'skill_node_empty';
                    else if (m.kind === 'gathering' && Object.values(next.skilling.pack).reduce((n, k) => n + k, 0) + next.skilling.toolTier > 12)
                        code = 'skill_pack_full';
                    else {
                        next.practiceReadyTick = checkedPracticeTick(tick + PRACTICE_COOLDOWN_TICKS);
                        next.practiceChallenge = beginPractice(m.skill, next.id, tick, a.sequence, m.kind, m.id);
                        code = 'practice_started';
                    }
                }
                else if (a.action === 'practice') {
                    if (!near(positionFor(connection), this.camp))
                        code = 'out_of_range';
                    else if (next.fighter.hp === 0)
                        code = 'recovering';
                    else if (next.practiceChallenge)
                        code = 'practice_busy';
                    else if (tick < next.practiceReadyTick)
                        code = 'practice_wait';
                    else {
                        const xp = SKILLS.includes(a.value) ? next.progression.xp[a.value] : next.skilling.xp[a.value];
                        if (xp >= 200_000_000)
                            code = 'practice_full';
                        else {
                            next.practiceReadyTick = checkedPracticeTick(tick + PRACTICE_COOLDOWN_TICKS);
                            next.practiceChallenge = beginPractice(a.value, next.id, tick, a.sequence);
                            code = 'practice_started';
                        }
                    }
                }
                else if (a.action === 'practice-step') {
                    const c = next.practiceChallenge;
                    if (a.value === 'cancel') {
                        next.practiceChallenge = null;
                        code = 'practice_cancelled';
                    }
                    else if (!c)
                        code = 'practice_stale';
                    else if (!nearChallenge(positionFor(connection), c, this.camp, this.beacon)) {
                        next.practiceChallenge = null;
                        code = 'out_of_range';
                    }
                    else if (next.fighter.hp === 0) {
                        next.practiceChallenge = null;
                        code = 'recovering';
                    }
                    else {
                        const [token, step, pad] = a.value.split('/');
                        if (token !== c.token || Number(step) !== c.step)
                            code = 'practice_stale';
                        else if (tick < c.readyTick)
                            code = 'practice_early';
                        else if (Number(pad) !== c.target) {
                            next.practiceChallenge = null;
                            code = 'practice_miss';
                        }
                        else if (c.step + 1 < PRACTICE_STEPS) {
                            if (tick + (c.reward !== 'practice' ? 60 : 20) >= c.expiresTick) {
                                next.practiceChallenge = null;
                                code = 'practice_miss';
                            }
                            else {
                                next.practiceChallenge = advancePractice(c, tick);
                                code = 'practice_step';
                            }
                        }
                        else {
                            if (c.reward === 'workshop') {
                                code = completeWorkshop(next.progression, next.skilling, c.method);
                            }
                            else if (c.reward === 'gathering') {
                                code = nodes[c.skill].stock === 0 ? 'skill_node_empty' : skillAction(next.skilling, c.skill, tick);
                                if (code === 'skill_gathered') {
                                    harvestNode(nodes, c.skill, tick);
                                    if (c.method) {
                                        const method = trainingMethod(c.method);
                                        awardNoncombatXP(next.skilling, c.skill, method.xp - 25);
                                    }
                                }
                                const effect = resonanceEffectForSkill(c.skill);
                                if (code === 'skill_gathered' && effect && next.resonance.activeEffect === effect && grantResonanceGatherBonus(next.skilling, c.skill, resonanceBonus(effect)) && consumeResonance(next.resonance, effect, tick))
                                    code = 'skill_resonance_bonus';
                            }
                            else {
                                if (SKILLS.includes(c.skill))
                                    awardSkillXP(next.progression, c.skill, PRACTICE_XP);
                                else
                                    awardNoncombatXP(next.skilling, c.skill, PRACTICE_XP);
                                const effect = resonanceEffectForSkill(c.skill);
                                if (effect && next.resonance.activeEffect === effect && consumeResonance(next.resonance, effect, tick)) {
                                    if (SKILLS.includes(c.skill))
                                        awardSkillXP(next.progression, c.skill, resonanceBonus(effect));
                                    else
                                        awardNoncombatXP(next.skilling, c.skill, resonanceBonus(effect));
                                    code = 'skill_resonance_bonus';
                                }
                                else
                                    code = 'practice_done';
                            }
                            next.practiceChallenge = null;
                        }
                    }
                }
                else if (a.action === 'skilling') {
                    const atCamp = a.value === 'deposit' || a.value === 'upgrade', target = atCamp ? this.camp : this.beacon, pos = positionFor(connection);
                    if (!pos || Math.hypot(pos.x - target.x, pos.y - target.y, pos.z - target.z) > (atCamp ? 3 : 8))
                        code = 'skill_range';
                    else if (next.fighter.hp === 0)
                        code = 'recovering';
                    else if (atCamp) {
                        code = skillAction(next.skilling, a.value, tick);
                        if (code === 'skill_upgraded')
                            awardNoncombatXP(next.skilling, 'crafting', 25);
                    }
                    else if (nodes[a.value].stock === 0)
                        code = 'skill_node_empty';
                    else if (Object.values(next.skilling.pack).reduce((n, k) => n + k, 0) + next.skilling.toolTier > 12)
                        code = 'skill_pack_full';
                    else if (next.practiceChallenge)
                        code = 'practice_busy';
                    else if (tick < next.practiceReadyTick || tick < next.skilling.readyTick)
                        code = 'skill_wait';
                    else {
                        next.practiceReadyTick = checkedPracticeTick(tick + PRACTICE_COOLDOWN_TICKS);
                        next.practiceChallenge = beginPractice(a.value, next.id, tick, a.sequence, 'gathering');
                        code = 'practice_started';
                    }
                }
                else if (a.action === 'training') {
                    if (canTrain(next.inventory.weapon, a.value)) {
                        next.progression.mode = a.value;
                        code = 'training_changed';
                    }
                    else
                        code = 'training_incompatible';
                }
                else if (a.action === 'combat') {
                    const before = encounter.hp;
                    if (a.value === 'attack' && !canTrain(next.inventory.weapon, next.progression.mode))
                        code = 'training_incompatible';
                    else {
                        code = combatAction(next.fighter, encounter, a.value, next.inventory.weapon, positionFor(connection), this.beacon, tick, next.inventory.weapon === 'ash_staff' ? combatBonuses(next.progression).magicDamage : combatBonuses(next.progression).meleeDamage);
                        if (a.value === 'attack' && (code === 'attack_hit' || code === 'warden_defeated')) {
                            awardDamage(next.progression, before - encounter.hp);
                            if (encounter.hp > 0)
                                inflictPoison(mineWorld, next, tick, v => mineWorld.wardenPoison = v);
                        }
                        if (a.value === 'guard' && code === 'guarding' && consumeResonance(next.resonance, 'ward-glimmer', tick)) {
                            awardSkillXP(next.progression, 'defence', resonanceBonus('ward-glimmer'));
                            code = 'resonance_guard_bonus';
                        }
                    }
                }
                else if (a.action === 'resonance') {
                    if (!near(positionFor(connection), this.codex, 4))
                        code = 'resonance_range';
                    else if (next.fighter.hp === 0)
                        code = 'recovering';
                    else {
                        const cast = castResonance(next.resonance, a.value, tick);
                        if (!cast.ok)
                            code = cast.reason === 'cooldown' ? 'resonance_wait' : 'resonance_cap';
                        else {
                            awardSkillXP(next.progression, 'magic', 8);
                            awardNoncombatXP(next.skilling, 'runecrafting', 8);
                            code = 'resonance_cast';
                        }
                    }
                }
                else if (a.action === 'appearance') {
                    next.skin = a.value;
                    code = 'equipped';
                }
                else if (a.action === 'claim') {
                    if (!near(positionFor(connection), this.camp))
                        code = 'out_of_range';
                    else if (next.quest.status !== 'completed' || next.quest.tithes !== 1 || next.inventory.rewardClaimed)
                        code = 'reward_unavailable';
                    else {
                        const inv = grantReward(next.inventory, a.value);
                        if (!inv)
                            code = 'reward_unavailable';
                        else {
                            next.inventory = inv;
                            next.quest.tithes = 0;
                            code = 'item_claimed';
                        }
                    }
                }
                else if (a.action === 'equip' || a.action === 'unequip') {
                    if (a.action === 'equip' && !canEquip(next.progression, a.value))
                        code = 'equipment_requirements';
                    else {
                        const inv = a.action === 'equip' ? equipItem(next.inventory, a.value) : unequipItem(next.inventory);
                        if (!inv)
                            code = 'item_unavailable';
                        else {
                            if (next.inventory.weapon !== inv.weapon) {
                                next.cave.coatingWeapon = null;
                                next.cave.coatingUntil = 0;
                            }
                            next.inventory = inv;
                            code = a.action === 'equip' ? 'item_equipped' : 'item_unequipped';
                        }
                    }
                }
                else if (a.action === 'beacon') {
                    if (!near(positionFor(connection), this.beacon))
                        code = 'out_of_range';
                    else if (lit)
                        code = 'already_lit';
                    else {
                        lit = true;
                        code = 'lit';
                    }
                }
                else {
                    const q = next.quest;
                    if (!near(positionFor(connection), a.value === 'gather' ? this.beacon : this.camp))
                        code = 'out_of_range';
                    else if (a.value === 'accept') {
                        if (q.status !== 'available')
                            code = 'quest_unavailable';
                        else {
                            q.status = 'active';
                            code = 'quest_accepted';
                        }
                    }
                    else if (q.status !== 'active')
                        code = 'quest_not_active';
                    else if (a.value === 'gather') {
                        if (q.reeds >= 3)
                            code = 'inventory_full';
                        else if (tick < q.gatherReadyTick)
                            code = 'gather_wait';
                        else if (stock === 0)
                            code = 'patch_empty';
                        else {
                            q.reeds++;
                            q.gatherReadyTick = tick + 20;
                            stock--;
                            if (stock === 0)
                                respawnTick = tick + 200;
                            code = 'gathered';
                        }
                    }
                    else if (q.reeds < 3)
                        code = 'requirements_not_met';
                    else {
                        q.reeds = 0;
                        q.tithes = 1;
                        q.status = 'completed';
                        code = 'quest_completed';
                    }
                }
                next.result = { sequence: a.sequence, code };
            }
            candidate.set(connection, next);
        }
        for (const [connection, p] of candidate) {
            const site = this.harvestSites.find(s => s.id === p.harvest.activity?.id), code = finishHarvest(p.harvest, p.skilling, harvestWorld, tick, !!site && p.fighter.hp > 0 && near(positionFor(connection), site.position, 2.5), 28 - harvestSlots(p));
            if (code && p.result) {
                p.result = { sequence: p.result.sequence, code };
                changed = true;
            }
            syncBank(p);
        }
        changed ||= JSON.stringify(harvestWorld) !== JSON.stringify(this.harvestWorld) || [...candidate].some(([c, p]) => JSON.stringify(p.harvest) !== JSON.stringify(this.players.get(c).harvest) || JSON.stringify(p.banking) !== JSON.stringify(this.players.get(c).banking));
        advanceMine(mineWorld, [...candidate].map(([c, p]) => ({ player: p, position: positionFor(c), protectedCombat: this.protectedCombat.has(c) })), encounter, tick, (p, code) => { const player = p; if (code === 'scorpion_dead' || code === 'venom_drop')
            creditSlayer(player); if (player.result)
            player.result = { sequence: player.result.sequence, code }; changed = true; });
        finishEncounter(encounter, [...candidate].map(([c, p]) => ({ fighter: p.fighter, position: positionFor(c), maxHealth: combatBonuses(p.progression).maxHealth, damageReduction: combatBonuses(p.progression).damageReduction + Number(p.life.ward), protectedCombat: this.protectedCombat.has(c) })), this.beacon, this.camp, tick);
        for (const [c, p] of candidate) {
            const code = advanceSkillLife(p, positionFor(c), this.camp, this.beacon, tick);
            if (code && p.result)
                p.result = { sequence: p.result.sequence, code };
            if (JSON.stringify(p.life) !== JSON.stringify(this.players.get(c).life))
                changed = true;
        }
        for (const [c, p] of candidate)
            if (p.fighter.wins > this.players.get(c).fighter.wins)
                awardWardenEssence(p.skilling);
        changed ||= JSON.stringify(mineWorld) !== JSON.stringify(this.mineWorld) || [...candidate].some(([c, p]) => JSON.stringify(p.cave) !== JSON.stringify(this.players.get(c).cave));
        changed ||= JSON.stringify(encounter) !== JSON.stringify(this.encounter) || [...candidate].some(([c, p]) => JSON.stringify(p.fighter) !== JSON.stringify(this.players.get(c).fighter));
        if (changed && !Number.isSafeInteger(this.revision + 1))
            throw new Error('Gameplay revision exhausted');
        // Validate the complete detached candidate before exposing any transition, even
        // when this reducer is used directly without RealmRuntime's outer transaction.
        const staged = new GameActions(this.beacon, this.camp, this.codex, this.harvestSites);
        staged.harvestWorld = harvestWorld;
        staged.mineWorld = mineWorld;
        staged.gatherNodes = nodes;
        staged.encounter = encounter;
        staged.players = candidate;
        staged.protectedCombat = new Set(this.protectedCombat);
        staged.lit = lit;
        staged.tick = tick;
        staged.stock = stock;
        staged.respawnTick = respawnTick;
        staged.revision = this.revision + Number(changed);
        staged.validate([...candidate.values()].map(p => p.id));
        this.harvestWorld = harvestWorld;
        this.mineWorld = mineWorld;
        this.gatherNodes = nodes;
        this.encounter = encounter;
        this.players = candidate;
        this.lit = lit;
        this.tick = tick;
        this.stock = stock;
        this.respawnTick = respawnTick;
        this.revision = staged.revision;
    }
    snapshot(connection, visible) { const ids = new Set(visible), p = this.players.get(connection); return { kind: 'game', harvest: p ? checkedHarvest(p.harvest, this.tick) : null, banking: p ? checkedBanking(p.banking) : null, harvestWorld: checkedHarvestWorld(this.harvestWorld, this.tick), harvestSites: structuredClone(this.harvestSites), life: p ? checkedSkillLife(p.life, this.tick) : null, cave: p ? checkedSupplies(p.cave, this.tick) : null, caveWorld: mineView(this.mineWorld, this.tick), gatherNodes: checkedGatherNodes(this.gatherNodes, this.tick), codex: { ...this.codex }, practiceChallenge: p?.practiceChallenge ? { ...p.practiceChallenge } : null, practiceReadyTick: p ? p.practiceReadyTick : null, skilling: p ? checkedSkilling(p.skilling) : null, resonance: p ? { ...checkedResonanceState(p.resonance, this.tick), lastChord: [...p.resonance.lastChord] } : null, progression: p ? checkedProgression(p.progression) : null, encounter: { ...this.encounter }, fighter: p ? { ...p.fighter } : null, revision: this.revision, tick: this.tick, beacon: { position: { ...this.beacon }, lit: this.lit }, camp: { ...this.camp }, patch: { stock: this.stock, respawnTick: this.respawnTick }, quest: p ? { ...p.quest } : null, inventory: p ? copyInventory(p.inventory) : null, players: [...this.players.values()].filter(p => ids.has(p.id)).map(p => ({ id: p.id, skin: p.skin, weapon: p.inventory.weapon })), result: p?.result ? { ...p.result } : null }; }
}
