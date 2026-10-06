import type { CrossingPlan } from './crossings.js';
import type { GroundSampler } from './navigation.js';
import type { Primitive } from './geometry.js';
import type { Point } from './world.js';
/** Fences are server colliders; deliberately open gates preserve the same walkable passages. */
export declare function addSettlementLayers(plan: CrossingPlan, ground: GroundSampler): void;
/** Actual portal apertures retain stable cave entrance coordinates and server range checks. */
export declare function trapdoorPrimitives(id: string, p: Point): Primitive[];
