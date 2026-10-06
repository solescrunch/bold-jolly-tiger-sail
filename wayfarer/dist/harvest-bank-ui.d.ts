import type { GameState } from './game-actions.js';
import type { Point } from './world.js';
export declare function initHarvestBank(doc: Document, send: (action: 'harvest' | 'bank', value: string) => void, route: (p: Point) => void): {
    update(game: GameState | undefined, where: Point | undefined): void;
    dispose(): void;
};
