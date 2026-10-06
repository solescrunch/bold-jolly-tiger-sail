import { RealmRuntime } from './realm-runtime.js';
import type { NavigationWorld } from './navigation.js';
import type { Point } from './world.js';
import type { PlayerSave } from './persistence.js';
import { type XamBrain } from './xam-brain.js';
export declare const XAM_MAX_FOCUS_TICKS: number;
export interface XamSites {
    codex?: Point;
    buildings?: readonly {
        room: Point;
    }[];
}
/** Rule-based coverage controller. Never edits gameplay state, grants XP or bypasses validated commands. */
export declare class XamAgent {
    private realm;
    private nav;
    private camp;
    private goal;
    private accepted?;
    private sites;
    readonly connection = "@server-npc/xam";
    readonly id: string;
    private moveSequence;
    private actionSequence;
    private portalSequence;
    private pending;
    private waitingJob;
    private challengeFinish;
    private caveFinish;
    private taskStarted;
    private lastTick;
    private path;
    private pathGoal;
    private retryTick;
    private focusStartedTick;
    private active;
    private brain;
    cursor: number;
    phase: string;
    constructor(realm: RealmRuntime, nav: NavigationWorld, camp: Point, goal: Point, save?: PlayerSave, cursor?: number, accepted?: ((packet: string) => void) | undefined, brain?: XamBrain, sites?: XamSites);
    private send;
    private action;
    private finish;
    private stop;
    private caves;
    private travel;
    private move;
    private at;
    private gather;
    private bankResources;
    private supply;
    private recipe;
    private melee;
    private quest;
    private equip;
    private scorpion;
    step(): void;
    export(): {
        version: 2;
        cursor: number;
        brain: XamBrain;
        save: PlayerSave;
    };
    diagnostics(): {
        controller: string;
        selection: string;
        selections: number;
        currentTask: string;
        recent: string[];
        coverage: Record<string, import("./xam-brain.js").XamCoverage>;
        covered: number;
        total: number;
        limitations: string[];
    };
    examine(): {
        kind: string;
        tick: number;
        id: string;
        name: string;
        position: {
            x: number;
            y: number;
            z: number;
        };
        phase: string;
        totalXp: number;
        totalLevel: number;
        skills: {
            id: import("./skill-directory.js").SkillId;
            level: number;
            xp: number;
        }[];
        inventory: {
            slots: ("reed_blade" | "ash_staff" | "granite_maul" | null)[];
            weapon: import("./inventory.js").ItemId | null;
            rewardClaimed: boolean;
            stored: import("./inventory.js").ItemId | null;
        };
        pack: {
            logs: number;
            ore: number;
            fish: number;
            warden_essence: number;
        };
        bank: {
            logs: number;
            ore: number;
            fish: number;
            warden_essence: number;
        };
        supplies: import("./skill-life.js").SkillLife;
        caveSupplies: import("./mountain-mine.js").CaveSupplies;
        diagnostics: {
            controller: string;
            selection: string;
            selections: number;
            currentTask: string;
            recent: string[];
            coverage: Record<string, import("./xam-brain.js").XamCoverage>;
            covered: number;
            total: number;
            limitations: string[];
        };
        protected: boolean;
        untouchable: boolean;
        autoRetaliate: boolean;
        collision: string;
        armor: string;
        mainHand: string;
        offHand: string;
        examine: string;
    };
}
export declare const XAM_TASK_COUNT: number;
