import { RawTexture, Texture, StandardMaterial, Color3 } from '@babylonjs/core';
const pools = new WeakMap();
/** One flowing pattern and world-space UV phase per scene, including caves and fountains. */
export function waterMaterial(scene, mesh) {
    const material = mesh.material;
    if (!(material instanceof StandardMaterial))
        return;
    let texture = pools.get(scene);
    if (!texture) {
        const size = 64, pixels = new Uint8Array(size * size * 3);
        for (let z = 0; z < size; z++)
            for (let x = 0; x < size; x++) {
                const wave = Math.sin(z * .5 + Math.sin(x * .3) * 1.5), v = Math.round(200 + wave * 24);
                pixels.set([v, Math.min(255, v + 12), Math.min(255, v + 18)], (z * size + x) * 3);
            }
        texture = RawTexture.CreateRGBTexture(pixels, size, size, scene, false, false, Texture.BILINEAR_SAMPLINGMODE);
        texture.name = 'realm-water:shared-flow';
        texture.wrapU = Texture.WRAP_ADDRESSMODE;
        texture.wrapV = Texture.WRAP_ADDRESSMODE;
        pools.set(scene, texture);
        scene.onDisposeObservable.addOnce(() => texture.dispose());
    }
    material.diffuseTexture = texture;
    material.alpha = .9;
    material.specularPower = 80;
    material.specularColor = new Color3(.5, .65, .7);
    material.backFaceCulling = false;
    const positions = mesh.getVerticesData('position');
    if (positions)
        mesh.setVerticesData('uv', Array.from(positions).flatMap((_, i) => i % 3 === 0 ? [positions[i] / 4, (positions[i + 2] + positions[i + 1] * .3) / 4] : []));
    mesh.isPickable = false;
}
export function updateWaterFlow(scene, now, paused) { const texture = pools.get(scene); if (texture && !paused) {
    texture.vOffset = (now / 22000) % 1;
    texture.uOffset = Math.sin(now / 18000) * .025;
} }
