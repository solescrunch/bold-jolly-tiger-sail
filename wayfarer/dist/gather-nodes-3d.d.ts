import { Scene, TransformNode } from '@babylonjs/core';
import type { GatherNodes } from './gather-nodes.js';
import type { Point } from './world.js';
export declare const NODE_OFFSETS: {
    readonly woodcutting: {
        readonly x: -3;
        readonly z: -5;
    };
    readonly mining: {
        readonly x: 3;
        readonly z: -5;
    };
    readonly fishing: {
        readonly x: 0;
        readonly z: 6;
    };
};
export declare function createGatherNodes3D(scene: Scene, beacon: Point, check: (p: Point) => {
    ok: boolean;
    position?: Point;
}): {
    root: TransformNode;
    sites: Map<"woodcutting" | "mining" | "fishing", {
        top: TransformNode;
        position: Point;
    }>;
    update(nodes: GatherNodes, now: number, paused: boolean): void;
    dispose(): void;
};
