import type { Skilling } from './skilling.js';
import type { Point } from './world.js';
import type { NavigationWorld } from './navigation.js';
export declare const HARVEST_ITEMS: readonly [{
    readonly id: "pine-log";
    readonly name: "Pine logs";
    readonly skill: "woodcutting";
    readonly level: 1;
    readonly xp: 25;
    readonly color: "#648754";
}, {
    readonly id: "oak-log";
    readonly name: "Oak logs";
    readonly skill: "woodcutting";
    readonly level: 15;
    readonly xp: 38;
    readonly color: "#738D44";
}, {
    readonly id: "willow-log";
    readonly name: "Willow logs";
    readonly skill: "woodcutting";
    readonly level: 30;
    readonly xp: 55;
    readonly color: "#79A873";
}, {
    readonly id: "maple-log";
    readonly name: "Maple logs";
    readonly skill: "woodcutting";
    readonly level: 45;
    readonly xp: 75;
    readonly color: "#B68853";
}, {
    readonly id: "yew-log";
    readonly name: "Yew logs";
    readonly skill: "woodcutting";
    readonly level: 60;
    readonly xp: 105;
    readonly color: "#3E6C59";
}, {
    readonly id: "moonwood-log";
    readonly name: "Moonwood logs";
    readonly skill: "woodcutting";
    readonly level: 75;
    readonly xp: 145;
    readonly color: "#8FACC4";
}, {
    readonly id: "shrimp";
    readonly name: "Raw shrimp";
    readonly skill: "fishing";
    readonly level: 1;
    readonly xp: 20;
    readonly color: "#D7978A";
}, {
    readonly id: "sardine";
    readonly name: "Raw sardine";
    readonly skill: "fishing";
    readonly level: 10;
    readonly xp: 30;
    readonly color: "#ABB6CB";
}, {
    readonly id: "trout";
    readonly name: "Raw trout";
    readonly skill: "fishing";
    readonly level: 20;
    readonly xp: 45;
    readonly color: "#A7C8B5";
}, {
    readonly id: "salmon";
    readonly name: "Raw salmon";
    readonly skill: "fishing";
    readonly level: 30;
    readonly xp: 60;
    readonly color: "#D7988A";
}, {
    readonly id: "river-lobster";
    readonly name: "Raw river lobster";
    readonly skill: "fishing";
    readonly level: 40;
    readonly xp: 85;
    readonly color: "#BD7867";
}, {
    readonly id: "sturgeon";
    readonly name: "Raw sturgeon";
    readonly skill: "fishing";
    readonly level: 60;
    readonly xp: 120;
    readonly color: "#889FAE";
}, {
    readonly id: "copper-ore";
    readonly name: "Copper ore";
    readonly skill: "mining";
    readonly level: 1;
    readonly xp: 25;
    readonly color: "#CB9361";
}, {
    readonly id: "tin-ore";
    readonly name: "Tin ore";
    readonly skill: "mining";
    readonly level: 1;
    readonly xp: 25;
    readonly color: "#B8BFBD";
}, {
    readonly id: "iron-ore";
    readonly name: "Iron ore";
    readonly skill: "mining";
    readonly level: 15;
    readonly xp: 40;
    readonly color: "#9D8272";
}, {
    readonly id: "coal";
    readonly name: "Coal";
    readonly skill: "mining";
    readonly level: 30;
    readonly xp: 60;
    readonly color: "#414C59";
}, {
    readonly id: "mithril-ore";
    readonly name: "Mithril ore";
    readonly skill: "mining";
    readonly level: 55;
    readonly xp: 95;
    readonly color: "#769BBE";
}, {
    readonly id: "adamant-ore";
    readonly name: "Adamant ore";
    readonly skill: "mining";
    readonly level: 70;
    readonly xp: 125;
    readonly color: "#77A488";
}, {
    readonly id: "runestone-ore";
    readonly name: "Runestone ore";
    readonly skill: "mining";
    readonly level: 85;
    readonly xp: 160;
    readonly color: "#8BBACB";
}];
export type HarvestId = typeof HARVEST_ITEMS[number]['id'];
export declare const HARVEST_IDS: readonly ("pine-log" | "oak-log" | "willow-log" | "maple-log" | "yew-log" | "moonwood-log" | "shrimp" | "sardine" | "trout" | "salmon" | "river-lobster" | "sturgeon" | "copper-ore" | "tin-ore" | "iron-ore" | "coal" | "mithril-ore" | "adamant-ore" | "runestone-ore")[];
export declare const harvestItem: (id: unknown) => {
    readonly id: "pine-log";
    readonly name: "Pine logs";
    readonly skill: "woodcutting";
    readonly level: 1;
    readonly xp: 25;
    readonly color: "#648754";
} | {
    readonly id: "oak-log";
    readonly name: "Oak logs";
    readonly skill: "woodcutting";
    readonly level: 15;
    readonly xp: 38;
    readonly color: "#738D44";
} | {
    readonly id: "willow-log";
    readonly name: "Willow logs";
    readonly skill: "woodcutting";
    readonly level: 30;
    readonly xp: 55;
    readonly color: "#79A873";
} | {
    readonly id: "maple-log";
    readonly name: "Maple logs";
    readonly skill: "woodcutting";
    readonly level: 45;
    readonly xp: 75;
    readonly color: "#B68853";
} | {
    readonly id: "yew-log";
    readonly name: "Yew logs";
    readonly skill: "woodcutting";
    readonly level: 60;
    readonly xp: 105;
    readonly color: "#3E6C59";
} | {
    readonly id: "moonwood-log";
    readonly name: "Moonwood logs";
    readonly skill: "woodcutting";
    readonly level: 75;
    readonly xp: 145;
    readonly color: "#8FACC4";
} | {
    readonly id: "shrimp";
    readonly name: "Raw shrimp";
    readonly skill: "fishing";
    readonly level: 1;
    readonly xp: 20;
    readonly color: "#D7978A";
} | {
    readonly id: "sardine";
    readonly name: "Raw sardine";
    readonly skill: "fishing";
    readonly level: 10;
    readonly xp: 30;
    readonly color: "#ABB6CB";
} | {
    readonly id: "trout";
    readonly name: "Raw trout";
    readonly skill: "fishing";
    readonly level: 20;
    readonly xp: 45;
    readonly color: "#A7C8B5";
} | {
    readonly id: "salmon";
    readonly name: "Raw salmon";
    readonly skill: "fishing";
    readonly level: 30;
    readonly xp: 60;
    readonly color: "#D7988A";
} | {
    readonly id: "river-lobster";
    readonly name: "Raw river lobster";
    readonly skill: "fishing";
    readonly level: 40;
    readonly xp: 85;
    readonly color: "#BD7867";
} | {
    readonly id: "sturgeon";
    readonly name: "Raw sturgeon";
    readonly skill: "fishing";
    readonly level: 60;
    readonly xp: 120;
    readonly color: "#889FAE";
} | {
    readonly id: "copper-ore";
    readonly name: "Copper ore";
    readonly skill: "mining";
    readonly level: 1;
    readonly xp: 25;
    readonly color: "#CB9361";
} | {
    readonly id: "tin-ore";
    readonly name: "Tin ore";
    readonly skill: "mining";
    readonly level: 1;
    readonly xp: 25;
    readonly color: "#B8BFBD";
} | {
    readonly id: "iron-ore";
    readonly name: "Iron ore";
    readonly skill: "mining";
    readonly level: 15;
    readonly xp: 40;
    readonly color: "#9D8272";
} | {
    readonly id: "coal";
    readonly name: "Coal";
    readonly skill: "mining";
    readonly level: 30;
    readonly xp: 60;
    readonly color: "#414C59";
} | {
    readonly id: "mithril-ore";
    readonly name: "Mithril ore";
    readonly skill: "mining";
    readonly level: 55;
    readonly xp: 95;
    readonly color: "#769BBE";
} | {
    readonly id: "adamant-ore";
    readonly name: "Adamant ore";
    readonly skill: "mining";
    readonly level: 70;
    readonly xp: 125;
    readonly color: "#77A488";
} | {
    readonly id: "runestone-ore";
    readonly name: "Runestone ore";
    readonly skill: "mining";
    readonly level: 85;
    readonly xp: 160;
    readonly color: "#8BBACB";
} | undefined;
export type HarvestCounts = Record<HarvestId, number>;
export interface HarvestLedger {
    pack: HarvestCounts;
    bank: HarvestCounts;
}
export interface HarvestState extends HarvestLedger {
    activity: {
        id: HarvestId;
        finishTick: number;
    } | null;
}
export type HarvestWorld = Record<HarvestId, {
    stock: number;
    readyTick: number;
}>;
export declare const freshHarvest: () => HarvestState;
export declare const freshHarvestWorld: () => HarvestWorld;
export declare function checkedHarvest(v: unknown, tick?: number): HarvestState;
export declare function checkedHarvestWorld(v: unknown, tick: number): HarvestWorld;
export interface HarvestSite {
    id: HarvestId;
    position: Point;
}
/** Sites are computed identically from the authoritative navigation, with clear approaches. */
export declare function harvestSites(camp: Point, beacon: Point, nav?: NavigationWorld, strict?: boolean): HarvestSite[];
export declare const HARVEST_RESULTS: {
    readonly harvest_started: "Harvesting started. Stay at this named resource site.";
    readonly harvest_gathered: "Named resource collected; profession XP awarded.";
    readonly harvest_level: "Your skill level is too low for this resource.";
    readonly harvest_empty: "This resource is depleted and regrowing.";
    readonly harvest_range: "Move within 2.5 metres of the selected resource.";
    readonly harvest_full: "Your 28-slot harvest backpack is full.";
    readonly harvest_cancelled: "Harvest cancelled without rewards.";
    readonly harvest_busy: "Finish or cancel the current skill action.";
};
export declare function startHarvest(h: HarvestState, s: Skilling, w: HarvestWorld, id: HarvestId, tick: number, freeSlots: number): "harvest_busy" | "harvest_level" | "harvest_empty" | "harvest_full" | "harvest_started";
export declare function finishHarvest(h: HarvestState, s: Skilling, w: HarvestWorld, tick: number, near: boolean, freeSlots: number): "harvest_level" | "harvest_empty" | "harvest_full" | "harvest_cancelled" | "harvest_gathered" | undefined;
