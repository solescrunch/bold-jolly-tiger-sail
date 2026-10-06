import type { Point } from './world.js';
import type { Inventory, ItemId } from './inventory.js';
import { type Fighter, type Encounter } from './encounter.js';
import { type Progression } from './progression.js';
import { type Skilling } from './skilling.js';
export declare const MINE_ID: "mountain-mine";
export declare const MINE_SPOTS: Readonly<{
    ore: Readonly<{
        x: 764;
        y: -18;
        z: -4;
    }>;
    lobster: Readonly<{
        x: 778;
        y: -18;
        z: 4;
    }>;
}>;
export declare const SCORPION_POINTS: readonly Point[];
export declare const CAVE_ITEMS: Readonly<{
    scorpion_venom: {
        name: string;
        description: string;
    };
    cave_lobster: {
        name: string;
        description: string;
    };
}>;
export type MineCommand = 'mine' | 'lobster' | 'coat' | 'eat' | 'bank' | 'attack-0' | 'attack-1' | 'attack-2' | 'withdraw-venom' | 'withdraw-lobster';
export declare const isMineCommand: (v: unknown) => v is MineCommand;
export declare const MINE_RESULTS: {
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
};
export interface CaveLedger {
    venom: number;
    lobsters: number;
    bankVenom: number;
    bankLobsters: number;
}
export interface CaveSupplies extends CaveLedger {
    coatingWeapon: ItemId | null;
    coatingUntil: number;
    foodReady: number;
    activity: null | {
        kind: 'mine' | 'lobster';
        finishTick: number;
    };
}
export interface Poison {
    owner: string;
    until: number;
    next: number;
}
export interface Scorpion {
    hp: number;
    respawnAt: number;
    attackAt: number;
    round: number;
    target: string | null;
    poison: Poison | null;
}
export interface MineWorld {
    oreStock: number;
    oreRespawn: number;
    lobsterStock: number;
    lobsterRespawn: number;
    scorpions: Scorpion[];
    wardenPoison: Poison | null;
    rng: number;
}
export type MineView = Omit<MineWorld, 'rng'>;
export declare const freshLedger: () => CaveLedger;
export declare const freshSupplies: (ledger?: CaveLedger) => CaveSupplies;
export declare const freshMineWorld: () => MineWorld;
export declare function checkedLedger(v: unknown): CaveLedger;
export declare function checkedSupplies(v: unknown, tick: number): CaveSupplies;
export declare function checkedMineView(v: unknown, tick: number): MineView;
export declare function mineView(w: MineWorld, tick: number): MineView;
export interface MinePlayer {
    life?: {
        ward: boolean;
    };
    id: string;
    cave: CaveSupplies;
    fighter: Fighter;
    inventory: Inventory;
    progression: Progression;
    skilling: Skilling;
}
export declare function inflictPoison(w: MineWorld, p: MinePlayer, tick: number, set: (v: Poison) => void): void;
export declare function mineCommand(w: MineWorld, p: MinePlayer, command: MineCommand, pos: Point | undefined, camp: Point, tick: number, protectedCombat?: boolean, override?: {
    damage: number;
    range: number;
    cooldown: number;
    skill: 'ranged' | 'magic';
}): keyof typeof MINE_RESULTS | 'attack_cooldown' | 'recovering' | 'out_of_range' | 'training_incompatible';
export declare function advanceMine(w: MineWorld, players: readonly {
    player: MinePlayer;
    position: Point | undefined;
    protectedCombat: boolean;
}[], encounter: Encounter, tick: number, onResult: (p: MinePlayer, code: keyof typeof MINE_RESULTS) => void): void;
