import { HARVEST_ITEMS, HARVEST_IDS } from './harvest-content.js';
import { RESOURCES } from './skilling.js';
import { LIFE_ITEMS } from './skill-life.js';
import { ITEMS } from './inventory.js';
export const BANK_ITEMS = Object.freeze([...HARVEST_ITEMS.map(i => ({ id: i.id, name: i.name, category: 'harvest' })), ...RESOURCES.map(id => ({ id, name: id.replaceAll('_', ' '), category: 'resources' })), ...LIFE_ITEMS.map(id => ({ id, name: id, category: 'supplies' })), ...['venom', 'lobsters'].map(id => ({ id, name: id, category: 'cave' })), ...Object.entries(ITEMS).map(([id, item]) => ({ id, name: item.name, category: 'equipment' }))].map(item => Object.freeze(item)));
export const freshBanking = () => ({ order: [], placeholders: [], keepPlaceholders: true, notes: Object.fromEntries(BANK_ITEMS.map(i => [i.id, 0])) });
const valid = (id) => BANK_ITEMS.some(i => i.id === id);
export function checkedBanking(v) { if (!v || typeof v !== 'object' || Array.isArray(v))
    throw Error('Invalid bank'); const b = v; if (Object.keys(b).sort().join() !== 'keepPlaceholders,notes,order,placeholders' || typeof b.keepPlaceholders !== 'boolean' || ![b.order, b.placeholders].every(a => Array.isArray(a) && a.length <= BANK_ITEMS.length && new Set(a).size === a.length && a.every(v => typeof v === 'string' && valid(v))) || b.placeholders.some(id => !b.order.includes(id)) || !b.notes || Object.keys(b.notes).sort().join() !== BANK_ITEMS.map(i => i.id).sort().join() || !Object.values(b.notes).every(n => Number.isSafeInteger(n) && n >= 0 && n <= 1000000) || Object.keys(ITEMS).some(id => b.notes[id] !== 0))
    throw Error('Invalid banking'); return structuredClone(b); }
const kind = (id) => BANK_ITEMS.find(i => i.id === id)?.category;
export function bankCount(p, id) { switch (kind(id)) {
    case 'harvest': return p.harvest.bank[id];
    case 'resources': return p.skilling.bank[id];
    case 'supplies': return p.life.bank[id];
    case 'cave': return id === 'venom' ? p.cave.bankVenom : p.cave.bankLobsters;
    case 'equipment': return Number(p.inventory.stored === id);
    default: throw Error('Unknown bank item');
} }
export function packCount(p, id) { switch (kind(id)) {
    case 'harvest': return p.harvest.pack[id];
    case 'resources': return p.skilling.pack[id];
    case 'supplies': return p.life.pack[id];
    case 'cave': return id === 'venom' ? p.cave.venom : p.cave.lobsters;
    case 'equipment': return p.inventory.slots.filter(v => v === id).length;
    default: throw Error('Unknown pack item');
} }
function setBank(p, id, n) { switch (kind(id)) {
    case 'harvest':
        p.harvest.bank[id] = n;
        break;
    case 'resources':
        p.skilling.bank[id] = n;
        break;
    case 'supplies':
        p.life.bank[id] = n;
        break;
    case 'cave':
        if (id === 'venom')
            p.cave.bankVenom = n;
        else
            p.cave.bankLobsters = n;
        break;
    case 'equipment': p.inventory.stored = n ? id : null;
} }
function setPack(p, id, n) { switch (kind(id)) {
    case 'harvest':
        p.harvest.pack[id] = n;
        break;
    case 'resources':
        p.skilling.pack[id] = n;
        break;
    case 'supplies':
        p.life.pack[id] = n;
        break;
    case 'cave':
        if (id === 'venom')
            p.cave.venom = n;
        else
            p.cave.lobsters = n;
        break;
    case 'equipment': {
        const slot = n ? p.inventory.slots.indexOf(null) : p.inventory.slots.indexOf(id);
        if (slot >= 0)
            p.inventory.slots[slot] = n ? id : null;
    }
} }
export const harvestSlots = (p) => Object.values(p.harvest.pack).reduce((a, b) => a + b, 0) + Object.values(p.banking.notes).filter(n => n > 0).length;
function space(p, id, noted) { if (noted)
    return p.banking.notes[id] > 0 ? 1000000 - p.banking.notes[id] : harvestSlots(p) < 28 ? 1000000 : 0; switch (kind(id)) {
    case 'harvest': return 28 - harvestSlots(p);
    case 'resources': return 12 - Object.values(p.skilling.pack).reduce((a, b) => a + b, 0);
    case 'supplies': return 100 - Object.values(p.life.pack).reduce((a, b) => a + b, 0);
    case 'cave': return 20 - p.cave.venom - p.cave.lobsters;
    case 'equipment': return p.inventory.slots.includes(null) ? 1 : 0;
    default: return 0;
} }
export function syncBank(p) { for (const item of BANK_ITEMS)
    if (bankCount(p, item.id) > 0 && !p.banking.order.includes(item.id))
        p.banking.order.push(item.id); p.banking.placeholders = p.banking.placeholders.filter(id => bankCount(p, id) === 0); p.banking.order = p.banking.order.filter(id => bankCount(p, id) > 0 || p.banking.placeholders.includes(id)); }
export const BANK_RESULTS = { bank_done: 'Bank transfer complete.', bank_empty: 'No matching item is available.', bank_full: 'That transfer would exceed a capacity.', bank_range: 'Bank within three metres of Halden.', bank_busy: 'Finish or cancel your current skill action before banking.', bank_setting: 'Bank layout updated.', bank_material: 'Named harvest converted into workshop material.' };
const quantity = (v, available) => v === 'all' ? available : v === 'all-but-one' ? Math.max(0, available - 1) : Math.min(available, Number(v));
export function isBankCommand(v) { if (typeof v !== 'string' || v.length > 140)
    return false; if (['deposit-all', 'deposit-equipment', 'placeholders-on', 'placeholders-off', 'release-all'].includes(v))
    return true; const [op, id, q, mode, ...extra] = v.split('/'); if (extra.length || !id || !valid(id))
    return false; if (op === 'release')
    return q === undefined; if (op === 'move')
    return !!q && /^(0|[1-9]\d?)$/.test(q) && ['insert', 'swap'].includes(mode); return ['deposit', 'withdraw', 'material'].includes(op) && !!q && (/^[1-9]\d{0,5}$/.test(q) || ['all', 'all-but-one'].includes(q)) && (op === 'withdraw' ? ['item', 'note'].includes(mode) : mode === undefined) && (op !== 'material' || HARVEST_IDS.includes(id)); }
export function bankAction(p, command) {
    if (!isBankCommand(command))
        throw Error('Invalid bank command');
    syncBank(p);
    const b = p.banking;
    if (command === 'placeholders-on' || command === 'placeholders-off') {
        b.keepPlaceholders = command.endsWith('on');
        return 'bank_setting';
    }
    if (command === 'release-all') {
        b.placeholders = [];
        syncBank(p);
        return 'bank_setting';
    }
    if (command === 'deposit-equipment') {
        const id = p.inventory.weapon;
        if (!id)
            return 'bank_empty';
        if (p.inventory.stored)
            return 'bank_full';
        p.inventory.stored = id;
        p.inventory.weapon = null;
        p.cave.coatingWeapon = null;
        p.cave.coatingUntil = 0;
        syncBank(p);
        return 'bank_done';
    }
    if (command === 'deposit-all') {
        if (BANK_ITEMS.some(i => bankCount(p, i.id) + packCount(p, i.id) + b.notes[i.id] > 1000000))
            return 'bank_full';
        for (const item of BANK_ITEMS) {
            const id = item.id, n = packCount(p, id) + b.notes[id];
            if (n) {
                setBank(p, id, bankCount(p, id) + n);
                setPack(p, id, 0);
                b.notes[id] = 0;
            }
        }
        syncBank(p);
        return 'bank_done';
    }
    const [op, id0, q, mode] = command.split('/'), id = id0;
    if (op === 'release') {
        if (bankCount(p, id) !== 0)
            return 'bank_empty';
        b.placeholders = b.placeholders.filter(v => v !== id);
        syncBank(p);
        return 'bank_setting';
    }
    if (op === 'move') {
        const a = b.order.indexOf(id), to = Number(q);
        if (a < 0 || to >= b.order.length)
            return 'bank_empty';
        if (mode === 'swap')
            [b.order[a], b.order[to]] = [b.order[to], b.order[a]];
        else {
            b.order.splice(a, 1);
            b.order.splice(to, 0, id);
        }
        return 'bank_setting';
    }
    if (op === 'material') {
        const n = quantity(q, bankCount(p, id));
        if (!n)
            return 'bank_empty';
        const item = HARVEST_ITEMS.find(i => i.id === id), target = { woodcutting: 'logs', mining: 'ore', fishing: 'fish' }[item.skill];
        if (p.skilling.bank[target] + n > 1000000)
            return 'bank_full';
        setBank(p, id, bankCount(p, id) - n);
        p.skilling.bank[target] += n;
        if (bankCount(p, id) === 0 && b.keepPlaceholders && !b.placeholders.includes(id))
            b.placeholders.push(id);
        syncBank(p);
        return 'bank_material';
    }
    if (op === 'deposit') {
        const n = quantity(q, packCount(p, id) + b.notes[id]);
        if (!n)
            return 'bank_empty';
        if (bankCount(p, id) + n > 1000000)
            return 'bank_full';
        const notes = Math.min(n, b.notes[id]);
        b.notes[id] -= notes;
        setPack(p, id, packCount(p, id) - (n - notes));
        setBank(p, id, bankCount(p, id) + n);
        syncBank(p);
        return 'bank_done';
    }
    const noted = mode === 'note';
    if (noted && kind(id) === 'equipment')
        return 'bank_empty';
    const n = Math.min(quantity(q, bankCount(p, id)), space(p, id, noted));
    if (!n)
        return bankCount(p, id) ? 'bank_full' : 'bank_empty';
    setBank(p, id, bankCount(p, id) - n);
    if (noted)
        b.notes[id] += n;
    else
        setPack(p, id, packCount(p, id) + n);
    if (bankCount(p, id) === 0 && b.keepPlaceholders && !b.placeholders.includes(id))
        b.placeholders.push(id);
    syncBank(p);
    return 'bank_done';
}
export function bankView(p) { syncBank(p); return { slots: harvestSlots(p), rows: p.banking.order.map(id => ({ id, name: BANK_ITEMS.find(i => i.id === id).name, count: bankCount(p, id), pack: packCount(p, id), notes: p.banking.notes[id], placeholder: p.banking.placeholders.includes(id) })) }; }
