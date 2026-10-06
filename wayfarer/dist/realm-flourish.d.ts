import { Scene, TransformNode } from '@babylonjs/core';
import type { Point } from './world.js';
import type { Bounds, GroundSampler } from './navigation.js';
import type { VisualQuality } from './visual-surface.js';
export declare const FLOURISH_COLORS: readonly ["#90AE5D", "#476F53", "#DCA2B8", "#A899CF", "#E8CD77", "#CF735A", "#BD9670", "#66798A", "#8A7460", "#D6C495", "#779583", "#AE7A95"];
export interface FlourishSite {
    kind: 'flowers' | 'fern' | 'mushrooms' | 'gravel' | 'soil' | 'driftwood';
    position: Point;
    variant: number;
    fine: boolean;
}
/** Bounded seeded dressing, kept off reserved support surfaces and unsafe/wet land. */
export declare function flourishSites(seed: number, bounds: Bounds, ground: GroundSampler, reserved: (x: number, z: number) => boolean): FlourishSite[];
export declare function createRealmFlourish(scene: Scene, sites: readonly FlourishSite[], water: readonly Point[]): {
    root: TransformNode;
    readonly batchCount: number;
    update(now: number, paused: boolean, quality: VisualQuality, day: number): void;
    dispose(): void;
};
