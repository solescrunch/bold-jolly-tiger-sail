import { Scene, TransformNode } from '@babylonjs/core';
import type { ResonanceState } from './resonance-authority.js';
import type { Point } from './world.js';
/** One reusable effect pool, triggered by an increase in the server's cast count. */
export declare class CastEcho3D {
    readonly root: TransformNode;
    private material;
    private rings;
    private started;
    private lastCasts;
    private player;
    constructor(scene: Scene);
    update(player: string | undefined, state: ResonanceState | null | undefined, position: Point | undefined, now: number, paused: boolean, enabled: boolean): void;
    dispose(): void;
}
