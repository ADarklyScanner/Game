// Steps 1 and 2: every action asked and run in thousands of varied situations; every event forced and every choice taken.  node exhaustive.js [samples]
const { loadCovered } = require('./cover'); const { makeSampler } = require('./sampler'); const { problems, saveText } = require('./invariants');
const E = loadCovered(); const ids = Object.keys(E.ACTIONS); const N = Number(process.argv[2] || 20000);
const found = new Map(); const report = (kind, detail, ctx) => { const k = kind + ': ' + detail; if (!found.has(k)) found.set(k, { n: 0, ctx }); found.get(k).n++; };
const where = s => `${s.seasonKey} day ${s.day} phase ${s.phase} ${['storm', 'rain', 'fog', 'wind', 'snowfall', 'heat'].filter(w => s[w]).join(',') || 'clear'}`;
const sample = makeSampler(E, 7);
for (let i = 0; i < N; i++) {
  let s; try { s = sample(); } catch (e) { report('sampler crash', e.message, ''); continue; }
  // ask every action; a refusal must leave the game untouched
  for (const id of ids) {
    let av; try { av = E.available(s, id); } catch (e) { report('available() crash', `${id}: ${e.message}`, where(s)); continue; }
    if (typeof av.why !== 'string' || (!av.ok && !av.why && id !== 'shelter')) report('refusal with no reason', id, where(s));
    if (!av.ok && i % 7 === 0) { const before = saveText(s); try { E.act(s, id); } catch (e) { report('refused act crash', `${id}: ${e.message}`, where(s)); } const after = saveText(s); if (before !== after && !s.event) report('refused action changed the game', id, where(s)); s = JSON.parse(before, (k, v) => v === 1e9 && k === 'left' ? Infinity : v); }
  }
  // run up to three allowed actions on copies of this situation
  const allowed = ids.filter(id => { try { return E.available(s, id).ok; } catch (e) { return false; } });
  for (let k = 0; k < Math.min(3, allowed.length); k++) {
    const id = allowed[(i * 7 + k * 13) % allowed.length]; const t = JSON.parse(saveText(s), (kk, v) => v === 1e9 && kk === 'left' ? Infinity : v);
    const h0 = t.hours; const extra = [{}, { good: true }, { good: false }][(i + k) % 3];
    try { E.act(t, id, { extra, inside: (i + k) % 4 === 0 }); } catch (e) { report('act crash', `${id}: ${e.message} | ${(e.stack || '').split('\n')[1]}`, where(s)); continue; }
    for (const p of problems(t, E)) report('after ' + id, p, where(s));
    if (t.status === 'playing' && t.hours < h0 - 1e-9 && t.phase !== -1) report('time went backwards', id, where(s));
    if (t.event) { const opts = t.event.optIds; for (let o = 0; o < opts.length; o++) { const u = JSON.parse(saveText(t), (kk, v) => v === 1e9 && kk === 'left' ? Infinity : v); try { E.choose(u, o); } catch (e) { report('choice crash', `${t.event.id} #${opts[o]}: ${e.message}`, where(s)); continue; } for (const p of problems(u, E)) report(`after event ${t.event.id} #${opts[o]}`, p, where(s)); } t.event = null; }
    // and the night that follows
    if (t.status === 'playing' && t.phase >= 0) { try { E.endDay(t); E.beginDay(t); } catch (e) { report('night crash', `${e.message} | ${(e.stack || '').split('\n')[1]}`, where(s)); continue; } for (const p of problems(t, E)) report('after the night', p, where(s)); }
  }
  // force every event on this situation and take every choice
  if (i % 3 === 0) for (const [ev, def] of Object.entries(E.EVENTS)) {
    { let ok = true; try { ok = !def.cond || def.cond(JSON.parse(saveText(s), (kk, v) => v === 1e9 && kk === 'left' ? Infinity : v)); } catch (e) { report('event condition crash', `${ev}: ${e.message}`, where(s)); continue; } if (!ok || (def.when === 'injury' && !s.conditions.length)) continue; } // only events that could really fire here
    let text; try { text = def.text(s); } catch (e) { report('event text crash', `${ev}: ${e.message}`, where(s)); continue; }
    if (typeof text !== 'string' || /undefined|NaN/.test(text)) report('bad event text', `${ev}: ${String(text).slice(0, 80)}`, where(s));
    let optIds; try { optIds = def.options.map((o, j) => (!o.cond || o.cond(s)) ? j : -1).filter(j => j >= 0); } catch (e) { report('event condition crash', `${ev}: ${e.message}`, where(s)); continue; }
    for (let o = 0; o < optIds.length; o++) { const u = JSON.parse(saveText(s), (kk, v) => v === 1e9 && kk === 'left' ? Infinity : v); u.event = { id: ev, title: def.title, text, options: [], optIds, phase: Math.max(0, Math.min(2, u.phase)) };
      try { E.choose(u, o); } catch (e) { report('choice crash', `${ev} #${optIds[o]}: ${e.message} | ${(e.stack || '').split('\n')[1]}`, where(s)); continue; } for (const p of problems(u, E)) report(`after event ${ev} #${optIds[o]}`, p, where(s)); }
  }
}
const list = [...found.entries()].sort((a, b) => b[1].n - a[1].n);
console.log(list.length ? `${list.length} distinct problem(s) in ${N} situations:` : `${N} situations: no problems.`);
for (const [k, v] of list.slice(0, 60)) console.log(`  [${v.n}x] ${k}   e.g. ${v.ctx}`);
process.exit(list.length ? 1 : 0);
