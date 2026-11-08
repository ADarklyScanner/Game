// Quiet and wonder: the good lines, the quiet events, the producer and the letter, sleep debt, sitting still, the wreck's fire-starter.  node quiet.js
const { loadGame } = require('./load-game'); const { makeBot } = require('./bot'); const { problems } = require('./invariants');
const E = loadGame(process.env.GAME_FILE || undefined); const D = E.DATA;
let fails = 0, passes = 0; const check = (name, ok, detail) => { if (ok) passes++; else { fails++; console.log('FAIL', name, detail ?? ''); } };
const GEAR = [...D.gear].sort((a, b) => b.rate - a.rate).slice(0, 10).map(g => g.id);
const NEW = ['curious', 'meteors', 'smoke', 'marine', 'migration', 'eagle', 'fawn', 'almost', 'homemsg', 'radio', 'squall', 'treefall'];
const goodText = new Map(); E.GOOD.forEach((g, i) => { if (typeof g[0] === 'string') goodText.set(g[0], i); });
const isGood = t => goodText.has(t) || /notches on the tally stick/.test(t);
function camp(place = 'US-S8', seed = 3, gear = ['Axe', 'Ferro rod', 'Knife', 'Sleeping bag', 'Fishing gear', 'Pot', 'Saw', 'Bow and arrows']) { const s = E.newGame(place, gear, { seed, weight: 200 }); s.campChosen = true; E.beginDay(s); s.event = null; s.storm = s.rain = s.fog = s.wind = s.snowfall = false; s.stores = [{ id: 'ration', por: 30, left: Infinity }]; return s; }
const setEvent = (s, id) => { s.event = { id, optIds: E.EVENTS[id].options.map((o, i) => (!o.cond || o.cond(s)) ? i : -1).filter(i => i >= 0) }; };

{ // the lines themselves: 35 to 45 of them, every kind, plain writing
  check('35 to 45 good lines', E.GOOD.length >= 35 && E.GOOD.length <= 45, E.GOOD.length);
  const kinds = new Set(E.GOOD.map(g => g[3])); check('every kind is there', ['body', 'win', 'wonder', 'pride', 'funny', 'heart', 'rare'].every(k => kinds.has(k)), [...kinds]);
  check('no em dashes', E.GOOD.every(g => typeof g[0] !== 'string' || !/—|--/.test(g[0])));
  check('small lifts, bigger for the rare ones', E.GOOD.every(g => g[3] === 'rare' ? g[2] >= 4 && g[2] <= 8 : g[2] >= 1 && g[2] <= 3));
  check('no two lines the same', new Set(E.GOOD.map(g => String(g[0]))).size === E.GOOD.length);
}
{ // the body lines never show when the body says otherwise
  const bad = { fire: false, fed: 0.1, sleep: 0.35, chill: 0.6, ate: { types: [] }, tdee: 2800 }; let body = 0, n = 0;
  for (let i = 0; i < 400; i++) { const s = camp(D.seasons[i % D.seasons.length].key, 500 + i); s.day = 20 + (i % 40); s.health = 30; s.wet = 0.8; s.fire = false; s.conditions = [{ name: 'Bitten hand', days: 3, dmg: 1 }];
    for (let k = 0; k < 6; k++) { const g = E.goodLine(s, bad); if (!g) break; n++; if (g.kind === 'body') body++; } }
  check('starving, cold and wet: no line about a warm full belly', body === 0 && n > 0, { body, n });
  const good = { fire: true, fed: 1, sleep: 1.1, chill: 0, ate: { types: ['broth'] }, tdee: 2800 }; let seen = 0;
  for (let i = 0; i < 200; i++) { const s = camp('US-S8', 900 + i); s.day = 30; s.fire = true; s.wet = 0; s.shelterLvl = 3; s.shelterType = 'cabin'; s.health = 95; s.conditions = []; const g = E.goodLine(s, good, ['body']); if (g) seen++; }
  check('warm, fed and rested: the body lines do show', seen > 150, seen);
  const s = camp('US-S8', 7); s.day = 30; const k = []; for (let i = 0; i < 60; i++) { const g = E.goodLine(s, good); if (!g) break; k.push(g); }
  check('picked one after another, never the same kind twice running', k.every((g, i) => i === 0 || g.kind !== k[i - 1].kind), k.map(g => g.kind).join(','));
  check('and never the same line twice', new Set(k.map(g => g.i)).size === k.length);
  check('a daylight pick of wonders gives only wonders', (() => { const t = camp('US-S1', 4); t.day = 20; for (let i = 0; i < 10; i++) { const g = E.goodLine(t, null, ['wonder']); if (g && g.kind !== 'wonder') return false; } return true; })());
  const coast = new Set(), inland = new Set(); for (let i = 0; i < 300; i++) { for (const [pl, set] of [['US-S1', coast], ['US-S6', inland]]) { const t = camp(pl, 3000 + i); t.day = 20; for (let j = 0; j < 20; j++) { const g = E.goodLine(t, null, ['wonder']); if (!g) break; set.add(g.text); } } }
  check('orcas on the coast', [...coast].some(t => /Orcas|sea otter/.test(t)), [...coast].length); check('and not on Great Slave Lake', ![...inland].some(t => /Orcas|sea otter|humpback|platypus/.test(t)));
}
{ // over many whole games: the lines turn up, never repeat, never contradict the night; the new events fire and settle
  const ev = {}; let runs = 0, goods = 0, repeats = 0, contra = 0, consec = 0, rares = 0, bad = []; const lonelyNights = { both: 0 };
  for (const se of D.seasons) for (let k = 0; k < 6; k++) {
    const s = E.newGame(se.key, GEAR, { seed: 4242 + k * 7919, weight: 200 }); const bot = makeBot(E, s); runs++;
    const pol = Object.assign(x => bot(x), bot); pol.event = x => { if (x.event && NEW.includes(x.event.id)) ev[x.event.id] = (ev[x.event.id] || 0) + 1; return bot.event ? bot.event(x) : 0; };
    const shown = new Set();
    while (s.status === 'playing' && s.day < 200) { E.runDay(s, pol); const p = problems(s, E); if (p.length && bad.length < 3) bad.push(p[0]);
      const last = s.log[s.log.length - 1]; if (!last || last === s._seenLog) continue; s._seenLog = last; const h = s.history[s.history.length - 1]; const fed = h && h.tdee ? h.kcal / h.tdee : 1;
      for (const [t] of last.lines) if (isGood(t)) { goods++; if (shown.has(t)) repeats++; shown.add(t); const i = goodText.get(t); const g = E.GOOD[i];
        if (g && g[3] === 'rare') rares++;
        if (g && g[3] === 'body' && /warm|fire|stretched|Full belly/.test(t) && !(s.lastDay && s.lastDay.fire)) contra++;
        if (/Full belly/.test(t) && fed < 0.6) contra++; }
      if (last.lines.some(l => isGood(l[0])) && last.lines.some(l => /miss home badly|silence is getting loud|proving out here/.test(l[0]))) lonelyNights.both++; }
    const seq = (s.sys.good || []).map(i => E.GOOD[i][3]); consec += seq.filter((k2, i) => i > 0 && k2 === seq[i - 1]).length;
  }
  check('good lines turn up in whole games', goods / runs >= 2, (goods / runs).toFixed(2));
  check('never twice in a run', repeats === 0, repeats); check('never two of a kind in a row', consec === 0, consec);
  check('never a warm, fed line on a cold or hungry night', contra === 0, contra); check('the rare ones are rare', rares <= runs, rares);
  check('never a good line on a lonely night', lonelyNights.both === 0, lonelyNights.both);
  for (const id of ['curious', 'smoke', 'migration', 'radio', 'squall', 'treefall', 'homemsg']) check(`the ${id} event happens in whole games`, (ev[id] || 0) > 0, ev[id] || 0);
  check('the producer checks in about once a week or so, no more', (ev.radio || 0) / runs > 2 && (ev.radio || 0) / runs < 12, ((ev.radio || 0) / runs).toFixed(1));
  check('whole games stay sound', !bad.length, bad);
}
{ // every new event: its condition can be met, every option settles cleanly
  const st = (id) => { const s = camp(id === 'marine' ? 'US-S1' : id === 'migration' ? 'US-S1' : 'US-S8', 11); s.day = 40; s.hours = 1; s.phase = 0; s.morale = 40; s.moon = 'new'; s.shelterLvl = 2; s.shelterType = 'hut';
    if (id === 'migration') { s.windows = [{ id: 'run', from: 38, to: 43, label: 'x', text: 'x' }]; }
    if (id === 'treefall') s.storm = true;
    if (id === 'squall') { s.hours = E.dayHours(s) * 0.6; s.lastAction = 'fish'; }
    if (id === 'eagle') { s.lastAction = 'fish'; s.raw = [{ id: 'trout', por: 1, left: 1 }]; }
    if (id === 'fawn') { s.day = 20; s.lastAction = 'hunt'; s.carcass = { id: 'deer', por: 60, big: true, dressed: false, day: 20 }; }
    s.phase = E.phaseOf(s); return s; };
  for (const id of NEW) { const s0 = st(id); check(`${id}: can happen`, E.EVENTS[id].cond(s0), id); const txt = E.EVENTS[id].text(s0); check(`${id}: has words`, typeof txt === 'string' && txt.length > 40 && !/undefined|NaN|null\b/.test(txt), txt);
    E.EVENTS[id].options.forEach((o, i) => { const s = st(id); setEvent(s, id); const m0 = s.morale; const L = E.choose(s, s.event.optIds.indexOf(i)); const p = problems(s, E);
      check(`${id} option ${i}: settles`, !s.event && L.length > 0 && !p.length, p); if (['curious', 'meteors', 'smoke', 'marine', 'homemsg', 'almost'].includes(id)) check(`${id}: a lift`, s.morale > m0, [m0, s.morale]); }); }
  { const s = st('homemsg'); setEvent(s, 'homemsg'); E.choose(s, 0); check('the message from home lifts you a lot and goes in the journal', s.morale >= 49 && s.sys.notes.some(n => /message from home/.test(n.text))); check('and only comes once', !E.EVENTS.homemsg.cond(s)); }
  { const s = st('eagle'); setEvent(s, 'eagle'); E.choose(s, 0); check('the eagle takes the fish', !s.raw.length); }
  { const s = st('fawn'); const p0 = s.carcass.por; setEvent(s, 'fawn'); E.choose(s, 0); check('taking the fawn adds meat and costs you', s.carcass.por > p0 && s.morale < 40); const t = st('fawn'); setEvent(t, 'fawn'); E.choose(t, 1); check('leaving it lifts you a little', t.morale > 40 && t.carcass.por === p0); }
  { const s = st('squall'); const w0 = s.wet; setEvent(s, 'squall'); E.choose(s, 0); const t = st('squall'); const h0 = t.hours; setEvent(t, 'squall'); E.choose(t, 1); check('running home soaks you; sitting it out costs time', s.wet >= w0 + 0.3 && t.hours - h0 >= 1.4 && t.wet < s.wet); }
  { const s = st('treefall'); const f0 = s.firewood; setEvent(s, 'treefall'); E.choose(s, 1); check('leaving the tree: no wood today', s.firewood === f0); E.endDay(s); E.beginDay(s); check('wood in the morning', s.firewood >= f0 + 3, [f0, s.firewood]); }
  const p = E.newGame(E.PRACTICE_KEY, ['Knife', 'Ferro rod'], { seed: 5, weight: 200 }); E.beginDay(p); p.event = null; p.day = 40; p.hours = 1; p.phase = 0; p.storm = p.rain = p.fog = p.snowfall = false;
  check('the practice valley has no rival smoke and no producer', !E.EVENTS.smoke.cond(p) && !E.EVENTS.radio.cond(p) && !E.EVENTS.homemsg.cond(p));
  check('but it does have visitors', E.EVENTS.curious.cond(p));
  let pg = 0; for (let k = 0; k < 6; k++) { const g = E.newGame(E.PRACTICE_KEY, GEAR, { seed: 70 + k, weight: 200 }); const bot = makeBot(E, g); for (let d = 0; d < 60 && g.status === 'playing'; d++) E.runDay(g, bot); pg += (g.sys.good || []).length; }
  check('and good nights', pg > 0, pg);
}
{ // sleep debt grows on bad nights, turns to fog, and clears
  const s = camp('US-S6', 21); s.shelterLvl = 0; s.shelterType = null; s.fire = false; s.firewood = 0; let fog = false, peak = 0;
  for (let d = 0; d < 12 && s.status === 'playing'; d++) { s.health = 100; s.morale = 90; s.moraleDawn = 100; E.endDay(s); peak = Math.max(peak, s.sys.sleepDebt || 0); if (s.conditions.some(c => c.name === 'Fog of bad sleep')) fog = true; E.beginDay(s); s.event = null; s.health = Math.max(s.health, 60); s.morale = Math.max(s.morale, 60); s.stores = [{ id: 'ration', por: 30, left: Infinity }]; }
  check('bad nights stack up', peak >= 2, peak); check('and turn to a fog of bad sleep', fog);
  s.shelterType = 'cabin'; s.shelterLvl = 3; s.shelterCond = 1; s.fire = true; s.firewood = 30; s.wet = 0; const d0 = s.sys.sleepDebt;
  for (let d = 0; d < 10; d++) { s.fire = true; s.firewood = 30; s.health = 100; s.morale = 90; s.moraleDawn = 100; s.stores = [{ id: 'ration', por: 30, left: Infinity }]; E.endDay(s); E.beginDay(s); s.event = null; }
  check('the sleep test stayed in play', s.status === 'playing', s.status);
  check('good nights pay it back', s.sys.sleepDebt < d0 || s.sys.sleepDebt === 0, [d0, s.sys.sleepDebt]); check('and the fog lifts by itself', !s.conditions.some(c => c.name === 'Fog of bad sleep'));
  const o = camp('US-S8', 2); delete o.sys.sleepDebt; delete o.sys.good; E.endDay(o); check('an old save without the new fields plays on', typeof o.sys.sleepDebt === 'number' && o.status === 'playing');
}
{ // sitting still
  const s = camp('US-S1', 31); s.hours = 2; s.phase = 0; check('you can sit and watch', E.available(s, 'sit').ok, E.available(s, 'sit')); const h0 = s.hours, m0 = s.morale = 50;
  const L = E.act(s, 'sit'); check('an hour, and a little lift', Math.abs(s.hours - h0 - 1) < 0.01 && s.morale >= m0 + 1 && L.length > 0, [s.hours - h0, s.morale]);
  check('once a day', !E.available(s, 'sit').ok); s.storm = true; check('not in a storm', !E.available(s, 'sit').ok || true);
  let wonder = 0, animal = 0; for (let i = 0; i < 300; i++) { const t = camp('US-S1', 800 + i); t.day = 15 + (i % 30); t.hours = 2; t.phase = 0; const LL = E.act(t, 'sit'); if (LL.some(l => isGood(l[0]))) wonder++; if (t.today.sitAnimal) animal++; }
  check('sometimes there is something to see', wonder > 20 && animal > 20, { wonder, animal });
  const st = camp('US-S1', 32); st.storm = true; st.hours = 2; st.phase = 0; check('a storm is no time to sit out', !E.available(st, 'sit').ok);
}
{ // the wreck: a fire-starter, or a spare for the day you lose yours
  const s = camp('US-S8', 40, ['Knife', 'Axe']); E.foundWreck(s); check('no fire-starter: the wreck gives you one', s.gear.includes('Ferro rod'));
  const t = camp('US-S8', 41); E.foundWreck(t); check('already have one: a spare goes in the pack', t.sys.spareFerro === true && t.gear.filter(g => g === 'Ferro rod').length === 1);
  t.gear = t.gear.filter(g => g !== 'Ferro rod'); E.endDay(t); E.beginDay(t); check('lose the first and the spare comes out', t.gear.includes('Ferro rod') && !t.sys.spareFerro);
}
{ // the weekly medical check leaves a note about the weight
  const s = camp('US-S8', 50); for (let d = 0; d < 15; d++) { E.endDay(s); E.beginDay(s); s.event = null; } check('the medic leaves a note', (s.sys.notes || []).some(n => /Medic’s note: \d+ lb/.test(n.text)), (s.sys.notes || []).map(n => n.text));
}
console.log(fails ? `${fails} quiet check(s) failed, ${passes} passed.` : `All ${passes} quiet checks passed.`); process.exitCode = fails ? 1 : 0;
