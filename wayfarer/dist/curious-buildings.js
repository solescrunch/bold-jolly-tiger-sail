/** Three original, deterministic rooms with distinct XZ footprints; no stacked floor ambiguity. */
export function addCuriousBuildings(plan) {
    const buildings = [];
    const specs = [{ id: 'crooked-star', name: 'The Crooked Star Observatory', kind: 'observatory', x: plan.start.x + 3, sign: 1, base: plan.start.y, rise: 3, note: 'An off-centre telescope points at a star that never appears on the old charts.' }, { id: 'mushroom-clock', name: 'The Clockwork Mushroom Lodge', kind: 'mushroom', x: plan.start.x + 3, sign: -1, base: plan.start.y, rise: 2.5, note: 'Tiny brass gears tick beneath a mushroom roof. A chair is set for someone very small.' }, { id: 'sunken-lantern', name: 'The Sunken Lantern Archive', kind: 'archive', x: plan.goal.x - 3, sign: -1, base: plan.goal.y, rise: -3, note: 'Below the soil, amber lanterns guard shelves of maps to places whose names have been erased.' }];
    for (const s of specs) {
        const x = Math.round(s.x), sign = s.sign, y = s.base, roomY = y + s.rise, roof = [];
        const surface = (id, from, to, startY, endY) => { const z0 = sign * from, z1 = sign * to; const value = { id: 'building:' + s.id + ':' + id, bounds: { minX: x - 2, maxX: x + 2, minZ: Math.min(z0, z1), maxZ: Math.max(z0, z1) }, axis: 'z', startY: sign > 0 ? startY : endY, endY: sign > 0 ? endY : startY, thickness: .25, color: s.kind === 'archive' ? '#596879' : '#826647', overrideTerrain: true }; plan.surfaces.push(value); };
        surface('approach', 8, 18, y, y);
        surface('stairs', 18, 26, y, roomY);
        surface('room', 26, 34, roomY, roomY);
        const primitive = (part, shape, px, py, pz, sx, sy, sz, color, solid = false, roofPart = false) => { const p = { id: 'building:' + s.id + ':' + part, shape, position: { x: px, y: py, z: pz }, size: { x: sx, y: sy, z: sz }, color, collision: solid ? 'solid' : 'none' }; if (roofPart)
            roof.push(p);
        else
            plan.primitives.push(p); };
        // Guard both stair edges; raised ceilings leave a full standing-height corridor.
        for (const side of [-1, 1]) {
            for (let i = 0; i < 5; i++)
                primitive('stair-post-' + side + '-' + i, 'box', x + side * 2.1, y + s.rise * i / 4 + .65, sign * (18 + i * 2), .12, 1.3, .12, '#B28B55');
            for (const [part, z, length] of [['front', 27.25, 2.5], ['back', 31.75, 4.5]])
                primitive('room-wall-' + side + '-' + part, 'box', x + side * 2.12, roomY + 1.7, sign * z, .2, 3.4, length, '#57637B', true);
            primitive('window-sill-' + side, 'box', x + side * 2.12, roomY + .75, sign * 29, .2, 1.5, 1, '#57637B', true);
            primitive('window-lintel-' + side, 'box', x + side * 2.12, roomY + 2.95, sign * 29, .2, .9, 1, '#57637B', true);
        }
        // Non-solid window frames, masonry seams and a hand-painted doorway marker.
        for (const side of [-1, 1]) {
            primitive('window-glass-' + side, 'box', x + side * 2.235, roomY + 1.95, sign * 29, .025, .8, .8, '#6DABB8');
            for (const dz of [-.48, .48])
                primitive('window-frame-' + side + '-' + dz, 'box', x + side * 2.25, roomY + 1.95, sign * 29 + dz, .06, 1, .08, '#D4B47B');
            for (let row = 0; row < 3; row++)
                primitive('masonry-' + side + '-' + row, 'box', x + side * 2.235, roomY + .35 + row * .55, sign * 32, .025, .035, 3.5, '#87909A');
        }
        primitive('door-sign', 'box', x + 1.25, roomY + 2.6, sign * 25.75, .55, .3, .07, s.kind === 'mushroom' ? '#D9A088' : '#D9BD70');
        for (const side of [-1, 1]) {
            primitive('corner-pillar-' + side, 'box', x + side * 2.1, roomY + 1.8, sign * 34, .35, 3.6, .35, '#B1A58E');
            primitive('eave-' + side, 'box', x + side * 2.25, roomY + 3.35, sign * 30, .3, .22, 8.8, '#B89454');
        }
        primitive('threshold', 'box', x, roomY + .015, sign * 26, 3.5, .03, .45, '#D7BC83');
        primitive('rear-wall', 'box', x, roomY + 1.7, sign * 34.12, 4.4, 3.4, .2, '#57637B', true);
        // Visual treads sit above a continuous server slope for comfortable walking.
        for (let i = 0; i < 24; i++) {
            const t = (i + .5) / 24, z = sign * (18 + t * 8), top = y + s.rise * t;
            primitive('tread-' + i, 'box', x, top + .015, z, 4, .03, 8 / 24, '#AD9666');
            primitive('riser-' + i, 'box', x, top - Math.abs(s.rise) / 48, sign * (18 + i * 8 / 24), 4, Math.abs(s.rise) / 24, .045, '#7E6A4F');
            primitive('nosing-' + i, 'box', x, top + .035, sign * (18 + i * 8 / 24), 4, .035, .065, '#D7BC83');
        }
        for (const side of [-1, 1])
            primitive('door-post-' + side, 'box', x + side * 1.85, roomY + 1.4, sign * 26, .25, 2.8, .3, '#B89454');
        primitive('door-arch', 'box', x, roomY + 2.95, sign * 26, 4.2, .25, .4, '#B89454');
        primitive('desk', 'box', x - .85, roomY + .5, sign * 31, .9, 1, .7, '#74503A', true);
        primitive('seat', 'box', x + 1, roomY + .3, sign * 32, .5, .6, .5, '#866346', true);
        primitive('lamp', 'sphere', x + 1.7, roomY + 2.2, sign * 30, .3, .45, .3, '#EBC877');
        if (s.kind === 'observatory') {
            primitive('roof', 'cone', x + .7, roomY + 4.3, sign * 30, 6, 2.2, 9, '#334A83', false, true);
            primitive('telescope', 'box', x - .8, roomY + 1.2, sign * 31, .3, .35, 1.3, '#D0AA62');
            primitive('star', 'sphere', x + .7, roomY + 5.6, sign * 30, .5, .5, .5, '#F0CF73');
        }
        else if (s.kind === 'mushroom') {
            primitive('cap', 'sphere', x, roomY + 3.8, sign * 30, 6.5, 2, 10, '#8F4D6C', false, true);
            for (let i = 0; i < 5; i++)
                primitive('cap-spot-' + i, 'sphere', x - 1.6 + i * .8, roomY + 4.6, sign * (28 + i * .7), .5, .15, .7, '#E6C7A2', false, true);
            primitive('gear', 'sphere', x - .8, roomY + 1.2, sign * 31, .5, .5, .18, '#C4A067');
        }
        else {
            primitive('vault', 'box', x, roomY + 3.6, sign * 30, 4.6, .3, 8.6, '#454D63', false, true);
            for (let i = 0; i < 3; i++)
                primitive('shelf-' + i, 'box', x - 1.6, roomY + .5 + i * .65, sign * 32, .3, .12, 1.5, '#B99561');
        }
        const b = { minX: x - 2.2, maxX: x + 2.2, minZ: Math.min(sign * 18, sign * 34.3), maxZ: Math.max(sign * 18, sign * 34.3) };
        buildings.push({ id: s.id, name: s.name, kind: s.kind, entrance: { x, y, z: sign * 10 }, room: { x, y: roomY, z: sign * 29 }, bounds: b, roof, note: s.note });
    }
    plan.bounds = { ...plan.bounds, minZ: -40, maxZ: 40 };
    return buildings;
}
export function nearbyBuilding(position, buildings) { return position && buildings.find(b => position.x >= b.bounds.minX && position.x <= b.bounds.maxX && position.z >= b.bounds.minZ && position.z <= b.bounds.maxZ && Math.abs(position.y - b.room.y) <= Math.abs(b.room.y - b.entrance.y) + 2); }
