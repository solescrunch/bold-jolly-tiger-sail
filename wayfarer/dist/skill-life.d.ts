/** Connected starter skill loops. Commands carry IDs only; all clocks, costs and rewards are host-owned. */
import type { Point } from './world.js';
import type { Fighter } from './encounter.js';
import { type Progression } from './progression.js';
import { type Skilling, type Resource } from './skilling.js';
import type { SkillId } from './skill-directory.js';
export declare const LIFE_ITEMS: readonly ["seeds", "herbs", "bars", "lanterns", "arrows", "runes", "meals", "potions"];
export type LifeItem = typeof LIFE_ITEMS[number];
export declare const LIFE_CAP = 100;
export interface LifeLedger {
    pack: Record<LifeItem, number>;
    bank: Record<LifeItem, number>;
    cropTicks: number;
    cropReady: boolean;
    prayerPoints: number;
    repairs: number;
    taskRemaining: number;
}
export interface LifeJob {
    id: string;
    startedTick: number;
    finishTick: number;
}
export interface SkillLife extends LifeLedger {
    job: LifeJob | null;
    course: null | {
        step: 0 | 1;
        startedTick: number;
        expiresTick: number;
    };
    ward: boolean;
    drainAt: number;
    hearthUntil: number;
}
interface Recipe {
    id: string;
    skill: SkillId;
    name: string;
    seconds: number;
    xp: number;
    location: 'camp' | 'far';
    resources: Partial<Record<Resource, number>>;
    supplies: Partial<Record<LifeItem, number>>;
    outputs: Partial<Record<LifeItem, number>>;
    effect?: 'crop' | 'hearth' | 'prayer' | 'repair';
    description: string;
}
export declare const LIFE_RECIPES: readonly Readonly<Recipe>[];
export declare const lifeRecipe: (id: string) => Readonly<Recipe> | undefined;
export declare function isLifeCommand(v: unknown): v is string;
export declare const LIFE_RESULTS: {
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
export type LifeResult = keyof typeof LIFE_RESULTS;
export declare const freshLifeLedger: () => LifeLedger;
export declare function checkedLifeLedger(v: unknown): LifeLedger;
export declare function checkedSkillLife(v: unknown, tick: number): SkillLife;
export declare const freshSkillLife: (ledger?: LifeLedger) => SkillLife;
export declare function persistSkillLife(l: SkillLife): LifeLedger;
export interface LifePlayer {
    life: SkillLife;
    skilling: Skilling;
    progression: Progression;
    fighter: Fighter;
    cave: {
        foodReady: number;
    };
}
export declare const prayerCapacity: (p: Progression) => number;
export declare const lifeBusy: (l: SkillLife) => boolean;
export declare const nearLife: (pos: Point | undefined, target: Point, radius?: number) => boolean;
export declare function recipeReady(p: LifePlayer, r: Readonly<Recipe>): LifeResult | undefined;
export declare function lifeCommand(p: LifePlayer, command: string, pos: Point | undefined, camp: Point, beacon: Point, tick: number): LifeResult | 'recovering';
export declare function advanceSkillLife(p: LifePlayer, pos: Point | undefined, camp: Point, beacon: Point, tick: number): LifeResult | undefined;
export declare function creditSlayer(p: LifePlayer): LifeResult | undefined;
export {};
