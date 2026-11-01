// The rules a game state must always keep, checked by every bot and sampler.
const BAD_TEXT = /undefined|NaN|\[object|Infinity|null\b/;
function problems(s, E) {
  const out = []; const scan = (o, p) => { if (typeof o === 'number') { if (Number.isNaN(o) || o === -Infinity) out.push('broken number at ' + p); } else if (o && typeof o === 'object') for (const k in o) scan(o[k], p + '.' + k); };
  scan(s, 's');
  for (const k in s.mats) if (s.mats[k] < -1e-9) out.push(`negative ${k}: ${s.mats[k]}`);
  for (const k of ['hooks', 'line', 'arrows', 'firewood', 'slingAmmo', 'potWater', 'snares', 'deadfalls', 'containers']) if (s[k] < -1e-9) out.push(`negative ${k}: ${s[k]}`);
  for (const x of s.stores) { if (!(x.por > 0)) out.push(`store with ${x.por} portions: ${x.id}`); if (!E.DATA.foods[x.id]) out.push('unknown food ' + x.id); }
  if (s.morale < 0 || s.morale > 100) out.push('morale out of range ' + s.morale);
  if (s.health > 100.0001) out.push('health above 100 ' + s.health);
  if (s.status === 'playing' && s.health <= 0 && s.phase === -1) out.push('alive with no health');
  if (!['playing', 'won', 'medical', 'tapped'].includes(s.status)) out.push('bad status ' + s.status);
  if (s.phase >= 0 && s.phase < 3 && s.hours > E.dayHours(s) + 3.01) out.push(`hours ${s.hours} far past daylight ${E.dayHours(s)}`);
  const lines = [...(s.today && s.today.lines || []), ...(s.today && s.today.night || []), ...(s.log.length ? s.log[s.log.length - 1].lines : [])];
  for (const l of lines) if (!Array.isArray(l) || typeof l[0] !== 'string' || BAD_TEXT.test(l[0])) out.push('bad log line: ' + JSON.stringify(l).slice(0, 140));
  if (s.sys && s.sys.notes) for (const n of s.sys.notes) if (BAD_TEXT.test(n.text)) out.push('bad note: ' + n.text.slice(0, 100));
  return out;
}
const saveText = s => JSON.stringify(s, (k, v) => v === Infinity ? 1e9 : v);
// what the screen's loader does with a save: big numbers back to Infinity for food that keeps
function reload(text) { const g = JSON.parse(text); for (const x of (g.stores || []).concat(g.raw || [])) if (x.left == null || x.left > 1e8) x.left = Infinity; return g; }
module.exports = { problems, saveText, reload, BAD_TEXT };
