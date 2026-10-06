/** Original Wayfarer curricula. Data alone never grants XP or bypasses the realm transaction. */
import { type SkillId } from './skill-directory.js';
import { type Progression } from './progression.js';
import { type Skilling, type Resource } from './skilling.js';
export type MethodKind = 'gathering' | 'workshop' | 'guide';
export interface TrainingMethod {
    readonly id: string;
    readonly skill: SkillId;
    readonly name: string;
    readonly level: number;
    readonly xp: number;
    readonly kind: MethodKind;
    readonly location: string;
    readonly costs: Readonly<Partial<Record<Resource, number>>>;
    readonly outcome: string;
    readonly implemented: boolean;
}
export declare const TRAINING_METHODS: readonly TrainingMethod[];
export declare function trainingMethod(id: unknown): TrainingMethod | undefined;
export declare function isTrainingMethod(id: unknown): id is string;
export declare function methodXP(p: Progression, s: Skilling, skill: SkillId): number;
export declare function trainingEligibility(p: Progression, s: Skilling, m: TrainingMethod): 'ready' | 'level' | 'materials' | 'planned';
/** Called on detached server state only, after final prompt/range checks. Bank input is rechecked at completion. */
export declare function completeWorkshop(p: Progression, s: Skilling, id: string): 'curriculum_done' | 'curriculum_level' | 'curriculum_materials';
export declare function curriculumFor(skill: SkillId): TrainingMethod[];
