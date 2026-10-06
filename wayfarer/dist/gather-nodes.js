import { PROFESSIONS } from './skilling.js';
export const GATHER_NODES = Object.freeze({ woodcutting: { name: 'Willow tree', resource: 'logs', regrowTicks: 800 }, mining: { name: 'Ore seam', resource: 'ore', regrowTicks: 600 }, fishing: { name: 'Fishing pool', resource: 'fish', regrowTicks: 400 } });
export const freshGatherNodes = () => ({ woodcutting: { stock: 3, respawnTick: 0 }, mining: { stock: 3, respawnTick: 0 }, fishing: { stock: 3, respawnTick: 0 } });
export function checkedGatherNodes(value, tick) {
    if (!Number.isSafeInteger(tick) || tick < 0 || !value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).sort().join() !== [...PROFESSIONS].sort().join())
        throw Error('Invalid gathering nodes');
    const result = freshGatherNodes();
    for (const key of PROFESSIONS) {
        const n = value[key];
        if (!n || Object.keys(n).sort().join() !== 'respawnTick,stock' || !Number.isInteger(n.stock) || n.stock < 0 || n.stock > 3 || !Number.isSafeInteger(n.respawnTick) || n.respawnTick < 0 || n.respawnTick > tick + GATHER_NODES[key].regrowTicks || (n.stock > 0 ? n.respawnTick !== 0 : n.respawnTick <= tick))
            throw Error('Invalid gathering node');
        result[key] = { ...n };
    }
    return result;
}
export function regrowNodes(nodes, tick) { let changed = false; for (const key of PROFESSIONS) {
    const node = nodes[key];
    if (node.stock === 0 && tick >= node.respawnTick) {
        node.stock = 3;
        node.respawnTick = 0;
        changed = true;
    }
} return changed; }
export function harvestNode(nodes, profession, tick) { const n = nodes[profession]; if (n.stock <= 0)
    return false; n.stock--; if (n.stock === 0)
    n.respawnTick = tick + GATHER_NODES[profession].regrowTicks; return true; }
