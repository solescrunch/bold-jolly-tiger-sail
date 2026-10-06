import { type HarvestState, type HarvestLedger, type HarvestWorld, type HarvestSite } from './harvest-content.js';
import { type Banking } from './realm-bank.js';
import { type LifeLedger, type SkillLife } from './skill-life.js';
import { type CaveLedger, type CaveSupplies, type MineWorld, type MineView, type MineCommand } from './mountain-mine.js';
import { type GatherNodes } from './gather-nodes.js';
import { type Fighter, type Encounter } from './encounter.js';
import { type Inventory, type ItemId } from './inventory.js';
import type { Point } from './world.js';
import { type Progression, type TrainingMode } from './progression.js';
import { type PracticeChallenge } from './practice-interaction.js';
import type { SkillId } from './skill-directory.js';
import { type Skilling, type SkillCommand } from './skilling.js';
import { type ResonanceState, type PersistentResonanceState } from './resonance-authority.js';
export declare const SKINS: readonly ["adventurer", "elder", "traveler", "villager", "seraphine", "vector"];
export type Skin = typeof SKINS[number];
export type Action = {
    kind: 'action';
    sequence: number;
    action: 'bank';
    value: string;
} | {
    kind: 'action';
    sequence: number;
    action: 'harvest';
    value: string;
} | {
    kind: 'action';
    sequence: number;
    action: 'skill-life';
    value: string;
} | {
    kind: 'action';
    sequence: number;
    action: 'cave';
    value: MineCommand;
} | {
    kind: 'action';
    sequence: number;
    action: 'curriculum';
    value: string;
} | {
    kind: 'action';
    sequence: number;
    action: 'practice-step';
    value: string;
} | {
    kind: 'action';
    sequence: number;
    action: 'practice';
    value: SkillId;
} | {
    kind: 'action';
    sequence: number;
    action: 'skilling';
    value: SkillCommand;
} | {
    kind: 'action';
    sequence: number;
    action: 'appearance';
    value: Skin;
} | {
    kind: 'action';
    sequence: number;
    action: 'beacon';
    value: 'light';
} | {
    kind: 'action';
    sequence: number;
    action: 'quest';
    value: 'accept' | 'gather' | 'submit';
} | {
    kind: 'action';
    sequence: number;
    action: 'claim' | 'equip';
    value: ItemId;
} | {
    kind: 'action';
    sequence: number;
    action: 'unequip';
    value: 'weapon';
} | {
    kind: 'action';
    sequence: number;
    action: 'combat';
    value: 'attack' | 'guard';
} | {
    kind: 'action';
    sequence: number;
    action: 'training';
    value: TrainingMode;
} | {
    kind: 'action';
    sequence: number;
    action: 'resonance';
    value: string;
};
export declare const RESULT_TEXT: {
    readonly practice_started: "Follow the three marked actions. XP is awarded only on completion.";
    readonly practice_step: "Good action. Follow the next marked target.";
    readonly practice_early: "Let the action settle before responding.";
    readonly practice_miss: "The drill slipped. No XP awarded; try again after recovery.";
    readonly practice_stale: "That drill response is no longer current.";
    readonly practice_busy: "Finish or cancel the current drill first.";
    readonly practice_cancelled: "Drill cancelled. No XP awarded.";
    readonly practice_done: "Practice complete. +1 XP to the chosen skill; no items awarded.";
    readonly practice_wait: "Practice recovery: one action every five seconds across all skills.";
    readonly practice_full: "This skill has reached its XP storage cap.";
    readonly training_changed: "Training changed. Style XP goes to the selected skill; damage also trains Hitpoints.";
    readonly training_incompatible: "Choose a training mode compatible with your weapon.";
    readonly equipment_requirements: "You do not meet the weapon requirements.";
    readonly attack_hit: "Hit the Lantern Warden.";
    readonly attack_cooldown: "Your weapon is recovering.";
    readonly guarding: "Guard raised for 0.8 seconds.";
    readonly guard_cooldown: "Guard is recovering.";
    readonly recovering: "Recovering — no items are lost.";
    readonly warden_resting: "Warden resets in eight seconds.";
    readonly warden_defeated: "Warden cleared! Contributors gain a session victory.";
    readonly item_claimed: "Reward added to your pack.";
    readonly item_equipped: "Weapon equipped and shared with nearby players.";
    readonly item_unequipped: "Weapon returned to your pack.";
    readonly item_unavailable: "That item is not in your pack.";
    readonly reward_unavailable: "Complete Quiet Tithe, then claim one reward from Halden.";
    readonly equipped: "Appearance shared with the realm.";
    readonly lit: "You lit the landing beacon.";
    readonly already_lit: "The beacon is already lit.";
    readonly out_of_range: "Move within 3 metres of the target.";
    readonly quest_accepted: "Halden: Bring me three bundles from the far reed patch.";
    readonly quest_unavailable: "This quest is already accepted or completed.";
    readonly quest_not_active: "Speak to Halden before gathering reeds.";
    readonly gathered: "Reed bundle gathered.";
    readonly gather_wait: "Give the reeds a moment before gathering again.";
    readonly patch_empty: "The shared reed patch is regrowing.";
    readonly inventory_full: "You have all three bundles. Return to Halden.";
    readonly requirements_not_met: "Halden needs three reed bundles.";
    readonly quest_completed: "Quiet Tithe completed. You received one offering token.";
    readonly resonance_cast: "The PolyCodex answers. Magic and Runecrafting XP awarded; one attunement effect is active.";
    readonly resonance_wait: "The PolyCodex is still settling between chords.";
    readonly resonance_range: "Stand at the celestial observatory PolyCodex to resonate a chord.";
    readonly resonance_cap: "Your PolyCodex attunement ledger is full.";
    readonly resonance_guard_bonus: "Ward Glimmer reinforced your guard and granted bonus Defence XP.";
    readonly cave_withdrawn: "One banked supply withdrawn into your cave pouch.";
    readonly mine_started: "Mining the mountain vein · five seconds.";
    readonly lobster_started: "Fishing for cave lobsters · seven seconds.";
    readonly mine_gathered: "Ore added to your resource pack · +25 Mining XP.";
    readonly lobster_caught: "Cave lobster added to your cave pouch · +30 Fishing XP.";
    readonly mine_busy: "Finish or cancel the current gathering action.";
    readonly mine_range: "Move close to the cave resource or scorpion.";
    readonly mine_empty: "The shared cave resource is regenerating.";
    readonly mine_full: "Your resource pack or cave pouch is full.";
    readonly mine_cancelled: "Cave gathering cancelled: move back to the resource to try again.";
    readonly scorpion_hit: "You hit the cave scorpion.";
    readonly scorpion_dead: "Scorpion defeated.";
    readonly venom_drop: "Scorpion defeated · a vial of venom dropped into your cave pouch!";
    readonly venom_coated: "Weapon coated for 60 seconds. Successful hits may inflict poison.";
    readonly venom_missing: "You need scorpion venom and an equipped weapon.";
    readonly venom_active: "This weapon is already coated.";
    readonly lobster_eaten: "Cave lobster eaten · restored up to 6 Hitpoints.";
    readonly lobster_unavailable: "No cave lobster, full health or food recovery is active.";
    readonly cave_banked: "Cave pouch deposited in your personal bank.";
    readonly cave_bank_full: "Cave bank limit reached.";
    readonly life_started: "Skill action started. Stay nearby; costs and rewards resolve on completion.";
    readonly life_done: "Skill action complete. Supplies and XP updated.";
    readonly life_cancelled: "Skill action cancelled without spending supplies or awarding XP.";
    readonly life_busy: "Finish or cancel your current skill action first.";
    readonly life_range: "Move to the action’s settlement or far-landing site.";
    readonly life_materials: "Bank gathered resources and carry the listed skill supplies.";
    readonly life_full: "Your 100-unit skill pouch or bank is full.";
    readonly life_growing: "This herb bed is growing or ready to harvest.";
    readonly life_harvest: "Herb bed harvested: two herbs and 35 Farming XP.";
    readonly life_not_ready: "The herb bed is not ready to harvest.";
    readonly life_consumed: "Supply consumed; health restored.";
    readonly life_food_wait: "Full health, no supply, or the shared food cooldown is active.";
    readonly life_banked: "Skill supplies deposited at Halden.";
    readonly life_withdrawn: "One skill supply withdrawn.";
    readonly life_empty: "No banked supply is available.";
    readonly life_course: "Agility route started. Cross to the far beacon, then return to Halden.";
    readonly life_checkpoint: "Far checkpoint reached. Return to Halden to finish.";
    readonly life_course_done: "Agility route completed: 40 Agility XP.";
    readonly life_course_early: "Keep travelling; the next checkpoint is not ready yet.";
    readonly life_task: "Slayer task accepted: defeat three Venomcrag scorpions.";
    readonly life_task_active: "Finish your current three-scorpion task first.";
    readonly life_task_progress: "Scorpion task progressed: 15 Slayer XP.";
    readonly life_task_done: "Slayer task completed: 15 Slayer XP plus a 25-XP completion bonus.";
    readonly life_ward_on: "Prayer protection enabled; one point drains every two seconds.";
    readonly life_ward_off: "Prayer protection disabled.";
    readonly life_prayer_empty: "Offer Warden essence to refill your Prayer points.";
    readonly life_ammo: "Carry an arrow for Ranged or a rune for Magic.";
    readonly life_shot: "Field attack landed; actual damage trained Ranged or Magic and Hitpoints.";
};
export declare const SKILL_RESULT_TEXT: {
    readonly curriculum_done: "Workshop project complete. Banked inputs consumed; skill XP awarded. Project donated to the settlement.";
    readonly curriculum_level: "Your skill level does not meet this method’s requirement.";
    readonly curriculum_materials: "Bank the listed materials before starting this project.";
    readonly skill_node_empty: "That shared resource is depleted. Wait for it to regrow.";
    readonly skill_range: "Gather within 8 metres of the far landing. Bank/craft within 3 metres of Halden.";
    readonly skill_gathered: "Resource gathered. The completed method’s profession XP was awarded.";
    readonly skill_wait: "Your gathering tool is recovering.";
    readonly skill_pack_full: "Your 12-unit resource pack is full. Bank at Halden.";
    readonly skill_banked: "Resource pack deposited in your personal bank.";
    readonly skill_bank_full: "Bank resource limit reached.";
    readonly skill_upgraded: "Next tool tier crafted! Resource yield increased.";
    readonly skill_requirements: "Check the next tool recipe: profession levels, banked materials and Warden essence are required.";
    readonly skill_max_tool: "Masterwork tools are already unlocked.";
    readonly skill_resonance_bonus: "Resonance empowered the successful action with one bonus resource or bonus skill XP.";
    readonly bank_done: "Bank transfer complete.";
    readonly bank_empty: "No matching item is available.";
    readonly bank_full: "That transfer would exceed a capacity.";
    readonly bank_range: "Bank within three metres of Halden.";
    readonly bank_busy: "Finish or cancel your current skill action before banking.";
    readonly bank_setting: "Bank layout updated.";
    readonly bank_material: "Named harvest converted into workshop material.";
    readonly harvest_started: "Harvesting started. Stay at this named resource site.";
    readonly harvest_gathered: "Named resource collected; profession XP awarded.";
    readonly harvest_level: "Your skill level is too low for this resource.";
    readonly harvest_empty: "This resource is depleted and regrowing.";
    readonly harvest_range: "Move within 2.5 metres of the selected resource.";
    readonly harvest_full: "Your 28-slot harvest backpack is full.";
    readonly harvest_cancelled: "Harvest cancelled without rewards.";
    readonly harvest_busy: "Finish or cancel the current skill action.";
};
export type Result = {
    sequence: number;
    code: keyof typeof RESULT_TEXT | keyof typeof SKILL_RESULT_TEXT;
};
export interface QuestState {
    status: 'available' | 'active' | 'completed';
    reeds: number;
    tithes: number;
    gatherReadyTick: number;
}
export interface PersistentQuestState {
    status: 'available' | 'active' | 'completed';
    reeds: number;
    tithes: number;
    gatherCooldownTicks: number;
}
export interface PersistentPlayerState {
    version: 10;
    harvest: HarvestLedger;
    banking: Banking;
    life: LifeLedger;
    cave: CaveLedger;
    practiceReadyTick: number;
    skin: Skin;
    quest: PersistentQuestState;
    inventory: Inventory;
    progression: Progression;
    skilling: Skilling;
    resonance: PersistentResonanceState;
}
export interface GameState {
    kind: 'game';
    harvest: HarvestState | null;
    banking: Banking | null;
    harvestWorld: HarvestWorld;
    harvestSites: readonly HarvestSite[];
    life: SkillLife | null;
    cave: CaveSupplies | null;
    caveWorld: MineView;
    revision: number;
    tick: number;
    beacon: {
        position: Point;
        lit: boolean;
    };
    camp: Point;
    codex: Point;
    patch: {
        stock: number;
        respawnTick: number;
    };
    gatherNodes: GatherNodes;
    quest: QuestState | null;
    inventory: Inventory | null;
    fighter: Fighter | null;
    progression: Progression | null;
    skilling: Skilling | null;
    resonance: ResonanceState | null;
    practiceReadyTick: number | null;
    practiceChallenge: PracticeChallenge | null;
    encounter: Encounter;
    players: {
        id: string;
        skin: Skin;
        weapon: ItemId | null;
    }[];
    result: Result | null;
}
export declare function checkedPersistentPlayerState(x: unknown): PersistentPlayerState;
export declare const freshPersistentPlayerState: () => PersistentPlayerState;
export declare function decodeAction(text: string): Action;
export declare function decodeGameState(text: string): GameState;
/** All gameplay transitions are staged with movement by RealmRuntime. */
export declare class GameActions {
    private mineWorld;
    private players;
    private protectedCombat;
    private lit;
    private revision;
    private tick;
    private stock;
    private respawnTick;
    private harvestWorld;
    private readonly harvestSites;
    private gatherNodes;
    private encounter;
    private readonly beacon;
    private readonly camp;
    private readonly codex;
    constructor(beacon: Point, camp?: Point, codex?: Point, sites?: readonly HarvestSite[]);
    join(connection: string, id: string, persisted?: PersistentPlayerState, protectedCombat?: boolean): void;
    leave(connection: string): void;
    receive(connection: string, text: string): boolean;
    stagedCommit(positionFor: (connection: string) => Point | undefined): GameActions;
    inspection(): {
        harvestWorld: HarvestWorld;
        harvestSites: readonly HarvestSite[];
        mineWorld: MineWorld;
        gatherNodes: GatherNodes;
        encounter: {
            hp: number;
            strikeAt: number;
            respawnAt: number;
            round: number;
        };
        revision: number;
        tick: number;
        beacon: {
            position: {
                x: number;
                y: number;
                z: number;
            };
            lit: boolean;
        };
        camp: {
            x: number;
            y: number;
            z: number;
        };
        patch: {
            stock: number;
            respawnTick: number;
        };
        players: {
            id: string;
            skin: "adventurer" | "seraphine" | "elder" | "traveler" | "villager" | "vector";
            sequence: number;
            pending: Action[];
            result: Result | null;
            quest: QuestState;
            inventory: Inventory;
            fighter: Fighter;
            progression: Progression;
            skilling: Skilling;
            resonance: ResonanceState;
            practiceReadyTick: number;
            practiceChallenge: PracticeChallenge | null;
            cave: CaveSupplies;
            life: SkillLife;
            harvest: HarvestState;
            banking: Banking;
        }[];
    };
    persistentState(connection: string): PersistentPlayerState | undefined;
    validate(expectedIds: readonly string[]): void;
    commit(positionFor: (connection: string) => Point | undefined): void;
    snapshot(connection: string, visible: readonly string[]): GameState;
}
