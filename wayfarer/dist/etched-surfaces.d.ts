import { Scene, StandardMaterial } from '@babylonjs/core';
import { type SurfaceKind } from './etched-pixels.js';
/** Shared reference-counted 32px textures; materials retain their original colors. */
export declare function etchMaterial(scene: Scene, material: StandardMaterial, kind: SurfaceKind): void;
export declare function setEtchedDetail(scene: Scene, enabled: boolean): void;
