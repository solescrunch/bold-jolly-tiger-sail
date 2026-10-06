import { type Profession } from './skilling.js';
export declare const GATHER_NODES: Readonly<{
    readonly woodcutting: {
        readonly name: "Willow tree";
        readonly resource: "logs";
        readonly regrowTicks: 800;
    };
    readonly mining: {
        readonly name: "Ore seam";
        readonly resource: "ore";
        readonly regrowTicks: 600;
    };
    readonly fishing: {
        readonly name: "Fishing pool";
        readonly resource: "fish";
        readonly regrowTicks: 400;
    };
}>;
export interface GatherNode {
    stock: number;
    respawnTick: number;
}
export type GatherNodes = Record<Profession, GatherNode>;
export declare const freshGatherNodes: () => GatherNodes;
export declare function checkedGatherNodes(value: unknown, tick: number): GatherNodes;
export declare function regrowNodes(nodes: GatherNodes, tick: number): boolean;
export declare function harvestNode(nodes: GatherNodes, profession: Profession, tick: number): boolean;
