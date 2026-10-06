import type { Primitive } from './geometry.js';
import type { Point } from './world.js';
/** Stable authored world registry. Reserved XZ partitions preserve existing cave saves. */
export declare const INTERIOR_WORLDS: readonly [{
    readonly id: "crystal-grotto";
    readonly name: "Moonlight Crystal Grotto";
    readonly kind: "crystal";
    readonly x: 200;
    readonly y: -12;
    readonly parent: undefined;
    readonly anchor: 0;
}, {
    readonly id: "root-hollow";
    readonly name: "The Old Root Hollow";
    readonly kind: "roots";
    readonly x: 340;
    readonly y: -16;
    readonly parent: undefined;
    readonly anchor: 1;
}, {
    readonly id: "lantern-basement";
    readonly name: "Lantern Cellar · Lower Basement";
    readonly kind: "basement";
    readonly x: 480;
    readonly y: -20;
    readonly parent: "root-hollow";
    readonly anchor: 1;
}, {
    readonly id: "underground-keep";
    readonly name: "The Buried Sentinel Keep";
    readonly kind: "keep";
    readonly x: 620;
    readonly y: -24;
    readonly parent: "lantern-basement";
    readonly anchor: 1;
}, {
    readonly id: "mountain-mine";
    readonly name: "Venomcrag Mountain Mine";
    readonly kind: "mine";
    readonly x: 760;
    readonly y: -18;
    readonly parent: undefined;
    readonly anchor: 0;
    readonly entranceOffset: {
        readonly x: 0;
        readonly z: -12;
    };
}];
export type InteriorId = typeof INTERIOR_WORLDS[number]['id'];
export declare const INTERIOR_IDS: readonly ("mountain-mine" | "crystal-grotto" | "root-hollow" | "lantern-basement" | "underground-keep")[];
export declare function interiorDefinition(id: InteriorId): {
    readonly id: "crystal-grotto";
    readonly name: "Moonlight Crystal Grotto";
    readonly kind: "crystal";
    readonly x: 200;
    readonly y: -12;
    readonly parent: undefined;
    readonly anchor: 0;
} | {
    readonly id: "root-hollow";
    readonly name: "The Old Root Hollow";
    readonly kind: "roots";
    readonly x: 340;
    readonly y: -16;
    readonly parent: undefined;
    readonly anchor: 1;
} | {
    readonly id: "lantern-basement";
    readonly name: "Lantern Cellar · Lower Basement";
    readonly kind: "basement";
    readonly x: 480;
    readonly y: -20;
    readonly parent: "root-hollow";
    readonly anchor: 1;
} | {
    readonly id: "underground-keep";
    readonly name: "The Buried Sentinel Keep";
    readonly kind: "keep";
    readonly x: 620;
    readonly y: -24;
    readonly parent: "lantern-basement";
    readonly anchor: 1;
} | {
    readonly id: "mountain-mine";
    readonly name: "Venomcrag Mountain Mine";
    readonly kind: "mine";
    readonly x: 760;
    readonly y: -18;
    readonly parent: undefined;
    readonly anchor: 0;
    readonly entranceOffset: {
        readonly x: 0;
        readonly z: -12;
    };
};
export declare function interiorAt(p: {
    x: number;
    z: number;
} | undefined): InteriorId | undefined;
export interface InteriorChunk {
    id: string;
    primitives: readonly Primitive[];
}
export declare function interiorChunks(id: InteriorId, primitives: readonly Primitive[]): InteriorChunk[];
export declare function interiorPrimitives(id: InteriorId): Primitive[];
export declare function nestedEntrance(id: InteriorId): Point | undefined;
