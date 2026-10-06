import { interiorAt, type InteriorChunk, type InteriorId } from './interior-worlds.js';
import { NavigationWorld, type XZ, type WalkCheck, type PathResult, type Collider } from './navigation.js';
import type { Point } from './world.js';
import type { Primitive } from './geometry.js';
export declare const CAVE_IDS: readonly ("mountain-mine" | "crystal-grotto" | "root-hollow" | "lantern-basement" | "underground-keep")[];
export type CaveId = InteriorId;
export interface CaveInstance {
    id: CaveId;
    name: string;
    entrance: Point;
    arrival: Point;
    exit: Point;
    bounds: {
        minX: number;
        maxX: number;
        minZ: number;
        maxZ: number;
    };
    primitives: Primitive[];
    navigation: NavigationWorld;
    parent: CaveId | undefined;
    chunks: readonly InteriorChunk[];
}
export interface PortalIntent {
    kind: 'portal';
    sequence: number;
    cave: CaveId;
    direction: 'enter' | 'exit';
}
export declare function decodePortalIntent(text: string): PortalIntent;
export declare const caveAt: typeof interiorAt;
export declare class CaveNavigation extends NavigationWorld {
    readonly outdoor: NavigationWorld;
    readonly caves: readonly CaveInstance[];
    constructor(outdoor: NavigationWorld, anchors: readonly Point[]);
    get revision(): number;
    upsertCollider(c: Collider): void;
    removeCollider(id: string): boolean;
    private area;
    check(p: XZ): WalkCheck;
    traverse(a: Point, b: XZ): WalkCheck;
    findPath(a: XZ, b: XZ, budget?: number): PathResult;
    destination(p: Point, intent: PortalIntent): Point | undefined;
}
