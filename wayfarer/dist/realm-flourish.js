import { TransformNode, Mesh, MeshBuilder, StandardMaterial, Color3 } from '@babylonjs/core';
import { etchMaterial } from './etched-surfaces.js';
export const FLOURISH_COLORS = ['#90AE5D', '#476F53', '#DCA2B8', '#A899CF', '#E8CD77', '#CF735A', '#BD9670', '#66798A', '#8A7460', '#D6C495', '#779583', '#AE7A95'];
/** Bounded seeded dressing, kept off reserved support surfaces and unsafe/wet land. */
export function flourishSites(seed, bounds, ground, reserved) {
    if (!Number.isSafeInteger(seed) || !Object.values(bounds).every(Number.isFinite) || bounds.maxX - bounds.minX < 4 || bounds.maxZ - bounds.minZ < 4 || bounds.maxX - bounds.minX > 10000 || bounds.maxZ - bounds.minZ > 10000)
        throw Error('Invalid flourish world');
    let state = seed >>> 0;
    const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; }, out = [];
    const kinds = ['flowers', 'fern', 'mushrooms', 'gravel', 'soil', 'driftwood'];
    for (let attempt = 0; attempt < 480 && out.length < 144; attempt++) {
        const x = bounds.minX + 2 + random() * (bounds.maxX - bounds.minX - 4), z = bounds.minZ + 2 + random() * (bounds.maxZ - bounds.minZ - 4), g = ground(x, z);
        if (reserved(x, z) || g.waterDepth > .05 || g.slopeDegrees > 28 || g.slopeDegrees < 0 || g.waterDepth < 0 || ![g.height, g.slopeDegrees, g.waterDepth].every(Number.isFinite))
            continue;
        const variant = Math.floor(random() * 12);
        out.push({ kind: kinds[out.length % 6], position: { x, y: g.height, z }, variant, fine: out.length % 2 === 1 });
    }
    return out;
}
export function createRealmFlourish(scene, sites, water) {
    if (sites.length > 144 || water.length > 8 || sites.some(s => !['flowers', 'fern', 'mushrooms', 'gravel', 'soil', 'driftwood'].includes(s.kind) || !Number.isInteger(s.variant) || s.variant < 0 || s.variant >= 12 || typeof s.fine !== 'boolean' || ![s.position.x, s.position.y, s.position.z].every(Number.isFinite)) || water.some(p => ![p.x, p.y, p.z].every(Number.isFinite)))
        throw Error('Invalid flourish budget or descriptor');
    const root = new TransformNode('realm-flourish', scene), materials = new Map(), batches = [], fish = [], ripples = [];
    const mat = (color, kind) => { const key = color + kind; let m = materials.get(key); if (!m) {
        m = new StandardMaterial('flourish:' + key, scene);
        m.diffuseColor = Color3.FromHexString(color);
        m.specularColor = Color3.Black();
        etchMaterial(scene, m, kind);
        materials.set(key, m);
    } return m; };
    const shape = (name, type, x, y, z, sx, sy, sz, color, kind, parent = root) => { const m = type === 'box' ? MeshBuilder.CreateBox(name, { size: 1 }, scene) : type === 'sphere' ? MeshBuilder.CreateSphere(name, { diameter: 1, segments: 3 }, scene) : MeshBuilder.CreateCylinder(name, { diameterTop: 0, diameterBottom: 1, height: 1, tessellation: 5 }, scene); m.parent = parent; m.position.set(x, y, z); m.scaling.set(sx, sy, sz); m.material = mat(color, kind); m.isPickable = false; m.checkCollisions = false; return m; };
    const groups = new Map();
    for (const [i, site] of sites.entries()) {
        const { x, y, z } = site.position, c = FLOURISH_COLORS[site.variant % 12], siteParts = [];
        const add = (type, dx, dy, dz, sx, sy, sz, color, kind) => siteParts.push(shape('flourish:' + site.kind + ':' + i, type, x + dx, y + dy, z + dz, sx, sy, sz, color, kind));
        if (site.kind === 'flowers') {
            for (let j = 0; j < 3; j++) {
                add('box', j * .15, .16, 0, .025, .32, .025, '#476F53', 'leaf');
                for (let k = 0; k < 4; k++) {
                    const a = k * Math.PI / 2;
                    add('sphere', j * .15 + Math.cos(a) * .07, .34, Math.sin(a) * .07, .12, .05, .12, c, 'leaf');
                }
                add('sphere', j * .15, .37, 0, .04, .03, .04, '#E8CD77', 'leaf');
            }
        }
        else if (site.kind === 'fern') {
            for (let j = 0; j < 5; j++) {
                const a = j * Math.PI * 2 / 5;
                add('cone', Math.cos(a) * .16, .22, Math.sin(a) * .16, .16, .42, .3, j % 2 ? '#90AE5D' : '#476F53', 'leaf');
            }
        }
        else if (site.kind === 'mushrooms') {
            for (let j = 0; j < 3; j++) {
                add('box', j * .12, .09, 0, .045, .18, .045, '#D6C495', 'wood');
                add('sphere', j * .12, .19, 0, .22, .1, .22, c, 'leaf');
                add('sphere', j * .12 + .025, .235, 0, .04, .018, .04, '#E8CD77', 'leaf');
            }
        }
        else if (site.kind === 'gravel') {
            for (let j = 0; j < 5; j++)
                add('sphere', Math.sin(j * 4) * .3, .045, Math.cos(j * 3) * .25, .12, .09, .15, j % 2 ? '#66798A' : '#D6C495', 'gravel');
        }
        else if (site.kind === 'soil') {
            add('sphere', 0, .015, 0, .75, .025, .6, '#8A7460', 'soil');
            add('sphere', .22, .035, .1, .22, .03, .3, '#779583', 'leaf');
        }
        else {
            add('box', 0, .07, 0, .7, .13, .12, '#BD9670', 'wood');
            add('box', .2, .10, .1, .17, .06, .28, '#8A7460', 'wood');
        }
        for (const m of siteParts) {
            const key = (site.fine ? 'fine:' : 'base:') + m.material.name, list = groups.get(key) ?? [];
            list.push(m);
            groups.set(key, list);
        }
    }
    for (const [key, list] of groups) {
        const merged = list.length > 1 ? Mesh.MergeMeshes(list, true, true) : list[0];
        if (merged) {
            merged.name = 'flourish:batch:' + key;
            merged.parent = root;
            merged.isPickable = false;
            merged.checkCollisions = false;
            merged.metadata = { fine: key.startsWith('fine:') };
            batches.push(merged);
        }
    }
    for (const [i, p] of water.entries()) {
        const f = new TransformNode('flourish:river-fish:' + i, scene);
        f.parent = root;
        f.position.set(p.x, p.y - .25, p.z);
        shape('flourish:fish-body', 'sphere', 0, 0, 0, .32, .10, .12, i % 2 ? '#D6C495' : '#AE7A95', 'fur', f);
        shape('flourish:fish-tail', 'cone', -.17, 0, 0, .13, .1, .12, '#66798A', 'fur', f);
        fish.push(f);
        const r = MeshBuilder.CreateTorus('flourish:ripple:' + i, { diameter: .7, thickness: .015, tessellation: 12 }, scene);
        r.parent = root;
        r.position.set(p.x, p.y + .025, p.z);
        r.material = mat('#D6C495', 'sand');
        r.isPickable = false;
        r.checkCollisions = false;
        ripples.push(r);
    }
    let disposed = false, lastTime = 0, frozen;
    return { root, get batchCount() { return batches.length; }, update(now, paused, quality, day) { if (disposed)
            return; if (!Number.isFinite(now) || now < 0 || !['maximum', 'high', 'balanced'].includes(quality) || !Number.isFinite(day))
            throw Error('Invalid flourish frame'); if (paused)
            frozen ??= lastTime;
        else
            frozen = undefined; const time = frozen ?? now; lastTime = time; for (const m of batches)
            m.setEnabled(quality !== 'balanced' || !m.metadata?.fine); for (let i = 0; i < fish.length; i++) {
            const f = fish[i], p = water[i];
            f.setEnabled(quality !== 'balanced');
            f.position.set(p.x + Math.sin(time * .0005 + i) * .35, p.y - .25, p.z + Math.cos(time * .0004 + i) * .25);
            f.rotation.y = Math.sin(time * .0004 + i);
            const r = ripples[i];
            r.setEnabled(quality !== 'balanced' || i < 3);
            r.scaling.setAll(.85 + Math.sin(time * .001 + i) * .12);
            r.visibility = .15 + Math.max(0, Math.min(1, day)) * .25;
        } }, dispose() { if (disposed)
            return; disposed = true; root.dispose(); for (const m of materials.values())
            m.dispose(); materials.clear(); } };
}
