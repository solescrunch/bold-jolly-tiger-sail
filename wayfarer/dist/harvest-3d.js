import { TransformNode } from '@babylonjs/core';
import { mountBabylonMesh } from './babylon-mesh.js';
import { primitiveMesh } from './scene-meshes.js';
import { waterMaterial } from './flowing-water.js';
import { HARVEST_ITEMS } from './harvest-content.js';
export function harvestPrimitives(site) {
    const item = HARVEST_ITEMS.find(i => i.id === site.id);
    const p = site.position, out = [];
    const add = (part, shape, x, y, z, sx, sy, sz, color) => out.push({ id: 'harvest:' + item.id + ':' + part, shape, position: { x: p.x + x, y: p.y + y, z: p.z + z }, size: { x: sx, y: sy, z: sz }, color, collision: 'none' });
    if (item.skill === 'woodcutting') {
        add('stump', 'box', 0, .15, 0, .5, .3, .5, '#90704D');
        add('trunk', 'box', 0, 1.1, 0, .32, 2.2, .32, '#876344');
        for (let i = 0; i < 3; i++)
            add('canopy-' + i, item.id === 'pine-log' ? 'cone' : 'sphere', (i - 1) * .35, 2 + i * .22, 0, 1.4, 1.4, 1.4, item.color);
        if (item.id === 'willow-log')
            for (const side of [-1, 1])
                add('bough-' + side, 'cone', side * .6, 1.7, 0, .55, 1.6, .65, item.color);
    }
    else if (item.skill === 'mining') {
        add('base', 'sphere', 0, .3, 0, 1.4, .6, 1.25, '#67747B');
        for (let i = 0; i < 4; i++)
            add('vein-' + i, 'cone', (i % 2 - .5) * .6, .65 + Math.floor(i / 2) * .15, 0, .45, .65, .5, item.color);
    }
    else {
        add('rim', 'sphere', 0, .02, 0, 1.8, .12, 1.8, '#87929B');
        add('water', 'sphere', 0, .075, 0, 1.5, .035, 1.5, '#487F87');
        for (let i = 0; i < 3; i++) {
            add('fish-' + i, 'sphere', (i - 1) * .3, .11, 0, .28, .07, .11, item.color);
            add('tail-' + i, 'cone', (i - 1) * .3 - .16, .11, 0, .08, .045, .15, item.color);
        }
    }
    return out;
}
export function createHarvest3D(scene, sites) { const root = new TransformNode('named-harvest-sites', scene), entries = sites.map(site => ({ site, handles: harvestPrimitives(site).map(p => { const h = mountBabylonMesh(scene, p.id, primitiveMesh(p)); h.mesh.parent = root; h.mesh.isPickable = false; h.mesh.metadata = { harvestId: site.id }; if (p.id.endsWith(':water'))
        waterMaterial(scene, h.mesh); return h; }) })); let disposed = false; return { root, update(world) { if (disposed)
        return; for (const e of entries)
        for (const h of e.handles) {
            const base = /:stump$|:base$|:rim$|:water$/.test(h.mesh.name);
            h.mesh.setEnabled(base || world[e.site.id].stock > 0);
        } }, dispose() { if (disposed)
        return; disposed = true; for (const e of entries)
        for (const h of e.handles)
            h.dispose(); root.dispose(); } }; }
