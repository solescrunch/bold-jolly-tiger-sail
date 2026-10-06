import { CaveNavigation } from './cave-instances.js';
export declare const REALM_WORLD: {
    readonly seed: 20260928;
    readonly generatorVersion: 1;
};
/** Shared deterministic rehearsal geometry and collision setup, independently built on each side. */
export declare function createRealmScene(): {
    navigation: CaveNavigation;
    caves: readonly import("./cave-instances.js").CaveInstance[];
    construction: import("./construction.js").ConstructionWorld;
    plan: import("./crossings.js").CrossingPlan;
    buildings: import("./curious-buildings.js").CuriousBuilding[];
    scenery: import("./realm-dressing.js").RealmProp[];
    namedHarvest: import("./harvest-content.js").HarvestSite[];
};
export declare function realmCodexPoint(realm: ReturnType<typeof createRealmScene>): import("./world.js").Point;
