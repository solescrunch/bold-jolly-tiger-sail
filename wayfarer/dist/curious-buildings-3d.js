import { mountBabylonMesh } from './babylon-mesh.js';
import { primitiveMesh } from './scene-meshes.js';
import { nearbyBuilding } from './curious-buildings.js';
import { PointLight, Vector3, Color3 } from '@babylonjs/core';
export function createCuriousRoofs(scene, buildings) { const roofs = buildings.map(building => ({ building, handles: building.roof.map(p => { const h = mountBabylonMesh(scene, 'roof:' + p.id, primitiveMesh(p)); h.mesh.isPickable = false; return h; }) })); const lamps = buildings.map(building => { const light = new PointLight('interior:' + building.id, new Vector3(building.room.x + 1.7, building.room.y + 2.2, building.room.z + Math.sign(building.room.z)), scene); light.diffuse = new Color3(1, .66, .3); light.range = 7; light.intensity = .65; light.setEnabled(false); return { building, light }; }); let disposed = false; return { update(position) { if (disposed)
        return; const active = nearbyBuilding(position, buildings); for (const lamp of lamps)
        lamp.light.setEnabled(active?.id === lamp.building.id); for (const entry of roofs)
        for (const h of entry.handles)
            h.mesh.setEnabled(active?.id !== entry.building.id); return active; }, dispose() { if (disposed)
        return; disposed = true; for (const lamp of lamps)
        lamp.light.dispose(); for (const entry of roofs)
        for (const h of entry.handles)
            h.dispose(); } }; }
