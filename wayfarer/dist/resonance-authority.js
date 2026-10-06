import { STEP_MS } from './fixed-clock.js';
import { RESONANCE_BINDINGS, RESONANCE_COOLDOWN_MS, decodeResonanceCast, isResonanceEffectId, isResonanceNodeId, resonanceEffect } from './resonance-codex.js';
export const RESONANCE_COOLDOWN_TICKS = Math.ceil(RESONANCE_COOLDOWN_MS / STEP_MS);
export const RESONANCE_MAX_CASTS = 1_000_000;
const integer = (value, max = Number.MAX_SAFE_INTEGER) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= max;
export const freshResonanceState = () => ({ readyTick: 0, activeEffect: null, activeUntilTick: 0, lastChord: [], casts: 0, mastered: [] });
function checkedMastery(value, casts) { if (!Array.isArray(value) || value.length > 6 || value.length > casts || new Set(value).size !== value.length || !value.every(isResonanceEffectId))
    throw Error('Invalid resonance mastery'); return [...value]; }
export function checkedPersistentResonance(value, legacy = false) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        throw Error('Invalid resonance persistence');
    const r = value, keys = Object.keys(r).sort().join();
    if (!(keys === 'casts,cooldownTicks,mastered' || legacy && keys === 'casts,cooldownTicks') || !integer(r.cooldownTicks, RESONANCE_COOLDOWN_TICKS) || !integer(r.casts, RESONANCE_MAX_CASTS))
        throw Error('Invalid resonance persistence');
    return { cooldownTicks: r.cooldownTicks, casts: r.casts, mastered: checkedMastery(r.mastered ?? [], r.casts) };
}
export function checkedResonanceState(value, tick) {
    if (!integer(tick))
        throw Error('Invalid resonance tick');
    if (!value || typeof value !== 'object' || Array.isArray(value))
        throw Error('Invalid resonance state');
    const r = value;
    if (Object.keys(r).sort().join() !== 'activeEffect,activeUntilTick,casts,lastChord,mastered,readyTick' || !integer(r.readyTick) || !integer(r.activeUntilTick) || !integer(r.casts, RESONANCE_MAX_CASTS) || !(r.activeEffect === null || isResonanceEffectId(r.activeEffect)) || !Array.isArray(r.lastChord) || ![0, 3].includes(r.lastChord.length) || !r.lastChord.every(isResonanceNodeId) || new Set(r.lastChord).size !== r.lastChord.length)
        throw Error('Invalid resonance state');
    const effect = r.activeEffect, until = r.activeUntilTick, ready = r.readyTick;
    if (ready > tick + RESONANCE_COOLDOWN_TICKS)
        throw Error('Invalid resonance cooldown');
    if (effect === null ? (until !== 0) : (until <= tick || until > tick + Math.ceil(resonanceEffect(effect).durationMs / STEP_MS)))
        throw Error('Invalid resonance duration');
    if (effect !== null && (r.lastChord.length !== 3 || decodeResonanceCast(r.lastChord.join('+')).effect.id !== effect))
        throw Error('Resonance chord/effect mismatch');
    return { readyTick: ready, activeEffect: effect, activeUntilTick: until, lastChord: [...r.lastChord], casts: r.casts, mastered: checkedMastery(r.mastered, r.casts) };
}
export function restoreResonance(saved, tick) { const p = checkedPersistentResonance(saved); if (!integer(tick) || tick > Number.MAX_SAFE_INTEGER - RESONANCE_COOLDOWN_TICKS)
    throw Error('Invalid resonance restore tick'); return { readyTick: tick + p.cooldownTicks, activeEffect: null, activeUntilTick: 0, lastChord: [], casts: p.casts, mastered: [...p.mastered] }; }
export function persistResonance(state, tick) { const current = checkedResonanceState(state, tick); return checkedPersistentResonance({ cooldownTicks: Math.max(0, current.readyTick - tick), casts: current.casts, mastered: current.mastered }); }
export function expireResonance(state, tick) { checkedResonanceState(state, Math.max(0, tick - 1)); if (state.activeEffect !== null && tick >= state.activeUntilTick) {
    state.activeEffect = null;
    state.activeUntilTick = 0;
    return true;
} return false; }
export function castResonance(state, value, tick) { checkedResonanceState(state, tick); if (tick < state.readyTick)
    return { ok: false, reason: 'cooldown' }; if (state.casts >= RESONANCE_MAX_CASTS)
    return { ok: false, reason: 'cap' }; if (tick > Number.MAX_SAFE_INTEGER - RESONANCE_COOLDOWN_TICKS)
    throw Error('Resonance clock exhausted'); const chord = decodeResonanceCast(value), durationTicks = Math.ceil(chord.effect.durationMs / STEP_MS); state.readyTick = tick + RESONANCE_COOLDOWN_TICKS; state.activeEffect = chord.effect.id; state.activeUntilTick = tick + durationTicks; state.lastChord = [...chord.nodes]; state.casts++; return { ok: true, chord, durationTicks }; }
export function consumeResonance(state, effect, tick) { checkedResonanceState(state, tick); if (state.activeEffect !== effect)
    return false; if (!state.mastered.includes(effect))
    state.mastered.push(effect); state.activeEffect = null; state.activeUntilTick = 0; return true; }
export const resonanceEffectForSkill = (skill) => Object.keys(RESONANCE_BINDINGS).find(id => RESONANCE_BINDINGS[id].skill === skill);
export const resonanceBonus = (effect) => RESONANCE_BINDINGS[effect].bonusXp;
