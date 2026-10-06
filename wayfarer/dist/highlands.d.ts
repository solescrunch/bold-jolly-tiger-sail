import type { WildlifeNPC } from './wildlife.js';
import type { NavigationWorld } from './navigation.js';
import type { Point } from './world.js';
export declare const HIGHLAND_STORIES: readonly [{
    readonly id: "yak-knoll";
    readonly name: "Yak Knoll";
    readonly note: "The herd wears yesterday’s rain in its shaggy coats. A bronze bell rings only when the wind turns.";
}, {
    readonly id: "panda-grove";
    readonly name: "Panda Grove";
    readonly note: "Bamboo rustles beside a mossy tea stone. Someone has left a tiny cup for the quietest visitor.";
}, {
    readonly id: "gull-watch";
    readonly name: "Gull Watch";
    readonly note: "White wings circle the old lookout. Sailors once read the river bends here like lines on a palm.";
}, {
    readonly id: "star-stones";
    readonly name: "The Listening Stones";
    readonly note: "Four broken pillars frame the sky. Their maker carved a star for every traveller who found a way home.";
}];
export type HighlandId = typeof HIGHLAND_STORIES[number]['id'];
export interface HighlandStop {
    id: HighlandId;
    name: string;
    note: string;
    position: Point;
}
/** Ground and route checks keep the initial trail on existing authoritative terrain. */
export declare function highlandTrail(nav: NavigationWorld, start: Point, goal: Point): HighlandStop[];
/** Device-local cosmetic scrapbook: it owns no XP, items or account identity. */
export declare class HighlandJournal {
    private seen;
    restore(raw: string | null): void;
    serialize(): string;
    get count(): number;
    has(id: HighlandId): boolean;
    observe(position: Point | undefined, stops: readonly HighlandStop[]): HighlandStop | undefined;
    get title(): "Starlit Wayfarer" | "Highland Wanderer";
}
export declare function highlandWildlife(stops: readonly HighlandStop[], nav: NavigationWorld): WildlifeNPC[];
