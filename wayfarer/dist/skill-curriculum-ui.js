import { ALL_SKILLS, SKILL_DIRECTORY } from './skill-directory.js';
import { curriculumFor, trainingEligibility, methodXP } from './skill-curriculum.js';
import { level, xpForLevel } from './progression.js';
/** DOM is a guide only: the server rechecks every start and completion. */
export function initTrainingGuide(start) {
    const choice = document.querySelector('#curriculum-skill'), list = document.querySelector('#curriculum-methods'), summary = document.querySelector('#curriculum-summary');
    let signature = '';
    if (choice) {
        for (const skill of ALL_SKILLS) {
            const option = document.createElement('option');
            option.value = skill;
            option.textContent = SKILL_DIRECTORY[skill].name;
            choice.append(option);
        }
        choice.value = 'woodcutting';
        choice.addEventListener('change', () => { signature = ''; });
    }
    return { update(game, position) {
            if (!choice || !list || !summary)
                return;
            const skill = choice.value;
            if (!ALL_SKILLS.includes(skill))
                return;
            const p = game?.progression, s = game?.skilling, rows = curriculumFor(skill), xp = p && s ? methodXP(p, s, skill) : 0, n = level(xp), next = rows.find(m => m.level > n), busy = !!game?.practiceChallenge, ready = !!game && game.tick >= Math.max(game.practiceReadyTick ?? 0, s?.readyTick ?? 0);
            const near = (target, radius) => !!position && !!target && Math.hypot(position.x - target.x, position.y - target.y, position.z - target.z) <= radius;
            const atCamp = near(game?.camp, 3), atGather = near(game?.beacon.position, 8), healthy = !!game?.fighter?.hp;
            const key = JSON.stringify([skill, xp, s?.bank, s?.pack, s?.toolTier, game?.gatherNodes, busy, ready, atCamp, atGather, healthy]);
            if (key === signature)
                return;
            signature = key;
            summary.textContent = `${SKILL_DIRECTORY[skill].name} ${n}/99 · ${xp.toLocaleString()} XP · ${Math.max(0, xpForLevel(99) - xp).toLocaleString()} XP to 99. ` + (next ? `Next curriculum band: level ${next.level} (${Math.max(0, xpForLevel(next.level) - xp).toLocaleString()} XP away). ` : 'All curriculum bands reached. ') + (rows[0]?.implemented ? 'Choose an unlocked method; bank materials before workshop projects.' : 'These curriculum bands are planned. Use the connected starter activities above, field combat, or the 1-XP drill.');
            list.replaceChildren();
            for (const m of rows) {
                const card = document.createElement('article'), title = document.createElement('strong'), detail = document.createElement('p');
                card.className = 'curriculum-method';
                title.textContent = `Lv ${m.level} · ${m.name}`;
                const eligible = p && s ? trainingEligibility(p, s, m) : 'level', cost = Object.entries(m.costs).map(([k, v]) => `${v} ${k.replaceAll('_', ' ')}`).join(', ');
                detail.textContent = `${m.location} · ${m.implemented ? m.xp + ' XP per completion' : 'Planned — no rewards'}${cost ? ' · Bank cost: ' + cost : ''}. ${m.outcome}`;
                card.append(title, detail);
                if (m.implemented) {
                    const button = document.createElement('button'), gathering = m.kind === 'gathering', node = gathering ? game?.gatherNodes[m.skill] : undefined, full = gathering && s && Object.values(s.pack).reduce((a, b) => a + b, 0) + s.toolTier > 12;
                    const reason = !game ? 'Join realm' : eligible === 'level' ? 'Level locked' : eligible === 'materials' ? 'Need banked materials' : busy ? 'Finish current action' : !healthy ? 'Recover first' : !(gathering ? atGather : atCamp) ? 'Walk to ' + (gathering ? 'far landing' : 'Halden') : !ready ? 'Recovering' : node?.stock === 0 ? 'Node regrowing' : full ? 'Bank your pack' : 'Start · 3 timed actions';
                    button.textContent = reason;
                    button.disabled = reason !== 'Start · 3 timed actions';
                    button.addEventListener('click', () => start(m.id));
                    card.append(button);
                }
                list.append(card);
            }
        } };
}
