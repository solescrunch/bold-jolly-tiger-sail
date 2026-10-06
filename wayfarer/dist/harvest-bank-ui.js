import { HARVEST_ITEMS, harvestItem } from './harvest-content.js';
import { BANK_ITEMS, bankView } from './realm-bank.js';
import { level } from './progression.js';
export function initHarvestBank(doc, send, route) {
    const choice = doc.querySelector('#harvest-choice'), go = doc.querySelector('#harvest-route'), gather = doc.querySelector('#harvest-start'), cancel = doc.querySelector('#harvest-cancel'), note = doc.querySelector('#harvest-note'), bankList = doc.querySelector('#realm-bank-list'), search = doc.querySelector('#bank-search'), qty = doc.querySelector('#bank-quantity'), custom = doc.querySelector('#bank-x'), noted = doc.querySelector('#bank-notes'), bankNote = doc.querySelector('#realm-bank-note');
    let current, position, signature = '';
    const listeners = new AbortController();
    const on = (e, event, callback) => e?.addEventListener(event, callback, { signal: listeners.signal });
    if (choice) {
        for (const item of HARVEST_ITEMS) {
            const option = doc.createElement('option');
            option.value = item.id;
            option.textContent = `${item.name} · ${item.skill} ${item.level}`;
            choice.append(option);
        }
        on(choice, 'change', () => { signature = ''; });
    }
    const amount = () => qty?.value === 'x' ? String(Math.max(1, Math.min(999999, Math.floor(Number(custom?.value) || 1)))) : qty?.value ?? '1';
    on(go, 'click', () => { const site = current?.harvestSites.find(s => s.id === choice?.value); if (site)
        route(site.position); });
    on(gather, 'click', () => { if (choice)
        send('harvest', choice.value); });
    on(cancel, 'click', () => send('harvest', 'cancel'));
    for (const cmd of ['deposit-all', 'deposit-equipment', 'release-all'])
        on(doc.querySelector('[data-bank="' + cmd + '"]'), 'click', () => send('bank', cmd));
    const keep = doc.querySelector('#bank-placeholders');
    on(keep, 'change', () => send('bank', keep?.checked ? 'placeholders-on' : 'placeholders-off'));
    for (const element of [search, qty, custom, noted])
        on(element, 'input', () => { signature = ''; });
    const near = (p, r) => !!position && !!p && Math.hypot(position.x - p.x, position.y - p.y, position.z - p.z) <= r;
    return { update(game, where) {
            current = game;
            position = where;
            const item = harvestItem(choice?.value), site = game?.harvestSites.find(s => s.id === item?.id), busy = !!(game?.harvest?.activity || game?.practiceChallenge || game?.life?.job || game?.life?.course || game?.cave?.activity), atBank = near(game?.camp, 3), healthy = !!game?.fighter?.hp;
            if (go)
                go.disabled = !site || !position;
            if (cancel)
                cancel.disabled = !game?.harvest?.activity;
            if (gather)
                gather.disabled = !item || !game?.skilling || level(game.skilling.xp[item.skill]) < item.level || !near(site?.position, 2.5) || busy || !healthy || !game.harvestWorld[item.id].stock;
            if (note)
                note.textContent = !item ? 'Choose a harvest.' : `${item.name}: ${item.skill} level ${item.level}, ${item.xp} XP. ` + (game?.harvest?.activity ? 'Harvest in progress — remain nearby.' : gather?.disabled ? 'Find this resource; unlock its level and wait for stock.' : 'Ready to harvest.');
            for (const button of Array.from(doc.querySelectorAll('[data-bank]')))
                button.disabled = !atBank || busy || !healthy;
            if (keep) {
                keep.disabled = !atBank || busy || !healthy;
                keep.checked = game?.banking?.keepPlaceholders ?? true;
            }
            if (!bankList || !game?.harvest || !game.banking || !game.skilling || !game.life || !game.cave || !game.inventory) {
                if (bankNote)
                    bankNote.textContent = 'Join and visit Halden to use your bank.';
                return;
            }
            const player = { harvest: game.harvest, banking: structuredClone(game.banking), skilling: game.skilling, life: game.life, cave: game.cave, inventory: game.inventory }, view = bankView(player), key = JSON.stringify([view, search?.value, amount(), noted?.checked, atBank, busy, healthy]);
            if (signature === key)
                return;
            signature = key;
            if (bankNote)
                bankNote.textContent = `Harvest backpack ${view.slots}/28 slots. ` + (atBank ? 'Bank open.' : 'Move within 3m of Halden. ') + `Resources ${Object.values(game.skilling.pack).reduce((a, b) => a + b, 0)}/12 · Supplies ${Object.values(game.life.pack).reduce((a, b) => a + b, 0)}/100 · Cave pouch ${game.cave.venom + game.cave.lobsters}/20. Notes must be banked before use.`;
            bankList.replaceChildren();
            const ids = [...game.banking.order, ...BANK_ITEMS.filter(i => !game.banking.order.includes(i.id)).map(i => i.id)], term = (search?.value ?? '').toLowerCase();
            for (const id of ids) {
                const entry = BANK_ITEMS.find(i => i.id === id), row = view.rows.find(r => r.id === id), pack = entry.category === 'harvest' ? game.harvest.pack[id] : entry.category === 'resources' ? game.skilling.pack[id] : entry.category === 'supplies' ? game.life.pack[id] : entry.category === 'cave' ? id === 'venom' ? game.cave.venom : game.cave.lobsters : game.inventory.slots.filter(v => v === id).length, notes = game.banking.notes[id] ?? 0;
                if (!(row || pack || notes) || !entry.name.toLowerCase().includes(term))
                    continue;
                const card = doc.createElement('article'), text = doc.createElement('p');
                card.className = 'bank-row';
                text.textContent = `${entry.name} · Bank ${row?.count ?? 0}${row?.placeholder ? ' (placeholder)' : ''} · Pack ${pack} · Notes ${notes}`;
                card.append(text);
                const button = (label, command, disabled = false) => { const b = doc.createElement('button'); b.textContent = label; b.disabled = !atBank || busy || !healthy || disabled; b.addEventListener('click', () => send('bank', command)); card.append(b); };
                button('Deposit ' + amount(), 'deposit/' + id + '/' + amount(), pack + notes === 0);
                button('Withdraw ' + amount(), 'withdraw/' + id + '/' + amount() + '/' + (noted?.checked ? 'note' : 'item'), !row?.count);
                if (entry.category === 'harvest')
                    button('Workshop material', 'material/' + id + '/' + amount(), !row?.count);
                if (row?.placeholder)
                    button('Release placeholder', 'release/' + id);
                const index = game.banking.order.indexOf(id);
                if (index > 0)
                    button('Move earlier', 'move/' + id + '/' + (index - 1) + '/insert');
                bankList.append(card);
            }
        }, dispose() { listeners.abort(); bankList?.replaceChildren(); } };
}
