import { TransformNode, MeshBuilder, StandardMaterial, Color3 } from '@babylonjs/core';
import { PROFESSIONS } from './skilling.js';
import { etchMaterial } from './etched-surfaces.js';
export const NODE_OFFSETS = { woodcutting: { x: -3, z: -5 }, mining: { x: 3, z: -5 }, fishing: { x: 0, z: 6 } };
export function createGatherNodes3D(scene, beacon, check) {
    const root = new TransformNode('gathering-sites', scene), materials = [], sites = new Map();
    const mat = (name, color, kind) => { const m = new StandardMaterial('gather:' + name, scene); m.diffuseColor = Color3.FromHexString(color); etchMaterial(scene, m, kind); materials.push(m); return m; };
    const wood = mat('wood', '#866444', 'wood'), leaf = mat('leaf', '#73a35d', 'leaf'), stone = mat('stone', '#858c97', 'stone'), ore = mat('ore', '#abd0dd', 'crystal');
    for (const skill of PROFESSIONS) {
        const offset = NODE_OFFSETS[skill], p = check({ x: beacon.x + offset.x, y: beacon.y, z: beacon.z + offset.z });
        if (!p.ok || !p.position)
            continue;
        const base = new TransformNode('gather:' + skill, scene);
        base.parent = root;
        base.position.set(p.position.x, p.position.y, p.position.z);
        const top = new TransformNode('gather:' + skill + ':available', scene);
        top.parent = base;
        sites.set(skill, { top, position: { ...p.position } });
        const mesh = (shape, name, parent, x, y, z, sx, sy, sz, m) => { const mesh = shape === 'box' ? MeshBuilder.CreateBox(name, { size: 1 }, scene) : shape === 'sphere' ? MeshBuilder.CreateSphere(name, { diameter: 1, segments: 5 }, scene) : MeshBuilder.CreateCylinder(name, { height: 1, diameter: 1, tessellation: 6 }, scene); mesh.parent = parent; mesh.position.set(x, y, z); mesh.scaling.set(sx, sy, sz); mesh.material = m; mesh.isPickable = false; mesh.checkCollisions = false; return mesh; };
        if (skill === 'woodcutting') {
            mesh('cylinder', 'gather:stump', base, 0, .15, 0, .65, .3, .65, wood);
            mesh('cylinder', 'gather:trunk', top, 0, 1.1, 0, .35, 2, .35, wood);
            for (let i = 0; i < 3; i++)
                mesh('sphere', 'gather:willow-canopy' + i, top, (i - 1) * .5, 2.2 + Math.sin(i) * .25, 0, 1.4, 1.4, 1.4, leaf);
        }
        else if (skill === 'mining') {
            mesh('sphere', 'gather:spent-rock', base, 0, .25, 0, 1.15, .5, 1, stone);
            for (let i = 0; i < 4; i++)
                mesh('sphere', 'gather:ore-vein' + i, top, (i % 2 - .5) * .55, .5 + Math.floor(i / 2) * .18, 0, .45, .38, .5, ore);
        }
        else {
            mesh('cylinder', 'gather:pool-rim', base, 0, .03, 0, 1.6, .06, 1.6, stone);
            for (let i = 0; i < 3; i++)
                mesh('sphere', 'gather:fish-glint' + i, top, (i - 1) * .35, .07, .18 * Math.sin(i), .15, .025, .06, ore);
        }
    }
    let disposed = false;
    return { root, sites, update(nodes, now, paused) { if (disposed)
            return; for (const [skill, site] of sites) {
            site.top.setEnabled(nodes[skill].stock > 0);
            site.top.rotation.z = skill === 'woodcutting' && !paused ? Math.sin(now * .001) * .018 : 0;
        } }, dispose() { if (disposed)
            return; disposed = true; root.dispose(); for (const m of materials)
            m.dispose(); } };
}
