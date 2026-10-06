import { type CuriousBuilding } from './curious-buildings.js';
import { type Scene } from '@babylonjs/core';
import type { Point } from './world.js';
export declare function createCuriousRoofs(scene: Scene, buildings: readonly CuriousBuilding[]): {
    update(position: Point | undefined): CuriousBuilding | undefined;
    dispose(): void;
};
