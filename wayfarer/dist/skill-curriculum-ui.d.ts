import type { GameState } from './game-actions.js';
import type { Point } from './world.js';
/** DOM is a guide only: the server rechecks every start and completion. */
export declare function initTrainingGuide(start: (id: string) => void): {
    update(game: GameState | undefined, position: Point | undefined): void;
};
