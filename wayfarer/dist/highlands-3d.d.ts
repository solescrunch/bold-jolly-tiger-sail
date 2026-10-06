import { Scene, TransformNode } from '@babylonjs/core';
import type { HighlandStop } from './highlands.js';
/** Decorative landmark meshes never replace the shared navigation surface. */
export declare function createHighlands3D(scene: Scene, stops: readonly HighlandStop[]): {
    root: TransformNode;
    update(now: number, paused: boolean): void;
    dispose(): void;
};
