/** Bounded per-address fixed windows using a monotonic clock. */
export class RequestLimits {
  constructor({limit=300,windowMs=60000,maxKeys=4096,now=()=>performance.now()}={}) {
    if(!Number.isSafeInteger(limit)||limit<1||!Number.isSafeInteger(maxKeys)||maxKeys<1||!Number.isFinite(windowMs)||windowMs<=0||typeof now!=='function')throw Error('Invalid request limiter options');
    this.limit=limit;this.windowMs=windowMs;this.maxKeys=maxKeys;this.now=now;this.keys=new Map();
    this.lastNow=-Infinity;
  }
  allow(key) {
    const observed=this.now();
    if(!Number.isFinite(observed))return false;
    const now=this.lastNow=Math.max(this.lastNow,observed); let row=this.keys.get(key);
    if (row && now-row.start>=this.windowMs) {this.keys.delete(key);row=undefined;}
    if (!row) {
      // Insertions are ordered by start time. Stop at the first live window;
      // a saturated table must not scan all keys on every refused address.
      if (this.keys.size>=this.maxKeys) for(const [k,v] of this.keys) {
        if(now-v.start<this.windowMs)break;
        this.keys.delete(k);
      }
      if (this.keys.size>=this.maxKeys) return false;
      row={start:now,count:0};this.keys.set(key,row);
    }
    if(row.count>=this.limit)return false;
    row.count++;return true;
  }
}
export function requestAddress(req,trustProxy=false) {
  const forwarded=req.headers['x-forwarded-for'];
  return trustProxy && typeof forwarded==='string' ? forwarded.split(',').at(-1).trim().slice(0,128) : req.socket.remoteAddress??'unknown';
}
