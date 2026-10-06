import { TransformNode, type Scene } from '@babylonjs/core';
import { type HarvestSite, type HarvestWorld } from './harvest-content.js';
import type { Primitive } from './geometry.js';
export declare function harvestPrimitives(site: HarvestSite): Primitive[];
export declare function createHarvest3D(scene: Scene, sites: readonly HarvestSite[]): {
    root: TransformNode;
    update(world: HarvestWorld): void;
    dispose(): void;
};
