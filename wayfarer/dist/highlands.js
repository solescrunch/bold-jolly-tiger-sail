export const HIGHLAND_STORIES = Object.freeze([
    { id: 'yak-knoll', name: 'Yak Knoll', note: 'The herd wears yesterday’s rain in its shaggy coats. A bronze bell rings only when the wind turns.' },
    { id: 'panda-grove', name: 'Panda Grove', note: 'Bamboo rustles beside a mossy tea stone. Someone has left a tiny cup for the quietest visitor.' },
    { id: 'gull-watch', name: 'Gull Watch', note: 'White wings circle the old lookout. Sailors once read the river bends here like lines on a palm.' },
    { id: 'star-stones', name: 'The Listening Stones', note: 'Four broken pillars frame the sky. Their maker carved a star for every traveller who found a way home.' },
]);
/** Ground and route checks keep the initial trail on existing authoritative terrain. */
export function highlandTrail(nav, start, goal) {
    const anchors = [{ x: start.x, z: start.z - 12 }, { x: start.x + 12, z: start.z + 12 }, { x: goal.x - 12, z: goal.z - 12 }, { x: goal.x, z: goal.z + 12 }];
    return anchors.flatMap((anchor, i) => {
        for (const offset of [0, -2, 2]) {
            const checked = nav.check({ x: anchor.x + offset, z: anchor.z });
            if (!checked.ok)
                continue;
            if (nav.findPath(start, checked.position, 2048).status !== 'found')
                continue;
            return [{ ...HIGHLAND_STORIES[i], position: { ...checked.position } }];
        }
        return [];
    });
}
/** Device-local cosmetic scrapbook: it owns no XP, items or account identity. */
export class HighlandJournal {
    seen = new Set();
    restore(raw) { this.seen.clear(); if (!raw || raw.length > 512)
        return; try {
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length <= 4 && list.every(id => typeof id === 'string' && HIGHLAND_STORIES.some(s => s.id === id)))
            for (const id of list)
                this.seen.add(id);
    }
    catch { } }
    serialize() { return JSON.stringify([...this.seen].sort()); }
    get count() { return this.seen.size; }
    has(id) { return this.seen.has(id); }
    observe(position, stops) {
        if (!position || ![position.x, position.y, position.z].every(Number.isFinite))
            return;
        const stop = stops.find(s => !this.has(s.id) && Math.hypot(position.x - s.position.x, position.y - s.position.y, position.z - s.position.z) <= 2.5);
        if (stop)
            this.seen.add(stop.id);
        return stop;
    }
    get title() { return this.count === 4 ? 'Starlit Wayfarer' : 'Highland Wanderer'; }
}
export function highlandWildlife(stops, nav) {
    const species = { 'yak-knoll': 'yak', 'panda-grove': 'panda', 'gull-watch': 'gull' };
    return stops.flatMap((stop, i) => {
        const kind = species[stop.id];
        if (!kind)
            return [];
        const checked = [{ x: 1.1, z: .5 }, { x: -1.1, z: .5 }, { x: 0, z: -.6 }, { x: 0, z: 0 }].map(offset => nav.check({ x: stop.position.x + offset.x, z: stop.position.z + offset.z })).find(point => point.ok);
        if (!checked?.ok)
            return [];
        return [{ id: 'wildlife:highlands:' + kind, species: kind, position: { ...checked.position }, phase: i * 1.7, attackable: false, collidable: false, drops: false }];
    });
}
