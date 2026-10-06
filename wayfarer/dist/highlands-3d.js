import { etchMaterial } from './etched-surfaces.js';
import { surfaceForColor } from './etched-pixels.js';
import { TransformNode, MeshBuilder, StandardMaterial, Color3 } from '@babylonjs/core';
/** Decorative landmark meshes never replace the shared navigation surface. */
export function createHighlands3D(scene, stops) {
    const root = new TransformNode('starlit-highlands', scene), materials = new Map(), moving = [];
    const material = (hex) => { let m = materials.get(hex); if (!m) {
        m = new StandardMaterial('highlands:' + hex, scene);
        m.diffuseColor = Color3.FromHexString(hex);
        m.specularColor = Color3.Black();
        materials.set(hex, m);
    } return m; };
    const mount = (mesh, parent, color, x, y, z) => { mesh.parent = parent; mesh.material = material(color); etchMaterial(scene, mesh.material, surfaceForColor(color)); mesh.position.set(x, y, z); mesh.isPickable = false; mesh.checkCollisions = false; return mesh; };
    const box = (name, parent, color, x, y, z, w, h, d) => mount(MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, scene), parent, color, x, y, z);
    for (const stop of stops) {
        const site = new TransformNode('highland:' + stop.id, scene);
        site.parent = root;
        site.position.set(stop.position.x, stop.position.y, stop.position.z);
        const marker = mount(MeshBuilder.CreateTorus(stop.id + ':trail-ring', { diameter: 1.5, thickness: .045, tessellation: 16 }, scene), site, '#ccb576', 0, .06, 0);
        marker.metadata = { discovery: stop.id };
        box(stop.id + ':sign-post', site, '#705b43', -1.7, .8, 0, .12, 1.6, .12);
        box(stop.id + ':sign', site, '#cbb780', -1.7, 1.45, 0, .8, .4, .12);
        if (stop.id === 'yak-knoll') {
            for (let i = 0; i < 3; i++)
                mount(MeshBuilder.CreateSphere('yak-knoll:boulder' + i, { diameter: 1, segments: 4 }, scene), site, '#84938a', 1.5 + i * .7, .3, -2).scaling.set(1.2, .7, .9);
            const chime = new TransformNode('yak-knoll:wind-bell', scene);
            chime.parent = site;
            chime.position.set(-1.7, 1.15, .2);
            mount(MeshBuilder.CreateCylinder('yak-knoll:bell', { diameterTop: .16, diameterBottom: .28, height: .25, tessellation: 6 }, scene), chime, '#c5a16b', 0, 0, 0);
            moving.push(chime);
        }
        else if (stop.id === 'panda-grove') {
            for (let i = 0; i < 7; i++) {
                const x = 1.6 + (i % 3) * .35, z = -1.3 - Math.floor(i / 3) * .4;
                mount(MeshBuilder.CreateCylinder('panda-grove:bamboo' + i, { diameter: .09, height: 2.4, tessellation: 5 }, scene), site, '#5d8b55', x, 1.2, z);
                for (let j = 0; j < 2; j++)
                    mount(MeshBuilder.CreateSphere('panda-grove:leaf' + i + ':' + j, { diameter: .4, segments: 3 }, scene), site, '#83b06b', x + .13, 1.5 + j * .4, z).scaling.set(1, .15, .5);
            }
            box('panda-grove:tea-stone', site, '#7f9289', -1.6, .2, -1, .8, .4, .6);
            mount(MeshBuilder.CreateCylinder('panda-grove:tea-cup', { diameter: .12, height: .13, tessellation: 6 }, scene), site, '#ede4c9', -1.6, .47, -1);
        }
        else if (stop.id === 'gull-watch') {
            for (const x of [-2, 2])
                box('gull-watch:ruin', site, '#80939c', x, 1, -1, .6, 2, .6);
            box('gull-watch:lintel', site, '#8c9ba0', 0, 2, -1, 4.7, .35, .7);
            const vane = new TransformNode('gull-watch:wind-vane', scene);
            vane.parent = site;
            vane.position.set(2, 2.6, -1);
            box('gull-watch:arrow', vane, '#dbbc76', 0, 0, 0, .8, .1, .08);
            moving.push(vane);
        }
        else {
            for (let i = 0; i < 4; i++) {
                const angle = i * Math.PI / 2;
                const column = mount(MeshBuilder.CreateCylinder('star-stones:column' + i, { height: 1.2 + i * .25, diameter: .5, tessellation: 6 }, scene), site, '#697d8b', Math.cos(angle) * 2, (1.2 + i * .25) / 2, Math.sin(angle) * 2);
                column.rotation.z = (i - 1.5) * .04;
                mount(MeshBuilder.CreatePolyhedron('star-stones:star' + i, { type: 1, size: .12 }, scene), site, '#d9cf94', Math.cos(angle) * 2, 1.3 + i * .25, Math.sin(angle) * 2);
            }
        }
    }
    // Distant silhouettes sit outside the playable area, behind the discovery trail.
    if (stops.length) {
        const base = stops[0].position;
        for (let i = 0; i < 3; i++) {
            const peak = mount(MeshBuilder.CreateCylinder('highlands:distant-peak' + i, { diameterTop: 0, diameterBottom: 15 + i * 4, height: 13 + i * 4, tessellation: 5 }, scene), root, '#596b86', base.x + 22 + i * 18, base.y + 1 + i * 2, base.z - 38 - i * 3);
            peak.metadata = { scenicOnly: true };
        }
    }
    let disposed = false;
    return { root, update(now, paused) { if (disposed || !Number.isFinite(now))
            return; moving.forEach((node, i) => { node.rotation.z = paused ? 0 : Math.sin(now * .001 + i) * .08; }); }, dispose() { if (disposed)
            return; disposed = true; root.dispose(); for (const m of materials.values())
            m.dispose(); materials.clear(); } };
}
