import { type Scene, type Mesh } from '@babylonjs/core';
/** One flowing pattern and world-space UV phase per scene, including caves and fountains. */
export declare function waterMaterial(scene: Scene, mesh: Mesh): void;
export declare function updateWaterFlow(scene: Scene, now: number, paused: boolean): void;
