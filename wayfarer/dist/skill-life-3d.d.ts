import { type Scene, type Mesh } from '@babylonjs/core';
import type { Point } from './world.js';
import type { SkillLife } from './skill-life.js';
/** Local garden/hearth presentation follows private gameplay snapshots; never edits collision or rewards. */
export declare function createSkillLife3D(scene: Scene, camp: Point): {
    sprouts: Mesh[];
    hearth: Mesh;
    update(life: SkillLife | null | undefined, tick: number, now: number, paused: boolean, outside?: boolean): void;
    dispose(): void;
};
