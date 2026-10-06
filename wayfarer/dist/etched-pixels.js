export const SURFACE_KINDS = ['stone', 'wood', 'cloth', 'metal', 'skin', 'fur', 'leaf', 'crystal', 'soil', 'gravel', 'sand', 'brick'];
/** Tiny deterministic grayscale tiles modulate the existing art palette. */
export function etchedPixels(kind) {
    if (!SURFACE_KINDS.includes(kind))
        throw new Error('Invalid surface kind');
    const out = new Uint8Array(32 * 32 * 3);
    for (let y = 0; y < 32; y++)
        for (let x = 0; x < 32; x++) {
            const noise = ((Math.imul(x + 7, 374761393) ^ Math.imul(y + 11, 668265263)) >>> 0) % 13;
            let v = 240 + noise;
            if (kind === 'stone')
                v = x % 16 === 0 || y % 8 === 0 ? 190 : 228 + noise;
            else if (kind === 'wood')
                v = 220 + noise - ((x + Math.floor(Math.sin(y * .35) * 2)) % 7 === 0 ? 30 : 0);
            else if (kind === 'cloth')
                v = 232 + noise - ((x + y) % 4 === 0 ? 18 : 0);
            else if (kind === 'metal')
                v = 239 + noise - ((x === y || x + y === 31) && x > 8 && x < 24 ? 35 : 0);
            else if (kind === 'skin')
                v = 247 + (noise % 8);
            else if (kind === 'fur')
                v = 232 + noise - (x % 5 === 0 && y % 3 !== 0 ? 20 : 0);
            else if (kind === 'leaf')
                v = 228 + noise - (x % 8 === 0 || y === 16 ? 22 : 0);
            else if (kind === 'crystal')
                v = 240 + noise - ((x + 2 * y) % 16 === 0 ? 25 : 0);
            else if (kind === 'soil')
                v = 215 + noise - ((x * 7 + y * 11) % 23 < 3 ? 22 : 0);
            else if (kind === 'gravel')
                v = 230 + noise - ((x * 3 + y * 5) % 17 < 5 ? 35 : 0);
            else if (kind === 'sand')
                v = 242 + noise - ((x + Math.floor(y / 3)) % 13 === 0 ? 12 : 0);
            else if (kind === 'brick')
                v = y % 8 === 0 || (x + (Math.floor(y / 8) % 2) * 8) % 16 === 0 ? 178 : 226 + noise;
            const value = Math.max(0, Math.min(255, v));
            out.fill(value, (y * 32 + x) * 3, (y * 32 + x) * 3 + 3);
        }
    return out;
}
/** Facet-local UV projection keeps detail on horizontal terrain and vertical props. */
export function etchedUVs(positions, normals) {
    if (positions.length !== normals.length || positions.length % 3 || positions.length > 300000 || !positions.every(Number.isFinite) || !normals.every(Number.isFinite))
        throw new Error('Invalid surface geometry');
    const uv = [];
    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i], y = positions[i + 1], z = positions[i + 2], nx = Math.abs(normals[i]), ny = Math.abs(normals[i + 1]), nz = Math.abs(normals[i + 2]);
        uv.push((ny >= nx && ny >= nz ? x : nx >= nz ? z : x) * .65, (ny >= nx && ny >= nz ? z : y) * .65);
    }
    return uv;
}
export function surfaceForColor(hex) {
    if (!/^#[0-9a-f]{6}$/i.test(hex))
        throw new Error('Invalid surface color');
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    if (g > r * 1.15 && g > b * 1.1)
        return 'leaf';
    if (b > r * 1.3)
        return 'crystal';
    if (r > g * 1.25 && g > b * 1.15)
        return 'wood';
    if (r > b * 1.5 && g > b * 1.4)
        return 'metal';
    return 'stone';
}
