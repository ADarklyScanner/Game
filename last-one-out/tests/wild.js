// Reading the land: traps left out, the sky, smoke on your clothes, thin ice, game sign.  node wild.js
const { loadGame } = require('./load-game'); const E = loadGame(process.env.GAME_FILE || undefined);
let fails = 0, passes = 0; const check = (name, ok, detail) => { if (ok) passes++; else { fails++; console.log('FAIL', name, detail ?? ''); } };
const GEAR = ['Axe', 'Ferro rod', 'Knife', 'Sleeping bag', 'Paracord', 'Fishing gear', 'Pot', 'Bow and arrows', 'Trapping wire'];
function camp(place = 'US-S6', seed = 3) { const s = E.newGame(place, GEAR, { seed, weight: 200 }); E.beginDay(s); s.event = null; s.stores = [{ id: 'ration', por: 30, left: Infinity, smoked: false }]; s.firewood = 20; return s; }
const rate = (n, f) => { let k = 0; for (let i = 0; i < n; i++) if (f(i)) k++; return k / n; };
{ // the plan's test: a catch left in a snare loses about 15% a night to scavengers
  let kept = 0, total = 0; for (let i = 0; i < 800; i++) { const s = camp('US-S6', 100 + i); s.snares = 0; s.deadfalls = 0; s.fishTrap = false; s.trapsCatch = ['hare', 'hare']; s.event = null; E.endDay(s); total += 2; kept += s.trapsCatch.length; }
  const lost = 1 - kept / total; check('about 15% of uncollected catches lost per night', Math.abs(lost - 0.15) < 0.03, lost);
}
{ // the plan's test: reading the sky predicts tomorrow, better with practice, up to 85%
  const acc = reads => { let right = 0; for (let i = 0; i < 600; i++) { const s = camp('US-S2', 300 + i); s.sys.skyReads = reads; s.hours = E.dayHours(s) - 1; s.phase = 2; E.act(s, 'read_sky'); const f = s.sys.forecast; s.event = null; E.endDay(s); E.beginDay(s); const real = s.storm ? 'storm' : s.snowfall ? 'snow' : s.rain ? 'rain' : 'fair'; if (f.said === real) right++; } return right / 600; };
  const novice = acc(0), expert = acc(20); check('a first reading is right about 65% of the time', Math.abs(novice - 0.65) < 0.07, novice); check('with practice about 85%', Math.abs(expert - 0.85) < 0.06, expert);
  const s = camp(); s.hours = 1; s.phase = 0; check('not offered in the morning', !E.available(s, 'read_sky').ok);
  s.hours = E.dayHours(s) - 1; s.phase = 2; E.act(s, 'read_sky'); check('once a day', !E.available(s, 'read_sky').ok);
}
{ // smoke on your clothes masks your scent: better hunting today and tomorrow
  const s = camp(); s.fire = true; const p0 = E.huntOdds(s); E.act(s, 'smoke_clothes'); check('smoke raises hunting odds by a fifth', Math.abs(E.huntOdds(s) / p0 - 1.2) < 0.01, [p0, E.huntOdds(s)]);
  s.day += 2; check('it wears off after a day', Math.abs(E.huntOdds(s) / p0 - 1) < 0.2);
}
{ // thin ice: only in the first days after freeze-up
  const f = E.DATA.seasons.find(x => x.key === 'US-S6').climate.freeze;
  const through = dayAfter => rate(1500, i => { const s = camp('US-S6', 500 + i); s.day = f + dayAfter; s.hours = 1; s.phase = 0; s.storm = false; E.act(s, 'fish'); return s.conditions.some(c => /ice broke/.test(c.name)); });
  const early = through(2), late = through(20); check('new ice can give way', early > 0.005 && early < 0.03, early); check('old ice holds', late === 0, late);
}
{ // the plan's test: snares set on runs you found catch 50% more
  const caught = scouted => { let n = 0; for (let i = 0; i < 2000; i++) { const s = camp('US-S6', 900 + i); s.storm = false; s.hours = 1; s.phase = 0; s.mats.wire = 6; if (scouted) E.act(s, 'scout'); E.act(s, 'snares'); s.event = null; for (let d = 0; d < 1; d++) { s.trapsCatch = []; s.event = null; E.endDay(s); n += s.trapsCatch.length; E.beginDay(s); s.event = null; } } return n; };
  const plain = caught(false), good = caught(true); check('snares on known runs catch about 50% more', good / plain > 1.35 && good / plain < 1.7, [plain, good]);
}
{ // a fine sinew leader on a handline: fish bite about 30% more in clear water
  const s = camp(); s.gear = s.gear.filter(g => g !== 'Fishing gear'); s.crafts.handline = 1; s.mats.bait = 5; s.spate = false; s.storm = false; const p0 = E.fishOdds(s);
  s.mats.hide = 1; check('leader offered for a handline', E.available(s, 'craft_leader').ok, E.available(s, 'craft_leader').why); E.act(s, 'craft_leader');
  check('a leader: about 30% more bites', Math.abs(E.fishOdds(s) / p0 - 1.3) < 0.01, [p0, E.fishOdds(s)]); s.spate = true; check('no help in muddy flood water', E.fishOdds(s) < p0 * 1.01);
  const g = camp(); g.mats.hide = 1; check('not needed with real fishing gear', !E.available(g, 'craft_leader').ok);
}
{ // ice holes freeze over: the first ice fishing of a cold day costs half an hour of chopping
  const s = camp('US-S7'); const f = E.DATA.seasons.find(x => x.key === 'US-S7').climate.freeze; s.stores = [{ id: 'ration', por: 300, left: Infinity, smoked: false }]; let d = 0; while ((!E.status(s).frozen || E.temperature(s) >= -5 || !E.available(Object.assign(s, { storm: false, hours: 1, phase: 0 }), 'fish').ok) && d++ < 160) { s.event = null; s.phase = 0; s.morale = 80; s.moraleDawn = 80; s.health = 90; E.endDay(s); E.beginDay(s); }
  s.event = null; s.storm = false; s.hours = 1; s.phase = 0; const h0 = s.hours; E.act(s, 'fish'); const first = s.hours - h0; s.event = null; const h1 = s.hours; E.act(s, 'fish'); const second = s.hours - h1;
  check('re-chopping the hole costs half an hour, once a day', Math.abs(first - second - 0.5) < 0.01, [first, second]);
}
{ // fresh snow or rain covers a blood trail
  const found = w => rate(1500, i => { const s = camp('US-S6', 1200 + i); s.hours = 1; s.phase = 0; Object.assign(s, { storm: false, rain: false, snowfall: false }, w); s.wounded = { id: 'hare', p: 0.6 }; E.act(s, 'track'); return !!s.carcass; });
  const dry = found({}), snow = found({ snowfall: true }); check('fresh snow makes a blood trail harder to follow', snow < dry * 0.75, [dry, snow]);
}
{ // arrows straightened over a fire fly true; crooked ones cost up to 30% of the hits
  const s = camp(); s.fire = false; s.arrows = 0; s.mats.feathers = 1; s.mats.poles = 1; E.act(s, 'craft_arrows'); check('arrows made without a fire are crooked', s.sys.crooked === 2 && s.arrows === 2);
  const hit = crooked => rate(2000, i => { const t = camp('US-S6', 2000 + i); t.hours = 1; t.phase = 0; t.arrows = 10; t.sys.crooked = crooked; E.act(t, 'hunt', { extra: { target: 'hare', hit: 'good' } }); return !!t.carcass; });
  const straight = hit(0), bent = hit(10); check('a quiver of crooked arrows hits about 30% less', Math.abs(bent / straight - 0.7) < 0.06, [straight, bent]);
}
console.log(fails ? `${fails} wild check(s) failed, ${passes} passed.` : `All ${passes} wild checks passed.`); process.exit(fails ? 1 : 0);
