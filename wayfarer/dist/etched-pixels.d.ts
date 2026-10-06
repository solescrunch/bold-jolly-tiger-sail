export declare const SURFACE_KINDS: readonly ["stone", "wood", "cloth", "metal", "skin", "fur", "leaf", "crystal", "soil", "gravel", "sand", "brick"];
export type SurfaceKind = typeof SURFACE_KINDS[number];
/** Tiny deterministic grayscale tiles modulate the existing art palette. */
export declare function etchedPixels(kind: SurfaceKind): Uint8Array;
/** Facet-local UV projection keeps detail on horizontal terrain and vertical props. */
export declare function etchedUVs(positions: readonly number[], normals: readonly number[]): number[];
export declare function surfaceForColor(hex: string): SurfaceKind;
