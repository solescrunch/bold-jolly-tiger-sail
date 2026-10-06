export interface XamTask {
    id: string;
    kind: 'drill' | 'gather' | 'recipe' | 'command' | 'combat' | 'quest' | 'gear' | 'codex' | 'cave' | 'building' | 'trial';
    value: string;
}
export declare const XAM_TASKS: readonly XamTask[];
export interface XamCoverage {
    attempts: number;
    completed: number;
    blocked: number;
    failures: number;
    lastCode: string;
}
export interface XamBrain {
    version: 1 | 2;
    rng: number;
    bag: number[];
    selections: number;
    recent: number[];
    coverage: Record<string, XamCoverage>;
}
export declare const freshXamBrain: (seed?: number) => XamBrain;
export declare function checkedXamBrain(v: unknown): XamBrain;
/** Seeded shuffle gives diverse order and eventual coverage; replay receives the resulting ordinary packets. */
export declare function chooseXamTask(b: XamBrain): number;
