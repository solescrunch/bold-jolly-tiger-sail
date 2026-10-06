import { LIFE_ITEMS, LIFE_RECIPES, lifeRecipe, recipeReady, nearLife, lifeBusy, prayerCapacity } from './skill-life.js';
/** Progressive starter loops with real server state; this UI never invents quantities or rewards. */
export function initSkillLife(send, walk) {
    const choice = document.querySelector('#life-job'), status = document.querySelector('#life-status'), detail = document.querySelector('#life-detail'), supplies = document.querySelector('#life-supplies'), start = document.querySelector('#life-start'), route = document.querySelector('#life-route'), meter = document.querySelector('#life-progress');
    const targetChoice = document.querySelector('#life-combat-target');
    let current, position;
    if (choice) {
        for (const r of LIFE_RECIPES) {
            const o = document.createElement('option');
            o.value = r.id;
            o.textContent = `${r.skill[0].toUpperCase() + r.skill.slice(1)} · ${r.name}`;
            choice.append(o);
        }
        choice.value = 'track';
        choice.addEventListener('change', () => update(current, position));
    }
    start?.addEventListener('click', () => { if (choice)
        send(choice.value); });
    route?.addEventListener('click', () => { if (!current)
        return; const r = lifeRecipe(choice?.value ?? ''); walk(current.life?.course?.step === 0 ? current.beacon.position : r?.location === 'far' && !current.life?.course ? current.beacon.position : current.camp); });
    for (const b of document.querySelectorAll('[data-life]'))
        b.addEventListener('click', () => send(b.dataset.life));
    for (const b of document.querySelectorAll('[data-life-attack]'))
        b.addEventListener('click', () => send(`${b.dataset.lifeAttack}-${targetChoice?.value ?? 'warden'}`));
    const withdraw = document.querySelector('#life-withdraw-item');
    if (withdraw)
        for (const item of LIFE_ITEMS) {
            const o = document.createElement('option');
            o.value = item;
            o.textContent = item;
            withdraw.append(o);
        }
    document.querySelector('#life-withdraw')?.addEventListener('click', () => { if (withdraw)
        send('withdraw-' + withdraw.value); });
    function update(game, pos) {
        current = game;
        position = pos;
        const l = game?.life, p = game?.progression, s = game?.skilling, r = lifeRecipe(choice?.value ?? ''), healthy = !!game?.fighter?.hp, busy = !!l && lifeBusy(l) || !!game?.practiceChallenge || !!game?.cave?.activity;
        if (detail && r) {
            const cost = [...Object.entries(r.resources).map(([k, n]) => `${n} banked ${k.replaceAll('_', ' ')}`), ...Object.entries(r.supplies).map(([k, n]) => `${n} carried ${k}`)].join(', ') || 'No materials';
            detail.textContent = `${r.description} ${r.seconds}s · ${r.xp} ${r.skill} XP${r.xp === 0 ? ' (Farming XP on harvest)' : ''} · ${cost}. Site: ${r.location === 'camp' ? 'Halden' : 'far landing'}.`;
        }
        const target = r?.location === 'far' ? game?.beacon.position : game?.camp, atSite = !!target && nearLife(pos, target, r?.location === 'far' ? 8 : 3), reason = game && l && p && s && game.fighter && game.cave && r ? recipeReady({ life: l, progression: p, skilling: s, fighter: game.fighter, cave: game.cave }, r) : undefined;
        if (start) {
            start.disabled = !game || !healthy || busy || !atSite || !!reason;
            start.textContent = !game ? 'Join to start' : busy ? 'Finish current action' : !atSite ? 'Walk to site' : reason === 'life_materials' ? 'Need listed materials' : reason === 'life_growing' ? 'Herbs growing / ready' : reason === 'life_full' ? 'Bank supplies' : 'Start skill action';
        }
        if (route)
            route.disabled = !game;
        if (status)
            status.textContent = l && p ? `${l.job ? `${lifeRecipe(l.job.id)?.name} · ${Math.max(0, (l.job.finishTick - game.tick) / 20).toFixed(1)}s left` : l.course ? `Agility: ${l.course.step === 0 ? 'reach the far beacon' : 'return to Halden'} · ${Math.max(0, (l.course.expiresTick - game.tick) / 20).toFixed(0)}s left` : 'Ready for your next skill action'} · Herb bed: ${l.cropReady ? 'ready to harvest' : l.cropTicks ? `${(l.cropTicks / 20).toFixed(1)}s growing` : 'empty'} · Prayer ${l.prayerPoints}/${prayerCapacity(p)} ${l.ward ? '(protection active)' : ''} · Slayer ${l.taskRemaining ? `${l.taskRemaining} scorpions remaining` : 'no active task'} · Repairs ${l.repairs}${l.hearthUntil > game.tick ? ' · Hearth warm' : ''}` : 'Join to begin connected skilling.';
        if (meter) {
            meter.hidden = !l?.job;
            meter.max = l?.job ? l.job.finishTick - l.job.startedTick : 1;
            meter.value = l?.job ? game.tick - l.job.startedTick : 0;
        }
        if (supplies)
            supplies.textContent = l ? `Skill pouch ${Object.values(l.pack).reduce((a, b) => a + b, 0)}/100 · ${LIFE_ITEMS.map(k => `${k} ${l.pack[k]} (bank ${l.bank[k]})`).join(' · ')}` : 'Skill supplies appear here and in Backpack.';
        const packSummary = document.querySelector('#life-pack-summary');
        if (packSummary)
            packSummary.textContent = supplies?.textContent ?? '';
        for (const b of document.querySelectorAll('[data-life]')) {
            const cmd = b.dataset.life, atCamp = !!game && nearLife(pos, game.camp);
            b.disabled = !game || !l || !healthy || (busy && !['cancel', 'checkpoint', 'ward-off'].includes(cmd)) || (['harvest', 'agility', 'task', 'deposit'].includes(cmd) && !atCamp) || (cmd === 'harvest' && !l?.cropReady) || (cmd === 'checkpoint' && !l?.course) || (cmd === 'ward-on' && (!l?.prayerPoints || !!l?.ward)) || (cmd === 'ward-off' && !l?.ward);
        }
        for (const b of document.querySelectorAll('[data-life-attack]')) {
            const ammo = b.dataset.lifeAttack === 'shoot' ? 'arrows' : 'runes';
            b.disabled = !healthy || busy || !l?.pack[ammo];
        }
        const button = document.querySelector('#life-withdraw');
        if (button)
            button.disabled = !game || !game.life || busy || !nearLife(pos, game.camp) || !game.life.bank[withdraw?.value];
    }
    return { update };
}
