import { addSettlementLayers, trapdoorPrimitives } from './settlement-layers.js';
import { harvestSites } from './harvest-content.js';
import { addLandscapeLayers, placeRealmProps, realmPropPrimitives } from './realm-dressing.js';
import { CaveNavigation } from './cave-instances.js';
import { addCuriousBuildings } from './curious-buildings.js';
import { terrainSampler } from './navigation.js';
import { planCrossing, mountCrossing } from './crossings.js';
import { generateChunk, CHUNK_SIZE } from './world.js';
import { reserveSites } from './site-placement.js';
import { propPrimitives } from './geometry.js';
import { REALM_CONTRACT } from './realm-contract.js';
export const REALM_WORLD = { seed: REALM_CONTRACT.worldSeed, generatorVersion: REALM_CONTRACT.generatorVersion };
/** Shared deterministic rehearsal geometry and collision setup, independently built on each side. */
export function createRealmScene() {
    const base = terrainSampler(REALM_WORLD);
    const plan = planCrossing(base, { id: 'local-realm', style: 'willowglass', z: 0, minX: -16, maxX: 176 });
    const buildings = addCuriousBuildings(plan);
    addLandscapeLayers(plan, base);
    addSettlementLayers(plan, base);
    const mounted = mountCrossing(base, plan, .45), b = plan.bounds;
    for (let cz = Math.floor(b.minZ / CHUNK_SIZE); cz <= Math.floor(b.maxZ / CHUNK_SIZE); cz++)
        for (let cx = Math.floor(b.minX / CHUNK_SIZE); cx <= Math.floor(b.maxX / CHUNK_SIZE); cx++) {
            const chunk = reserveSites(generateChunk(REALM_WORLD, cx, cz), [plan]);
            const props = chunk.props.filter(p => p.position.x >= b.minX && p.position.x <= b.maxX && p.position.z >= b.minZ && p.position.z <= b.maxZ)
                .map(p => ({ ...p, position: { ...p.position, y: mounted.construction.terrainAt(p.position.x, p.position.z).height } }));
            mounted.navigation.addPrimitives(propPrimitives({ ...chunk, props }));
        }
    const scenery = placeRealmProps(REALM_WORLD.seed, plan, mounted.construction.sample, mounted.navigation);
    for (const prop of scenery)
        plan.primitives.push(...realmPropPrimitives(prop));
    const navigation = new CaveNavigation(mounted.navigation, [plan.start, plan.goal]);
    for (const cave of navigation.caves.filter(c => !c.parent)) {
        const p = cave.entrance;
        if (cave.id === 'mountain-mine') {
            plan.primitives.push({ id: 'mountain-mine:mountain', shape: 'cone', position: { x: p.x, y: p.y + 4, z: p.z + 7 }, size: { x: 14, y: 11, z: 12 }, color: '#66717D', collision: 'none' }, { id: 'mountain-mine:mouth', shape: 'box', position: { x: p.x, y: p.y + 1.4, z: p.z + .1 }, size: { x: 3, y: 2.8, z: .15 }, color: '#17232F', collision: 'none' });
        }
        for (const side of [-1, 1])
            plan.primitives.push({ id: 'entrance:' + cave.id + ':' + side, shape: 'box', position: { x: p.x + side * 1.8, y: p.y + 1.5, z: p.z }, size: { x: 1, y: 3, z: 1 }, color: '#566475', collision: 'none' });
        plan.primitives.push({ id: 'entrance:' + cave.id + ':arch', shape: 'box', position: { x: p.x, y: p.y + 3, z: p.z }, size: { x: 4.6, y: .8, z: 1 }, color: '#6E7890', collision: 'none' });
    }
    const namedHarvest = harvestSites(plan.start, plan.goal, navigation, true);
    for (const cave of navigation.caves.filter(c => !c.parent && c.id !== 'mountain-mine'))
        plan.primitives.push(...trapdoorPrimitives(cave.id, cave.entrance));
    return { plan, buildings, scenery, namedHarvest, ...mounted, navigation, caves: navigation.caves };
}
export function realmCodexPoint(realm) {
    for (const candidate of [{ x: realm.plan.start.x + 7, z: realm.plan.start.z - 5 }, { x: realm.plan.start.x + 5, z: realm.plan.start.z - 3 }, realm.plan.start]) {
        const p = realm.navigation.check(candidate);
        if (p.ok)
            return p.position;
    }
    throw new Error('PolyCodex needs a walkable observatory point');
}
