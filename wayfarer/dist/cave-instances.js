import { INTERIOR_WORLDS, INTERIOR_IDS, interiorAt, interiorPrimitives, interiorChunks, nestedEntrance } from './interior-worlds.js';
import { NavigationWorld } from './navigation.js';
export const CAVE_IDS = INTERIOR_IDS;
export function decodePortalIntent(text) { if (typeof text !== 'string' || new TextEncoder().encode(text).length > 256)
    throw Error('Invalid portal packet'); const p = JSON.parse(text); if (!p || Array.isArray(p) || Object.keys(p).length !== 4 || p.kind !== 'portal' || !Number.isSafeInteger(p.sequence) || p.sequence < 0 || !CAVE_IDS.includes(p.cave) || !['enter', 'exit'].includes(p.direction))
    throw Error('Invalid portal packet'); return p; }
export const caveAt = interiorAt;
export class CaveNavigation extends NavigationWorld {
    outdoor;
    caves;
    constructor(outdoor, anchors) {
        super(() => ({ height: NaN, slopeDegrees: 0, waterDepth: 0 }), { ...outdoor.options, bounds: { ...outdoor.options.bounds, maxX: 784 } });
        this.outdoor = outdoor;
        this.caves = INTERIOR_WORLDS.map(w => {
            const { id, x, y } = w, bounds = { minX: x, maxX: x + 24, minZ: -12, maxZ: 12 }, navigation = new NavigationWorld(() => ({ height: y, slopeDegrees: 0, waterDepth: 0 }), { bounds, cellSize: 1 }), primitives = interiorPrimitives(id);
            navigation.addPrimitives(primitives);
            const anchor = anchors[w.anchor] ?? anchors[0];
            if (!anchor)
                throw Error('Missing cave anchor');
            let entrance = nestedEntrance(id);
            if (!entrance)
                for (const offset of [...('entranceOffset' in w ? [w.entranceOffset, { x: -2, z: -12 }, { x: 2, z: -12 }] : []), { x: 3, z: 3 }, { x: -3, z: 3 }, { x: 0, z: 3 }, { x: 0, z: 0 }]) {
                    const c = outdoor.check({ x: anchor.x + offset.x, z: anchor.z + offset.z });
                    if (c.ok) {
                        entrance = c.position;
                        break;
                    }
                }
            if (!entrance)
                throw Error('No safe cave entrance');
            const exit = { x: x + 12, y, z: -8 }, arrival = { x: x + 12, y, z: -6 };
            if (!navigation.check(exit).ok || !navigation.check(arrival).ok)
                throw Error('Invalid cave landing');
            return { id, name: w.name, entrance, arrival, exit, bounds, primitives, navigation, parent: w.parent, chunks: interiorChunks(id, primitives) };
        });
    }
    get revision() { return this.outdoor.revision + (this.caves?.reduce((n, c) => n + c.navigation.revision, 0) ?? 0); }
    upsertCollider(c) { const cave = this.caves?.find(v => c.minX >= v.bounds.minX && c.maxX <= v.bounds.maxX); (cave?.navigation ?? this.outdoor).upsertCollider(c); }
    removeCollider(id) { let removed = this.outdoor.removeCollider(id); for (const c of this.caves ?? [])
        removed = c.navigation.removeCollider(id) || removed; return removed; }
    area(p) { const id = caveAt(p); return id ? this.caves.find(c => c.id === id)?.navigation : this.outdoor; }
    check(p) { return this.area(p)?.check(p) ?? { ok: false, reason: 'bounds' }; }
    traverse(a, b) { if (caveAt(a) !== caveAt(b))
        return { ok: false, reason: 'bounds' }; return this.area(a)?.traverse(a, b) ?? { ok: false, reason: 'bounds' }; }
    findPath(a, b, budget = 4096) { if (caveAt(a) !== caveAt(b))
        return { status: 'unreachable', points: [], visited: 0 }; return this.area(a).findPath(a, b, budget); }
    destination(p, intent) { const cave = this.caves.find(c => c.id === intent.cave); if (!cave)
        return; const from = intent.direction === 'enter' ? cave.entrance : cave.exit; if (caveAt(p) !== (intent.direction === 'exit' ? cave.id : cave.parent) || Math.hypot(p.x - from.x, p.y - from.y, p.z - from.z) > 3)
        return; return { ...(intent.direction === 'enter' ? cave.arrival : cave.entrance) }; }
}
