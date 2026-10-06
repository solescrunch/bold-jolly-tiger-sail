import { type HarvestState } from './harvest-content.js';
import { type Skilling } from './skilling.js';
import { type SkillLife } from './skill-life.js';
import { type Inventory } from './inventory.js';
import type { CaveSupplies } from './mountain-mine.js';
export declare const BANK_ITEMS: readonly Readonly<{
    id: string;
    name: string;
    category: string;
}>[];
export type BankId = string;
export interface Banking {
    order: string[];
    placeholders: string[];
    keepPlaceholders: boolean;
    notes: Record<string, number>;
}
export interface BankPlayer {
    banking: Banking;
    harvest: HarvestState;
    skilling: Skilling;
    life: SkillLife;
    cave: CaveSupplies;
    inventory: Inventory;
}
export declare const freshBanking: () => Banking;
export declare function checkedBanking(v: unknown): Banking;
export declare function bankCount(p: BankPlayer, id: string): number;
export declare function packCount(p: BankPlayer, id: string): number;
export declare const harvestSlots: (p: BankPlayer) => number;
export declare function syncBank(p: BankPlayer): void;
export declare const BANK_RESULTS: {
    readonly bank_done: "Bank transfer complete.";
    readonly bank_empty: "No matching item is available.";
    readonly bank_full: "That transfer would exceed a capacity.";
    readonly bank_range: "Bank within three metres of Halden.";
    readonly bank_busy: "Finish or cancel your current skill action before banking.";
    readonly bank_setting: "Bank layout updated.";
    readonly bank_material: "Named harvest converted into workshop material.";
};
export declare function isBankCommand(v: unknown): v is string;
export declare function bankAction(p: BankPlayer, command: string): keyof typeof BANK_RESULTS;
export declare function bankView(p: BankPlayer): {
    slots: number;
    rows: {
        id: string;
        name: string;
        count: number;
        pack: number;
        notes: number | undefined;
        placeholder: boolean;
    }[];
};
