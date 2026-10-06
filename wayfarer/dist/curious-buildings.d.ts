import type { CrossingPlan } from './crossings.js';
import type { Point } from './world.js';
import type { Primitive } from './geometry.js';
export interface CuriousBuilding {
    id: string;
    name: string;
    kind: 'observatory' | 'mushroom' | 'archive';
    entrance: Point;
    room: Point;
    note: string;
    bounds: {
        minX: number;
        maxX: number;
        minZ: number;
        maxZ: number;
    };
    roof: Primitive[];
}
/** Three original, deterministic rooms with distinct XZ footprints; no stacked floor ambiguity. */
export declare function addCuriousBuildings(plan: CrossingPlan): CuriousBuilding[];
export declare function nearbyBuilding(position: Point | undefined, buildings: readonly CuriousBuilding[]): CuriousBuilding | undefined;
