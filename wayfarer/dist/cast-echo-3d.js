import { TransformNode, MeshBuilder, StandardMaterial, Color3 } from '@babylonjs/core';
import { isResonanceEffectId } from './resonance-codex.js';
/** One reusable effect pool, triggered by an increase in the server's cast count. */
export class CastEcho3D {
    root;
    material;
    rings = [];
    started;
    lastCasts;
    player;
    constructor(scene) {
        this.root = new TransformNode('cast-echo', scene);
        this.root.setEnabled(false);
        this.material = new StandardMaterial('cast-echo:ink', scene);
        this.material.diffuseColor = new Color3(.15, .36, .4);
        this.material.emissiveColor = new Color3(.22, .55, .6);
        this.material.specularColor = Color3.Black();
        for (let i = 0; i < 3; i++) {
            const ring = MeshBuilder.CreateTorus('cast-echo:contour' + i, { diameter: 1.5 + i * .5, thickness: .035, tessellation: 24 }, scene);
            ring.parent = this.root;
            ring.material = this.material;
            ring.isPickable = false;
            ring.checkCollisions = false;
            ring.position.y = .12 + i * .4;
            this.rings.push(ring);
        }
        for (let i = 0; i < 8; i++) {
            const glyph = MeshBuilder.CreateBox('cast-echo:voxel-rune' + i, { size: .09 }, scene);
            glyph.parent = this.root;
            glyph.material = this.material;
            glyph.isPickable = false;
            glyph.checkCollisions = false;
            glyph.position.set(Math.cos(i * Math.PI / 4) * 1.2, .3, Math.sin(i * Math.PI / 4) * 1.2);
            glyph.rotation.z = Math.PI / 4;
        }
    }
    update(player, state, position, now, paused, enabled) {
        if (player !== this.player) {
            this.player = player;
            this.lastCasts = undefined;
            this.started = undefined;
        }
        if (!Number.isFinite(now) || !state || !Number.isSafeInteger(state.casts) || state.casts < 0 || !position || ![position.x, position.y, position.z].every(Number.isFinite)) {
            this.root.setEnabled(false);
            this.started = undefined;
            return;
        }
        if (this.lastCasts !== undefined && state.casts > this.lastCasts && isResonanceEffectId(state.activeEffect))
            this.started = now;
        this.lastCasts = state.casts;
        const age = this.started === undefined ? Infinity : now - this.started;
        if (age < 0 || age >= 1800) {
            this.started = undefined;
            this.root.setEnabled(false);
            return;
        }
        this.root.setEnabled(enabled && !paused);
        if (!enabled || paused)
            return;
        this.root.position.set(position.x, position.y, position.z);
        const t = age / 1800;
        this.material.alpha = Math.max(.05, 1 - t);
        this.root.rotation.y = t * Math.PI * .35;
        this.rings.forEach((ring, i) => { ring.scaling.setAll(1 + t * (.5 + i * .12)); ring.position.y = .12 + i * .4 + t * .4; ring.rotation.z = Math.sin(t * Math.PI) * .08 * (i - 1); });
    }
    dispose() { this.root.dispose(); this.material.dispose(); }
}
