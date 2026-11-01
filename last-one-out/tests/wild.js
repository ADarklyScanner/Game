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
console.log(fails ? `${fails} wild check(s) failed, ${passes} passed.` : `All ${passes} wild checks passed.`); process.exit(fails ? 1 : 0);
