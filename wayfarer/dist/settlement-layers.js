/** Fences are server colliders; deliberately open gates preserve the same walkable passages. */
export function addSettlementLayers(plan, ground) {
    const add = (id, shape, x, y, z, sx, sy, sz, color, solid = false) => plan.primitives.push({ id, shape, position: { x, y, z }, size: { x: sx, y: sy, z: sz }, color, collision: solid ? 'solid' : 'none' });
    for (const [index, b] of [{ x: 20, z: -44 }, { x: 112, z: 39 }].entries()) {
        const height = (x, z) => ground(x, z).height;
        for (const side of [-1, 1]) {
            const x = b.x + (side < 0 ? 0 : 10), z = b.z + 5;
            add('settlement:' + index + ':fence-side-' + side, 'box', x, height(x, z) + .65, z, .15, 1.3, 10, '#A18A61', true);
        }
        add('settlement:' + index + ':fence-rear', 'box', b.x + 5, height(b.x + 5, b.z) + .65, b.z, 10, 1.3, .15, '#A18A61', true);
        for (const side of [-1, 1]) {
            const x = b.x + 5 + side * 3.6, z = b.z + 10;
            add('settlement:' + index + ':fence-front-' + side, 'box', x, height(x, z) + .65, z, 2.8, 1.3, .15, '#A18A61', true);
            add('settlement:' + index + ':gate-post-' + side, 'box', b.x + 5 + side * 2, height(b.x + 5 + side * 2, z) + 1, z, .25, 2, .25, '#6B5942', true);
        }
        add('settlement:' + index + ':gate-arch', 'box', b.x + 5, height(b.x + 5, b.z + 10) + 2.25, b.z + 10, 4.5, .2, .35, '#AB9465');
        // Open gate leaves face inward along the fence edge, leaving a four-metre passage.
        for (const side of [-1, 1])
            add('settlement:' + index + ':open-gate-' + side, 'box', b.x + 5 + side * 2, height(b.x + 5 + side * 2, b.z + 9) + .7, b.z + 9, .1, 1.4, 1.7, '#9B8355', true);
        for (let i = 0; i < 6; i++) {
            const x = b.x + 2 + (i % 3) * 3, z = b.z + 2 + Math.floor(i / 3) * 3, y = height(x, z);
            add('settlement:' + index + ':bush-' + i, 'sphere', x, y + .4, z, 1.1, .8, 1, '#658958');
            for (let j = 0; j < 3; j++)
                add('settlement:' + index + ':plant-' + i + '-' + j, 'cone', x + (j - 1) * .18, y + .7, z, .25, .6, .25, j % 2 ? '#9CB76C' : '#D4AB7A');
        }
    }
}
/** Actual portal apertures retain stable cave entrance coordinates and server range checks. */
export function trapdoorPrimitives(id, p) { const out = []; const add = (name, x, y, z, sx, sy, sz, color) => out.push({ id: 'trapdoor:' + id + ':' + name, shape: 'box', position: { x: p.x + x, y: p.y + y, z: p.z + z }, size: { x: sx, y: sy, z: sz }, color, collision: 'none' }); add('opening', 0, .015, 0, 1.65, .03, 1.8, '#263640'); for (const side of [-1, 1]) {
    add('frame-x' + side, side * .95, .04, 0, .18, .08, 2.1, '#B09865');
    add('frame-z' + side, 0, .04, side * 1, 2.1, .08, .18, '#B09865');
} add('raised-lid', 1.02, .9, 0, .16, 1.8, 1.75, '#856644'); for (let i = 0; i < 3; i++)
    add('ladder-rung-' + i, 0, -.1 - i * .15, .55, .9, .06, .12, '#C3AC77'); return out; }
