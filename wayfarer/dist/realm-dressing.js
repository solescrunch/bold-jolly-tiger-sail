export const REALM_PROP_KINDS = Object.freeze(['well', 'fountain', 'tomato-crate', 'pigeon-cage', 'scorpion-cage', 'lobster-cage', 'fishing-net', 'fishing-pole', 'fly-fishing-rod', 'feathers', 'duck']);
/** Original scenery, not inventory grants. Parts keep stable IDs in both outdoor and interior layers. */
export function realmPropPrimitives(prop) {
    const out = [], p = prop.position;
    const add = (name, shape, x, y, z, sx, sy, sz, color) => out.push({ id: prop.id + ':' + name, shape, position: { x: p.x + x, y: p.y + y, z: p.z + z }, size: { x: sx, y: sy, z: sz }, color, collision: 'none' });
    const wood = '#947044', stone = '#87929B', water = '#487F87', metal = '#ADB7BE';
    const bird = (name, x, y, z, duck = false) => { add(name + '-body', 'sphere', x, y + .22, z, .5, .38, .65, duck ? '#DFD4B4' : '#8A92A6'); add(name + '-head', 'sphere', x, y + .5, z + .25, .25, .25, .25, duck ? '#3D7256' : '#6C758A'); add(name + '-beak', 'box', x, y + .47, z + .43, .15, .08, .15, '#DDAA53'); add(name + '-wing', 'sphere', x + .2, y + .25, z, .08, .22, .45, duck ? '#9A8170' : '#58667D'); };
    if (prop.kind === 'well' || prop.kind === 'fountain') {
        const fountain = prop.kind === 'fountain', radius = fountain ? 1.3 : .85;
        for (let i = 0; i < 12; i++) {
            const t = i * Math.PI / 6;
            add('rim-' + i, 'sphere', Math.cos(t) * radius, .35, Math.sin(t) * radius, .55, .65, .55, stone);
        }
        add('water', 'sphere', 0, .28, 0, radius * 1.7, .045, radius * 1.7, water);
        if (fountain) {
            add('pedestal', 'cone', 0, .8, 0, .5, 1.4, .5, stone);
            add('upper-basin', 'sphere', 0, 1.4, 0, 1.5, .2, 1.5, stone);
            add('upper-water', 'sphere', 0, 1.51, 0, 1.2, .035, 1.2, water);
            for (const side of [-1, 1])
                add('cascade-' + side, 'box', side * .55, .96, 0, .09, 1.1, .09, water);
            add('jet', 'box', 0, 1.9, 0, .08, .8, .08, water);
        }
        else {
            for (const side of [-1, 1])
                add('post-' + side, 'box', side * 1.1, 1.5, 0, .18, 3, .18, wood);
            add('beam', 'box', 0, 2.9, 0, 2.6, .2, .4, wood);
            add('rope', 'box', 0, 1.9, 0, .035, 1.9, .035, '#CCB88B');
            add('bucket', 'box', 0, .95, 0, .4, .4, .4, wood);
        }
    }
    else if (prop.kind === 'tomato-crate') {
        add('base', 'box', 0, .07, 0, 1.3, .14, .95, wood);
        for (const side of [-1, 1]) {
            add('side-x' + side, 'box', side * .65, .32, 0, .09, .5, .95, wood);
            add('side-z' + side, 'box', 0, .32, side * .475, 1.3, .5, .09, wood);
        }
        for (let i = 0; i < 9; i++) {
            const x = (i % 3 - 1) * .34, z = (Math.floor(i / 3) - 1) * .27;
            add('tomato-' + i, 'sphere', x, .52, z, .3, .3, .3, i % 2 ? '#CB4639' : '#E15A38');
            add('stem-' + i, 'box', x, .69, z, .07, .07, .12, '#548447');
        }
    }
    else if (prop.kind.endsWith('-cage')) {
        const lobster = prop.kind === 'lobster-cage', h = lobster ? .7 : 1.4;
        add('base', 'box', 0, .08, 0, 1.4, .16, 1.25, wood);
        add('roof', 'box', 0, h, 0, 1.4, .08, 1.25, metal);
        for (const side of [-1, 1])
            for (let i = 0; i < 5; i++) {
                add('bar-x' + side + '-' + i, 'box', side * .67, h / 2, -.55 + i * .275, .035, h, .035, metal);
                add('bar-z' + side + '-' + i, 'box', -.65 + i * .325, h / 2, side * .59, .035, h, .035, metal);
            }
        if (prop.kind === 'pigeon-cage') {
            add('perch', 'box', 0, .65, 0, 1.3, .06, .07, wood);
            bird('pigeon', 0, .66, 0);
        }
        else {
            const scorpion = prop.kind === 'scorpion-cage', color = scorpion ? '#A28355' : '#B85B49';
            add('animal-body', 'sphere', 0, .3, 0, .35, .23, .6, color);
            for (const side of [-1, 1]) {
                add('claw-' + side, 'sphere', side * .28, .3, .35, .23, .18, .3, color);
                for (let j = 0; j < 3; j++)
                    add('leg-' + side + '-' + j, 'box', side * .25, .22, -.18 + j * .18, .35, .055, .045, color);
            }
            for (let i = 0; i < 3; i++)
                add('tail-' + i, 'sphere', 0, .3 + (scorpion ? i * .14 : 0), -.28 - i * .13, .14, .16, .14, color);
        }
    }
    else if (prop.kind === 'fishing-net') {
        for (const side of [-1, 1])
            add('frame-' + side, 'box', side * .65, .8, 0, .065, 1.6, .065, wood);
        for (let i = 0; i < 7; i++) {
            add('net-v' + i, 'box', -.6 + i * .2, .75, 0, .018, 1.4, .018, '#C5BC99');
            add('net-h' + i, 'box', 0, .1 + i * .2, 0, 1.25, .018, .018, '#C5BC99');
        }
    }
    else if (prop.kind === 'fishing-pole' || prop.kind === 'fly-fishing-rod') {
        const fly = prop.kind === 'fly-fishing-rod';
        add('shaft', 'box', 0, 1.5, 0, .045, 3, .045, fly ? '#617B66' : wood);
        add('grip', 'box', 0, .42, 0, .08, .65, .08, '#CBB381');
        add('line', 'box', .17, 1.5, 0, .013, 2.9, .013, '#E0DFCD');
        add('hook', 'box', .17, .06, 0, .09, .09, .03, metal);
        if (fly) {
            add('reel', 'sphere', .12, .72, 0, .25, .25, .12, metal);
            add('fly', 'sphere', .17, .15, 0, .13, .05, .11, '#D8AA69');
        }
    }
    else if (prop.kind === 'feathers') {
        for (let i = 0; i < 5; i++) {
            add('plume-' + i, 'sphere', (i - 2) * .12, .075, (i % 2) * .15, .09, .055, .45, '#EAE6D5');
            add('quill-' + i, 'box', (i - 2) * .12, .08, (i % 2) * .15, .018, .018, .48, '#BCAF91');
        }
    }
    else
        bird('duck', 0, 0, 0, true);
    return out;
}
/** Seeded dressing changes with the world seed, never with frame timing or client join order. */
export function placeRealmProps(seed, plan, ground, navigation) {
    let state = seed >>> 0;
    const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; }, out = [];
    const reserved = (x, z) => plan.surfaces.some(s => x > s.bounds.minX - 2 && x < s.bounds.maxX + 2 && z > s.bounds.minZ - 2 && z < s.bounds.maxZ + 2) || [plan.start, plan.goal].some(p => Math.hypot(p.x - x, p.z - z) < 9) || out.some(p => Math.hypot(p.position.x - x, p.position.z - z) < 4);
    for (const [index, kind] of [...REALM_PROP_KINDS, 'duck', 'tomato-crate', 'feathers'].entries()) {
        let point;
        for (let attempt = 0; attempt < 240; attempt++) {
            const east = index % 2 === 1, x = (east ? 94 : 22) + random() * 30, z = (random() < .5 ? -1 : 1) * (9 + random() * 35), g = ground(x, z);
            if (g.waterDepth > .05 || g.slopeDegrees > 25 || reserved(x, z))
                continue;
            const check = navigation.check({ x, z });
            if (!check.ok)
                continue;
            point = { x, y: g.height, z };
            break;
        }
        if (!point)
            throw Error('No safe scenery placement for ' + kind);
        out.push({ id: 'realm-prop:' + kind + ':' + index, kind: kind, position: point });
    }
    return out;
}
/** New overlook paths use the exact same continuous support surfaces for rendering and walking. */
export function addLandscapeLayers(plan, base) {
    plan.bounds = { minX: 15, maxX: 129, minZ: -56, maxZ: 56 };
    for (const [i, x] of [25, 119].entries()) {
        const y = base(x, 8).height;
        plan.surfaces.push({ id: 'landscape:overlook-ramp-' + i, bounds: { minX: x - 2, maxX: x + 2, minZ: 8, maxZ: 24 }, axis: 'z', startY: y, endY: y + 4, thickness: .35, color: '#8C866B', overrideTerrain: true }, { id: 'landscape:overlook-deck-' + i, bounds: { minX: x - 2, maxX: x + 2, minZ: 24, maxZ: 30 }, axis: 'z', startY: y + 4, endY: y + 4, thickness: .45, color: '#8C866B', overrideTerrain: true });
        // Layered rock shoulders leave the walkable overlook strip clear.
        for (const side of [-1, 1])
            for (let j = 0; j < 3; j++) {
                const px = x + side * (5 + j * 3), z = 38 + j * 4, g = base(px, z);
                plan.primitives.push({ id: 'landscape:ridge-' + i + '-' + side + '-' + j, shape: 'cone', position: { x: px, y: g.height + 3 + j * 1.3, z }, size: { x: 8 + j * 3, y: 8 + j * 3, z: 12 + j * 3 }, color: j % 2 ? '#738176' : '#626F7E', collision: 'none' });
            }
    }
}
