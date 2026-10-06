import type { GameState } from './game-actions.js';
import type { Point } from './world.js';
/** Progressive starter loops with real server state; this UI never invents quantities or rewards. */
export declare function initSkillLife(send: (value: string) => void, walk: (target: Point) => void): {
    update: (game: GameState | undefined, pos: Point | undefined) => void;
};
