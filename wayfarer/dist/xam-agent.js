import { RESONANCE_BINDINGS, resonanceTrialChord } from './resonance-codex.js';
import { skillBook } from './skill-directory.js';
import { practiceResponse } from './practice-interaction.js';
import { encodeMoveIntent } from './movement.js';
import { XAM_TASKS, freshXamBrain, checkedXamBrain, chooseXamTask } from './xam-brain.js';
import { lifeRecipe } from './skill-life.js';
import { caveAt } from './cave-instances.js';
import { MINE_SPOTS, SCORPION_POINTS } from './mountain-mine.js';
import { curriculumFor } from './skill-curriculum.js';
import { level } from './progression.js';
import { TOOL_RECIPES, PROFESSIONS } from './skilling.js';
export const XAM_MAX_FOCUS_TICKS = 20 * 60 * 5;
const waitCodes = new Set(['practice_step', 'practice_early', 'practice_wait', 'skill_wait', 'attack_cooldown', 'out_of_range', 'skill_range', 'resonance_wait', 'life_course_early', 'patch_empty', 'gather_wait', 'skill_node_empty', 'mine_empty', 'mine_range', 'mine_full', 'practice_busy', 'mine_busy', 'life_busy']);
const expectedBlocks = new Set(['curriculum_level', 'curriculum_materials', 'skill_requirements', 'skill_max_tool', 'life_food_wait', 'lobster_unavailable', 'already_lit', 'life_empty', 'life_full', 'life_materials', 'life_not_ready', 'life_prayer_empty', 'venom_active', 'venom_missing', 'reward_unavailable', 'item_unavailable']);
/** Rule-based coverage controller. Never edits gameplay state, grants XP or bypasses validated commands. */
export class XamAgent {
    realm;
    nav;
    camp;
    goal;
    accepted;
    sites;
    connection = '@server-npc/xam';
    id;
    moveSequence = 0;
    actionSequence = 0;
    portalSequence = 0;
    pending;
    waitingJob;
    challengeFinish = false;
    caveFinish = false;
    taskStarted = false;
    lastTick = -1;
    path = [];
    pathGoal = '';
    retryTick = 0;
    focusStartedTick = 0;
    active = false;
    brain;
    cursor;
    phase = 'choosing activity';
    constructor(realm, nav, camp, goal, save, cursor = 0, accepted, brain, sites = {}) {
        this.realm = realm;
        this.nav = nav;
        this.camp = camp;
        this.goal = goal;
        this.accepted = accepted;
        this.sites = sites;
        if (!Number.isInteger(cursor) || cursor < 0 || cursor >= XAM_TASKS.length)
            throw Error('Invalid Xam cursor');
        this.cursor = cursor;
        this.brain = brain ? checkedXamBrain(brain) : freshXamBrain();
        this.active = !!brain && this.brain.selections > 0;
        this.focusStartedTick = realm.tick;
        this.id = realm.join(this.connection, save?.position ?? camp, save, { combatProtected: true }).id;
    }
    send(packet) { if (this.realm.receive(this.connection, packet)) {
        this.accepted?.(packet);
        return true;
    } return false; }
    action(action, value, finish = false) { const sequence = this.actionSequence++; if (this.send(JSON.stringify({ kind: 'action', sequence, action, value }))) {
        this.pending = { sequence, finish };
        const c = this.brain.coverage[XAM_TASKS[this.cursor].id];
        c.attempts = Math.min(1_000_000_000, c.attempts + 1);
    } }
    finish(code, kind = 'completed') { const c = this.brain.coverage[XAM_TASKS[this.cursor].id]; c[kind] = Math.min(1_000_000_000, c[kind] + 1); c.lastCode = code; this.active = false; this.pending = undefined; this.waitingJob = undefined; this.path = []; this.pathGoal = ''; this.challengeFinish = false; this.caveFinish = false; this.taskStarted = false; }
    stop() { this.send(encodeMoveIntent({ sequence: this.moveSequence++, dx: 0, dz: 0, mode: 'walk' })); }
    caves() { return this.nav.caves ?? []; }
    travel(target, range = 2.4) {
        const p = this.realm.stateFor(this.connection).position, area = caveAt(p), destination = caveAt(target);
        if (area !== destination) {
            const caves = this.caves(), current = caves.find(c => c.id === area);
            let next = current, dir = 'exit';
            const ancestors = [];
            let child = caves.find(c => c.id === destination);
            while (child) {
                ancestors.unshift(child.id);
                child = caves.find(c => c.id === child.parent);
            }
            const index = area ? ancestors.indexOf(area) : -1;
            if ((!area || index >= 0) && ancestors[index + 1]) {
                next = caves.find(c => c.id === ancestors[index + 1]);
                dir = 'enter';
            }
            if (!next) {
                this.finish('missing portal', 'blocked');
                return false;
            }
            const entrance = dir === 'enter' ? next.entrance : next.exit;
            if (Math.hypot(p.x - entrance.x, p.y - entrance.y, p.z - entrance.z) > 2.4) {
                this.move(entrance);
                return false;
            }
            this.stop();
            this.phase = 'travelling through ' + next.name;
            this.send(JSON.stringify({ kind: 'portal', sequence: this.portalSequence++, cave: next.id, direction: dir }));
            this.path = [];
            this.pathGoal = '';
            return false;
        }
        if (Math.hypot(p.x - target.x, p.y - target.y, p.z - target.z) > range) {
            this.move(target);
            return false;
        }
        this.stop();
        return true;
    }
    move(target) {
        const current = this.realm.stateFor(this.connection).position, tick = this.realm.tick, key = target.x + ':' + target.z;
        if (this.pathGoal !== key || (this.path.length === 0 && tick >= this.retryTick)) {
            this.pathGoal = key;
            const result = this.nav.findPath(current, target, 4096);
            this.path = result.status === 'found' ? result.points.slice(1) : [];
            this.retryTick = tick + 200;
            if (result.status !== 'found') {
                this.finish('path:' + result.status, 'failures');
                this.stop();
                return;
            }
        }
        while (this.path.length && Math.hypot(this.path[0].x - current.x, this.path[0].z - current.z) < .22)
            this.path.shift();
        const point = this.path[0], dx = point ? point.x - current.x : 0, dz = point ? point.z - current.z : 0, n = Math.hypot(dx, dz);
        this.send(encodeMoveIntent({ sequence: this.moveSequence++, dx: n ? dx / n : 0, dz: n ? dz / n : 0, mode: 'jog' }));
        this.phase = point ? 'travelling · ' + XAM_TASKS[this.cursor].id : 'path recovery';
    }
    at(target, action, value, finish = false, range = 2.4) { if (this.travel(target, range))
        this.action(action, value, finish); }
    gather(skill, g, finish = false) {
        if (Object.values(g.skilling.pack).reduce((a, b) => a + b, 0) + g.skilling.toolTier > 12) {
            this.at(this.camp, 'skilling', 'deposit');
            return;
        }
        if (this.realm.tick < Math.max(g.practiceReadyTick ?? 0, g.skilling.readyTick))
            return;
        const candidate = this.nav.check({ x: this.goal.x, z: this.goal.z + 6 }), target = candidate.ok ? candidate.position : this.goal;
        const methods = curriculumFor(skill).filter(m => m.level <= level(g.skilling.xp[skill]));
        this.at(target, 'curriculum', methods.at(-1).id, finish, 1);
    }
    bankResources() { this.at(this.camp, 'skilling', 'deposit'); }
    supply(item, count, g) {
        const l = g.life;
        if (l.pack[item] >= count)
            return true;
        if (l.bank[item] > 0) {
            this.at(this.camp, 'skill-life', 'withdraw-' + item);
            return false;
        }
        if (Object.values(l.pack).reduce((a, b) => a + b, 0) > 90) {
            this.at(this.camp, 'skill-life', 'deposit');
            return false;
        }
        const ids = { seeds: 'track', herbs: 'harvest', bars: 'smelt', lanterns: 'craft', arrows: 'fletch', runes: 'runes', meals: 'cook', potions: 'brew' };
        if (item === 'herbs') {
            if (l.cropReady)
                this.at(this.camp, 'skill-life', 'harvest');
            else if (l.cropTicks > 0) {
                this.travel(this.camp);
                this.phase = 'waiting for herb bed';
            }
            else
                this.recipe('plant', g);
            return false;
        }
        this.recipe(ids[item], g);
        return false;
    }
    recipe(id, g, finish = false) {
        const r = lifeRecipe(id);
        if (r.effect === 'crop' && (g.life.cropReady || g.life.cropTicks)) {
            if (g.life.cropReady)
                this.at(this.camp, 'skill-life', 'harvest');
            else {
                this.travel(this.camp);
                this.phase = 'waiting for herb bed';
            }
            return;
        }
        for (const [k, n] of Object.entries(r.resources)) {
            if (g.skilling.bank[k] >= n)
                continue;
            if (k === 'warden_essence') {
                this.melee(g);
                return;
            }
            const profession = { logs: 'woodcutting', ore: 'mining', fish: 'fishing' }[k];
            if (g.skilling.pack[k] > 0)
                this.bankResources();
            else
                this.gather(profession, g);
            return;
        }
        for (const [k, n] of Object.entries(r.supplies))
            if (!this.supply(k, n, g))
                return;
        if (Object.values(g.life.pack).reduce((a, b) => a + b, 0) + Object.values(r.outputs).reduce((a, b) => a + b, 0) > 100) {
            this.at(this.camp, 'skill-life', 'deposit');
            return;
        }
        this.at(r.location === 'far' ? this.goal : this.camp, 'skill-life', id, finish, r.location === 'far' ? 6 : 2.4);
    }
    melee(g, finish = false, mode = 'strength') { if (g.progression.mode !== mode) {
        this.action('training', mode);
        return;
    } if (g.encounter.hp === 0) {
        if (finish)
            this.finish('warden already defeated', 'blocked');
        return;
    } if (this.realm.tick < g.fighter.attackReady)
        return; this.at(this.goal, 'combat', 'attack', finish); }
    quest(g, finish = false) { if (g.quest.status === 'available')
        this.at(this.camp, 'quest', 'accept');
    else if (g.quest.status === 'active') {
        if (g.quest.reeds < 3)
            this.at(this.goal, 'quest', 'gather');
        else
            this.at(this.camp, 'quest', 'submit', finish);
    }
    else if (finish)
        this.finish('quest completed'); }
    equip(g, finish = false) { if (g.quest.status !== 'completed') {
        this.quest(g);
        return;
    } if (!g.inventory.rewardClaimed) {
        this.at(this.camp, 'claim', 'reed_blade');
        return;
    } if (g.inventory.weapon !== 'reed_blade')
        this.at(this.camp, 'equip', 'reed_blade', finish);
    else if (finish)
        this.finish('equipment inspected'); }
    scorpion(g, finish = false, style = 'melee') {
        const choices = g.caveWorld.scorpions.map((m, i) => ({ m, i })).filter(v => v.m.hp > 0), selected = choices[0];
        if (!selected) {
            this.phase = 'waiting for scorpion respawn';
            return;
        }
        const target = SCORPION_POINTS[selected.i];
        if (this.realm.tick < g.fighter.attackReady)
            return;
        if (style === 'ranged' || style === 'magic') {
            const ammo = style === 'ranged' ? 'arrows' : 'runes';
            if (!this.supply(ammo, 1, g))
                return;
            this.at(target, 'skill-life', `${style === 'ranged' ? 'shoot' : 'spell'}-${selected.i}`, finish, 5);
        }
        else {
            if (!['attack', 'strength', 'defence'].includes(g.progression.mode)) {
                this.action('training', 'strength');
                return;
            }
            this.at(target, 'cave', 'attack-' + selected.i, finish);
        }
    }
    step() {
        const tick = this.realm.tick;
        if (tick === this.lastTick)
            return;
        this.lastTick = tick;
        const g = this.realm.gameStateFor(this.connection), p = this.realm.stateFor(this.connection)?.position;
        if (!g || !p)
            return;
        if (!this.active) {
            this.cursor = chooseXamTask(this.brain);
            this.active = true;
            this.focusStartedTick = tick;
        }
        if (tick - this.focusStartedTick >= (XAM_TASKS[this.cursor].id === 'gear:upgrade' ? XAM_MAX_FOCUS_TICKS * 4 : XAM_MAX_FOCUS_TICKS)) {
            if (g.practiceChallenge)
                this.action('practice-step', 'cancel');
            else if (g.life?.job || g.life?.course)
                this.action('skill-life', 'cancel');
            this.finish('focus timeout', 'failures');
            return;
        }
        if (this.pending) {
            if (g.result?.sequence !== this.pending.sequence)
                return;
            const { finish, sequence } = this.pending, code = g.result.code;
            this.pending = undefined;
            this.brain.coverage[XAM_TASKS[this.cursor].id].lastCode = code;
            if (code === 'mine_started' || code === 'lobster_started') {
                this.caveFinish = finish;
            }
            else if (code === 'life_started') {
                this.waitingJob = { sequence, finish };
            }
            else if (code === 'practice_started') {
                this.challengeFinish = finish;
            }
            else if (code === 'life_task') {
                this.taskStarted = true;
            }
            else if (code === 'practice_step' || code === 'practice_early') { }
            else if (code === 'practice_done' || code === 'skill_gathered' || code === 'skill_resonance_bonus' || code === 'curriculum_done') {
                if (finish) {
                    this.finish(code);
                    return;
                }
            }
            else if (waitCodes.has(code)) {
                this.retryTick = tick + 20;
            }
            else if (expectedBlocks.has(code)) {
                this.finish(code, 'blocked');
                return;
            }
            else if (finish) {
                const success = new Set(['attack_hit', 'warden_defeated', 'life_shot', 'resonance_cast', 'quest_completed', 'item_claimed', 'item_equipped', 'item_unequipped', 'equipped', 'unequipped', 'skill_upgraded', 'lit', 'scorpion_hit', 'scorpion_dead', 'venom_drop', 'venom_coated', 'cave_banked', 'life_harvest', 'life_course_done', 'life_ward_on', 'life_ward_off', 'life_banked', 'life_consumed']);
                this.finish(code, success.has(code) ? 'completed' : 'failures');
                return;
            }
        }
        if (this.waitingJob) {
            if (g.life.job) {
                this.stop();
                this.phase = 'working · ' + g.life.job.id;
                return;
            }
            const wait = this.waitingJob;
            this.waitingJob = undefined;
            if (g.result?.sequence === wait.sequence && g.result.code === 'life_done') {
                if (wait.finish) {
                    this.finish('life_done');
                    return;
                }
            }
            else {
                this.finish(g.result?.code ?? 'job lost', 'blocked');
                return;
            }
        }
        if (g.players.find(p => p.id === this.id)?.skin !== 'traveler') {
            this.action('appearance', 'traveler');
            return;
        }
        if (g.practiceChallenge) {
            this.stop();
            this.phase = 'training ' + g.practiceChallenge.skill;
            if (tick >= g.practiceChallenge.readyTick)
                this.action('practice-step', practiceResponse(g.practiceChallenge, g.practiceChallenge.target), this.challengeFinish);
            return;
        }
        if (this.caveFinish && !g.cave?.activity) {
            this.caveFinish = false;
            const code = g.result?.code ?? 'gather lost';
            this.finish(code, ['mine_gathered', 'lobster_caught'].includes(code) ? 'completed' : 'failures');
            return;
        }
        if (g.cave?.activity) {
            this.stop();
            this.phase = 'gathering · ' + g.cave.activity.kind;
            return;
        }
        if (g.life.job) {
            this.waitingJob = { sequence: g.result?.sequence ?? 0, finish: false };
            return;
        }
        if (tick < this.retryTick)
            return;
        const task = XAM_TASKS[this.cursor];
        this.phase = task.id;
        if (task.kind === 'drill') {
            if (tick < (g.practiceReadyTick ?? 0))
                return;
            this.at(this.camp, 'practice', task.value, true);
        }
        else if (task.kind === 'gather')
            this.gather(task.value, g, true);
        else if (task.kind === 'recipe')
            this.recipe(task.value, g, true);
        else if (task.kind === 'quest')
            this.quest(g, true);
        else if (task.kind === 'trial') {
            const effect = task.value;
            if (g.resonance.mastered.includes(effect))
                this.finish('trial already mastered');
            else if (g.resonance.activeEffect !== effect) {
                if (tick < g.resonance.readyTick)
                    return;
                this.at(this.sites.codex ?? g.codex, 'resonance', resonanceTrialChord(effect).key);
            }
            else if (tick >= (g.practiceReadyTick ?? 0))
                this.at(this.camp, 'practice', RESONANCE_BINDINGS[effect].skill, true);
        }
        else if (task.kind === 'codex') {
            const codex = this.sites.codex ?? g.codex;
            if (tick < g.resonance.readyTick)
                return;
            this.at(codex, 'resonance', task.value, true);
        }
        else if (task.kind === 'cave') {
            const cave = this.caves().find(c => c.id === task.value);
            if (cave && this.travel(cave.arrival))
                this.finish('visited ' + cave.id);
            else if (!cave)
                this.finish('missing cave', 'blocked');
        }
        else if (task.kind === 'building') {
            const room = this.sites.buildings?.[Number(task.value)]?.room;
            if (room && this.travel(room))
                this.finish('visited room');
            else if (!room)
                this.finish('missing building', 'blocked');
        }
        else if (task.kind === 'combat') {
            if (task.value === 'ranged' || task.value === 'magic') {
                const ammo = task.value === 'ranged' ? 'arrows' : 'runes';
                if (this.supply(ammo, 1, g))
                    this.scorpion(g, true, task.value);
            }
            else
                this.melee(g, true, task.value);
        }
        else if (task.kind === 'command') {
            if (task.value === 'harvest') {
                if (g.life.cropReady)
                    this.at(this.camp, 'skill-life', 'harvest', true);
                else if (g.life.cropTicks) {
                    this.travel(this.camp);
                    this.phase = 'waiting for herb bed';
                }
                else
                    this.recipe('plant', g);
            }
            else if (task.value === 'agility') {
                const c = g.life.course;
                if (!c)
                    this.at(this.camp, 'skill-life', 'agility');
                else
                    this.at(c.step === 0 ? this.goal : this.camp, 'skill-life', 'checkpoint', c.step === 1);
            }
            else if (task.value === 'task') {
                if (!g.life.taskRemaining) {
                    if (this.taskStarted)
                        this.finish('life_task_done');
                    else
                        this.at(this.camp, 'skill-life', 'task');
                }
                else {
                    this.taskStarted = true;
                    this.scorpion(g);
                }
            }
            else if (task.value === 'ward-on') {
                if (!g.life.prayerPoints)
                    this.recipe('offer', g);
                else
                    this.action('skill-life', 'ward-on', true);
            }
            else if (task.value === 'ward-off') {
                this.action('skill-life', 'ward-off', true);
            }
            else if (task.value === 'eat-meal' || task.value === 'drink-potion') {
                if (this.supply(task.value === 'eat-meal' ? 'meals' : 'potions', 1, g))
                    this.action('skill-life', task.value, true);
            }
            else
                this.at(this.camp, 'skill-life', task.value, true);
        }
        else {
            if (task.value === 'equip')
                this.equip(g, true);
            else if (task.value === 'unequip') {
                if (!g.inventory.weapon)
                    this.equip(g);
                else
                    this.action('unequip', 'weapon', true);
            }
            else if (task.value === 'upgrade') {
                const s = g.skilling;
                if (s.toolTier === 3) {
                    this.finish('skill_max_tool', 'blocked');
                    return;
                }
                const r = TOOL_RECIPES[s.toolTier === 1 ? 2 : 3];
                const low = PROFESSIONS.find(k => level(s.xp[k]) < r.level);
                if (low) {
                    this.gather(low, g);
                    return;
                }
                for (const profession of PROFESSIONS) {
                    const key = { woodcutting: 'logs', mining: 'ore', fishing: 'fish' }[profession];
                    if (s.bank[key] < r.material) {
                        if (s.pack[key])
                            this.bankResources();
                        else
                            this.gather(profession, g);
                        return;
                    }
                }
                if (s.bank.warden_essence < r.essence) {
                    this.melee(g);
                    return;
                }
                this.at(this.camp, 'skilling', 'upgrade', true);
            }
            else if (task.value === 'beacon')
                this.at(this.goal, 'beacon', 'light', true);
            else if (task.value === 'coat') {
                if (!g.inventory.weapon)
                    this.equip(g);
                else if (!g.cave.venom) {
                    if (g.cave.bankVenom)
                        this.at(this.camp, 'cave', 'withdraw-venom');
                    else
                        this.scorpion(g);
                }
                else
                    this.action('cave', 'coat', true);
            }
            else if (task.value === 'cave-bank')
                this.at(this.camp, 'cave', 'bank', true);
            else if (task.value === 'mine') {
                if (Object.values(g.skilling.pack).reduce((a, b) => a + b, 0) >= 12)
                    this.bankResources();
                else
                    this.at(MINE_SPOTS.ore, 'cave', 'mine', true);
            }
            else if (task.value === 'lobster') {
                if (g.cave.venom + g.cave.lobsters >= 20)
                    this.at(this.camp, 'cave', 'bank');
                else
                    this.at(MINE_SPOTS.lobster, 'cave', 'lobster', true);
            }
        }
    }
    export() { return { version: 2, cursor: this.cursor, brain: checkedXamBrain(this.brain), save: this.realm.exportPlayer(this.connection) }; }
    diagnostics() { const brain = checkedXamBrain(this.brain); return { controller: 'rule-based coverage bot', selection: 'seeded shuffled coverage bag', selections: brain.selections, currentTask: XAM_TASKS[this.cursor].id, recent: brain.recent.map(i => XAM_TASKS[i].id), coverage: brain.coverage, covered: Object.values(brain.coverage).filter(c => c.completed > 0).length, total: XAM_TASKS.length, limitations: ['Functional command coverage is not proof of perfect content', 'Protected Xam exercises full-health food refusal; healing is tested by regression fixtures', 'Browser/phone visuals and GPU performance require separate review'] }; }
    examine() { const g = this.realm.gameStateFor(this.connection), position = this.realm.stateFor(this.connection).position, skills = skillBook(g.progression, g.skilling); return { kind: 'xam', tick: this.realm.tick, id: this.id, name: 'Xam', position: { ...position }, phase: this.phase, totalXp: skills.reduce((n, s) => n + s.xp, 0), totalLevel: skills.reduce((n, s) => n + s.level, 0), skills: skills.map(s => ({ id: s.id, level: s.level, xp: s.xp })), inventory: { ...g.inventory, slots: [...g.inventory.slots] }, pack: { ...g.skilling.pack }, bank: { ...g.skilling.bank }, supplies: structuredClone(g.life), caveSupplies: structuredClone(g.cave), diagnostics: this.diagnostics(), protected: true, untouchable: true, autoRetaliate: false, collision: 'nonblocking', armor: 'legendary_holographic_rustic', mainHand: 'diamond_scythe', offHand: 'gilded_secateurs', examine: 'Xam. A protected, persistent test skiller. Own XP, equipment and backpacks; examine only.' }; }
}
export const XAM_TASK_COUNT = XAM_TASKS.length;
