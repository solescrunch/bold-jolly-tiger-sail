/** Client steering only: the server still owns collision, speed and position. */
export class ClickWalk {
    navigation;
    points = [];
    lastPlan = -Infinity;
    progressAt = 0;
    anchor = { x: 0, z: 0 };
    constructor(navigation) {
        this.navigation = navigation;
    }
    get active() { return this.points.length > 0; }
    cancel() { this.points = []; }
    plan(start, goal, now) {
        if (![start.x, start.z, goal.x, goal.z, now].every(Number.isFinite))
            return false;
        if (now - this.lastPlan < 250)
            return false;
        this.lastPlan = now;
        this.cancel();
        const result = this.navigation.findPath(start, goal, 2048);
        if (result.status !== 'found' || result.points.length > 2049)
            return false;
        this.points = result.points.slice(1).map(p => ({ x: p.x, z: p.z }));
        this.anchor = { ...start };
        this.progressAt = now;
        return this.active;
    }
    direction(position, now) {
        const zero = { dx: 0, dz: 0 };
        if (!this.active)
            return zero;
        if (![position.x, position.z, now].every(Number.isFinite) || now < this.progressAt) {
            this.cancel();
            return zero;
        }
        if (Math.hypot(position.x - this.anchor.x, position.z - this.anchor.z) > .1) {
            this.anchor = { ...position };
            this.progressAt = now;
        }
        if (now - this.progressAt > 2000) {
            this.cancel();
            return zero;
        }
        while (this.points.length && Math.hypot(this.points[0].x - position.x, this.points[0].z - position.z) < .22)
            this.points.shift();
        const goal = this.points[0];
        if (!goal)
            return zero;
        if (!this.navigation.traverse(position, goal).ok) {
            this.cancel();
            return zero;
        }
        const dx = goal.x - position.x, dz = goal.z - position.z, length = Math.hypot(dx, dz);
        // Slow the approach to avoid overshoot at the fastest supported travel speed.
        const divisor = Math.max(length, .65);
        return { dx: dx / divisor, dz: dz / divisor };
    }
}
/** Reject camera drags, long presses and multi-touch as movement taps. */
export class WalkTap {
    press;
    blocked = false;
    down(id, x, y, at) { if (this.press) {
        this.blocked = true;
        return;
    } this.press = { id, x, y, at }; }
    move(id, x, y) { const p = this.press; if (p && p.id === id && Math.hypot(x - p.x, y - p.y) > 8)
        this.blocked = true; }
    up(id, x, y, at) { const p = this.press; const ok = !!p && p.id === id && !this.blocked && at >= p.at && at - p.at <= 500 && Math.hypot(x - p.x, y - p.y) <= 8; this.cancel(); return ok; }
    cancel() { this.press = undefined; this.blocked = false; }
}
