import type { NavigationWorld, XZ } from './navigation.js';
/** Client steering only: the server still owns collision, speed and position. */
export declare class ClickWalk {
    private navigation;
    private points;
    private lastPlan;
    private progressAt;
    private anchor;
    constructor(navigation: Pick<NavigationWorld, 'findPath' | 'traverse'>);
    get active(): boolean;
    cancel(): void;
    plan(start: XZ, goal: XZ, now: number): boolean;
    direction(position: XZ, now: number): {
        dx: number;
        dz: number;
    };
}
/** Reject camera drags, long presses and multi-touch as movement taps. */
export declare class WalkTap {
    private press;
    private blocked;
    down(id: number, x: number, y: number, at: number): void;
    move(id: number, x: number, y: number): void;
    up(id: number, x: number, y: number, at: number): boolean;
    cancel(): void;
}
