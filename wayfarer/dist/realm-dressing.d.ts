import type { Primitive } from './geometry.js';
import type { Point } from './world.js';
import type { CrossingPlan } from './crossings.js';
import type { NavigationWorld } from './navigation.js';
import type { GroundSampler } from './navigation.js';
export declare const REALM_PROP_KINDS: readonly ["well", "fountain", "tomato-crate", "pigeon-cage", "scorpion-cage", "lobster-cage", "fishing-net", "fishing-pole", "fly-fishing-rod", "feathers", "duck"];
export type RealmPropKind = typeof REALM_PROP_KINDS[number];
export interface RealmProp {
    id: string;
    kind: RealmPropKind;
    position: Point;
}
/** Original scenery, not inventory grants. Parts keep stable IDs in both outdoor and interior layers. */
export declare function realmPropPrimitives(prop: RealmProp): Primitive[];
/** Seeded dressing changes with the world seed, never with frame timing or client join order. */
export declare function placeRealmProps(seed: number, plan: CrossingPlan, ground: GroundSampler, navigation: NavigationWorld): RealmProp[];
/** New overlook paths use the exact same continuous support surfaces for rendering and walking. */
export declare function addLandscapeLayers(plan: CrossingPlan, base: GroundSampler): void;
