import { MeshBuilder, StandardMaterial, Color3 } from '@babylonjs/core';
/** Local garden/hearth presentation follows private gameplay snapshots; never edits collision or rewards. */
export function createSkillLife3D(scene, camp) {
    const green = new StandardMaterial('skill-herb-green', scene);
    green.diffuseColor = new Color3(.22, .64, .35);
    const ready = new StandardMaterial('skill-herb-ready', scene);
    ready.diffuseColor = new Color3(.55, .79, .3);
    ready.emissiveColor = new Color3(.06, .12, .02);
    const flame = new StandardMaterial('skill-hearth-warm', scene);
    flame.diffuseColor = new Color3(.95, .43, .1);
    flame.emissiveColor = new Color3(.5, .15, .015);
    const sprouts = [];
    for (let i = 0; i < 3; i++) {
        const herb = MeshBuilder.CreateCylinder('skill-herb-' + i, { diameterTop: .16, diameterBottom: .08, height: .34, tessellation: 5 }, scene);
        herb.position.set(camp.x + .8 + i * .17, camp.y + .4, camp.z + 1.4);
        herb.isPickable = false;
        herb.material = green;
        herb.setEnabled(false);
        sprouts.push(herb);
    }
    const hearth = MeshBuilder.CreatePolyhedron('skill-hearth-flame', { type: 1, size: .22 }, scene);
    hearth.position.set(camp.x - 1.7, camp.y + .3, camp.z + 1.3);
    hearth.material = flame;
    hearth.isPickable = false;
    hearth.setEnabled(false);
    return { sprouts, hearth, update(life, tick, now, paused, outside = true) {
            for (const herb of sprouts) {
                herb.setEnabled(outside && !!life && (life.cropReady || life.cropTicks > 0));
                herb.material = life?.cropReady ? ready : green;
                herb.scaling.y = life?.cropReady ? 1 : Math.max(.2, 1 - (life?.cropTicks ?? 600) / 600);
            }
            hearth.setEnabled(outside && !!life && life.hearthUntil > tick);
            hearth.scaling.y = paused ? 1 : 1 + Math.sin(now * .006) * .1;
        }, dispose() { for (const herb of sprouts)
            herb.dispose(); hearth.dispose(); green.dispose(); ready.dispose(); flame.dispose(); } };
}
