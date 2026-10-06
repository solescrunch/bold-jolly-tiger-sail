import { trapdoorPrimitives } from './settlement-layers.js';
import { realmPropPrimitives } from './realm-dressing.js';
import { SCORPION_POINTS } from './mountain-mine.js';
/** Stable authored world registry. Reserved XZ partitions preserve existing cave saves. */
export const INTERIOR_WORLDS = Object.freeze([
    { id: 'crystal-grotto', name: 'Moonlight Crystal Grotto', kind: 'crystal', x: 200, y: -12, parent: undefined, anchor: 0 },
    { id: 'root-hollow', name: 'The Old Root Hollow', kind: 'roots', x: 340, y: -16, parent: undefined, anchor: 1 },
    { id: 'lantern-basement', name: 'Lantern Cellar · Lower Basement', kind: 'basement', x: 480, y: -20, parent: 'root-hollow', anchor: 1 },
    { id: 'underground-keep', name: 'The Buried Sentinel Keep', kind: 'keep', x: 620, y: -24, parent: 'lantern-basement', anchor: 1 },
    { id: 'mountain-mine', name: 'Venomcrag Mountain Mine', kind: 'mine', x: 760, y: -18, parent: undefined, anchor: 0, entranceOffset: { x: 0, z: -12 } },
]);
for (const world of INTERIOR_WORLDS)
    Object.freeze(world);
export const INTERIOR_IDS = Object.freeze(INTERIOR_WORLDS.map(w => w.id));
export function interiorDefinition(id) { const value = INTERIOR_WORLDS.find(w => w.id === id); if (!value)
    throw Error('Unknown interior world'); return value; }
export function interiorAt(p) { return p && Number.isFinite(p.x) && Number.isFinite(p.z) ? INTERIOR_WORLDS.find(w => p.x >= w.x && p.x <= w.x + 24 && p.z >= -12 && p.z <= 12)?.id : undefined; }
export function interiorChunks(id, primitives) {
    const world = interiorDefinition(id);
    if (primitives.length > 128)
        throw Error('Interior detail budget exceeded');
    const groups = new Map(), ids = new Set();
    for (const p of primitives) {
        if (ids.has(p.id) || !['box', 'sphere', 'cone'].includes(p.shape) || !['solid', 'none'].includes(p.collision) || p.position.x < world.x || p.position.x > world.x + 24 || p.position.z < -12 || p.position.z > 12 || ![p.position.x, p.position.y, p.position.z, p.size.x, p.size.y, p.size.z].every(Number.isFinite) || p.size.x <= 0 || p.size.y <= 0 || p.size.z <= 0 || !/^#[0-9a-f]{6}$/i.test(p.color) || !p.id.startsWith('cave:' + id + ':'))
            throw Error('Invalid interior primitive');
        ids.add(p.id);
        const x = Math.max(0, Math.min(1, Math.floor((p.position.x - world.x) / 12))), z = Math.max(0, Math.min(1, Math.floor((p.position.z + 12) / 12))), key = x + ':' + z;
        const list = groups.get(key) ?? [];
        list.push(p);
        groups.set(key, list);
    }
    return [...groups].sort(([a], [b]) => a.localeCompare(b)).map(([key, list]) => ({ id: id + ':chunk:' + key, primitives: list }));
}
export function interiorPrimitives(id) {
    const w = interiorDefinition(id), { x, y } = w, parts = [];
    const add = (part, shape, px, py, pz, sx, sy, sz, color, solid = false) => parts.push({ id: 'cave:' + id + ':' + part, shape, position: { x: px, y: py, z: pz }, size: { x: sx, y: sy, z: sz }, color, collision: solid ? 'solid' : 'none' });
    add('floor', 'box', x + 12, y - .2, 0, 24, .4, 24, w.kind === 'crystal' ? '#465A70' : w.kind === 'roots' ? '#65563F' : '#626775');
    for (const side of [-1, 1]) {
        add('side-' + side, 'box', x + 12 + side * 12, y + 3, 0, .5, 6, 24, '#39424C', true);
        add('end-' + side, 'box', x + 12, y + 3, side * 12, 24, 6, .5, '#39424C', true);
    }
    for (let j = 0; w.kind !== 'mine' && j < 12; j++) {
        const px = x + 3 + (j % 4) * 5, pz = -8 + Math.floor(j / 4) * 8;
        if (Math.abs(px - (x + 12)) < 3 && Math.abs(pz) > 4)
            continue;
        if (w.kind === 'crystal' || w.kind === 'roots')
            add('formation-' + j, 'cone', px, y + .7, pz, w.kind === 'roots' ? .7 : 1.3, w.kind === 'roots' ? 1.4 : 2, 1, w.kind === 'roots' ? '#88754D' : j % 2 ? '#72BDD2' : '#9988BE', true);
        else {
            add('pillar-' + j, 'box', px, y + 1.7, pz, .7, 3.4, .7, '#86909D', true);
            add('pillar-cap-' + j, 'box', px, y + 3.5, pz, 1, .25, 1, '#AD9D7D');
        }
    }
    if (w.kind === 'basement') {
        for (let i = 0; i < 5; i++) {
            add('cask-' + i, 'sphere', x + 2, y + .65, -6 + i * 3, 1, 1.3, 1, '#956B43', true);
            add('shelf-' + i, 'box', x + 21, y + .9, -6 + i * 3, 1, 1.8, 1, '#7A624A', true);
        }
    }
    if (w.kind === 'keep') {
        add('empty-throne', 'box', x + 12, y + .9, 9, 2, 1.8, 1, '#92774F', true);
        for (const side of [-1, 1])
            add('banner-' + side, 'box', x + 12 + side * 4, y + 2.1, 11, 1, 2, .07, '#486598');
    }
    if (w.kind === 'mine') {
        add('ore-vein', 'sphere', x + 2, y + .8, -4, 2, 1.6, 2, '#8998AF', true);
        for (let i = 0; i < 3; i++)
            add('ore-crystal-' + i, 'cone', x + 1.5 + i * .5, y + 1.6, -4, .5, .9, .5, '#75C7D4');
        add('lobster-pool', 'box', x + 20, y + .015, 4, 4, .035, 4, '#367D93');
        for (let i = 0; i < 3; i++) {
            add('lobster-' + i, 'sphere', x + 19 + i * .7, y + .06, 4, .3, .15, .18, '#C07E70');
        }
        for (const [i, p] of SCORPION_POINTS.entries()) {
            add('scorpion-' + i + '-body', 'sphere', p.x, y + .3, p.z, .8, .45, 1, '#88644A');
            for (const side of [-1, 1]) {
                for (let j = 0; j < 3; j++)
                    add('scorpion-' + i + '-leg-' + side + '-' + j, 'box', p.x + side * .65, y + .15, p.z - .3 + j * .3, .65, .1, .12, '#AA875F');
                add('scorpion-' + i + '-claw-' + side, 'sphere', p.x + side * .4, y + .25, p.z - .75, .35, .25, .4, '#B89D72');
            }
            for (let j = 0; j < 4; j++)
                add('scorpion-' + i + '-tail-' + j, 'sphere', p.x, y + .3 + j * .16, p.z + .45 + j * .12, .22, .23, .22, '#A38464');
        }
    }
    const details = w.kind === 'mine' ? ['lobster-cage', 'fishing-net'] : w.kind === 'basement' ? ['tomato-crate', 'scorpion-cage'] : w.kind === 'roots' ? ['feathers', 'fishing-pole'] : ['fountain'];
    for (const [i, kind] of details.entries())
        parts.push(...realmPropPrimitives({ id: 'cave:' + id + ':scenery-' + kind, kind, position: { x: x + 5 + i * 14, y, z: 9 } }));
    add('exit-marker', 'box', x + 12, y + .08, -8, 2, .12, 2, '#DCC185');
    for (const child of INTERIOR_WORLDS.filter(c => c.parent === id)) {
        add('stairs-to-' + child.id, 'box', x + 12, y + .15, 6, 2, .3, 2, '#9B8C71');
        for (let step = 0; step < 4; step++)
            add('step-' + child.id + '-' + step, 'box', x + 12, y + .025 + step * .1, 5 + step * .4, 1.8, .05, .4, '#C6B083');
        for (const p of trapdoorPrimitives(child.id, { x: x + 12, y, z: 6 }))
            parts.push({ ...p, id: 'cave:' + id + ':' + p.id });
        add('lower-door-' + child.id, 'box', x + 12, y + 1.5, 8, 2, 3, .15, '#3B4552');
    }
    return parts;
}
export function nestedEntrance(id) { const w = interiorDefinition(id); if (!w.parent)
    return; const parent = interiorDefinition(w.parent); return { x: parent.x + 12, y: parent.y, z: 6 }; }
