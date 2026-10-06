import { RawTexture, Texture } from '@babylonjs/core';
import { etchedPixels } from './etched-pixels.js';
const pools = new WeakMap();
function poolFor(scene) { let pool = pools.get(scene); if (!pool) {
    pool = { enabled: true, entries: new Map() };
    pools.set(scene, pool);
} return pool; }
/** Shared reference-counted 32px textures; materials retain their original colors. */
export function etchMaterial(scene, material, kind) {
    if (material.diffuseTexture)
        return;
    const pool = poolFor(scene);
    let entry = pool.entries.get(kind);
    if (!entry) {
        const texture = RawTexture.CreateRGBTexture(etchedPixels(kind), 32, 32, scene, false, false, Texture.NEAREST_SAMPLINGMODE);
        texture.name = 'etched:' + kind;
        texture.wrapU = Texture.WRAP_ADDRESSMODE;
        texture.wrapV = Texture.WRAP_ADDRESSMODE;
        texture.gammaSpace = false;
        entry = { texture, users: new Set() };
        pool.entries.set(kind, entry);
    }
    const item = entry;
    if (item.users.has(material))
        return;
    item.users.add(material);
    if (pool.enabled)
        material.diffuseTexture = item.texture;
    material.onDisposeObservable.addOnce(() => { item.users.delete(material); if (item.users.size === 0) {
        item.texture.dispose();
        pool.entries.delete(kind);
    } });
}
export function setEtchedDetail(scene, enabled) { const pool = poolFor(scene); pool.enabled = enabled; for (const item of pool.entries.values())
    for (const material of item.users)
        material.diffuseTexture = enabled ? item.texture : null; }
