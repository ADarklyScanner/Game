// Bear spray, climbing, noise when stalking, the latrine.  node finish.js
const { loadGame } = require('./load-game'); const E = loadGame(process.env.GAME_FILE || undefined);
let fails = 0, passes = 0; const check = (name, ok, detail) => { if (ok) passes++; else { fails++; console.log('FAIL', name, detail ?? ''); } };
const GEAR = ['Axe', 'Ferro rod', 'Knife', 'Sleeping bag', 'Fishing gear', 'Pot', 'Saw'];
function camp(place = 'US-S8', seed = 3, gear = GEAR) { const s = E.newGame(place, gear, { seed, weight: 200 }); E.beginDay(s); s.event = null; s.storm = s.rain = s.fog = s.wind = s.snowfall = false; s.stores = [{ id: 'ration', por: 30, left: Infinity, smoked: false }, { id: 'hare', por: 6, left: 4, smoked: false }]; s.firewood = 20; return s; }
const rate = (n, f) => { let k = 0; for (let i = 0; i < n; i++) if (f(i)) k++; return k / n; };
const bearEvent = s => { s.event = { id: 'bear', optIds: E.EVENTS.bear.options.map((o, i) => (!o.cond || o.cond(s)) ? i : -1).filter(i => i >= 0) }; };
{ // the plan's test: bear spray turns a bear about 90% of the time; two blasts in the can; bear country only
  check('bear country: two blasts in the safety kit', E.sprayLeft(camp('US-S8')) === 2); check('no bears, no spray', E.sprayLeft(camp('AU-S1')) === 0);
  const turned = rate(1500, i => { const s = camp('US-S8', 100 + i); const k0 = s.stores.reduce((a, x) => a + x.por, 0); bearEvent(s); const idx = s.event.optIds.indexOf(2); E.choose(s, idx); return s.stores.reduce((a, x) => a + x.por, 0) === k0; });
  check('spray turns it about 90% of the time', Math.abs(turned - 0.9) < 0.03, turned);
  const s = camp('US-S8'); bearEvent(s); E.choose(s, s.event.optIds.indexOf(2)); bearEvent(s); E.choose(s, s.event.optIds.indexOf(2)); bearEvent(s); check('an empty can is not offered', !s.event.optIds.includes(2) && E.sprayLeft(s) === 0);
}
{ // the plan's test: a rope anchor keeps the chance of a fall under 1%
  const dry = camp('US-S6', 3, ['Axe', 'Knife']); dry.mats.cordage = 0; const wet = camp('US-S6', 3, ['Axe', 'Knife']); wet.mats.cordage = 0; wet.rain = true; const roped = camp('US-S6', 3, ['Axe', 'Knife', 'Rope']);
  check('unroped on dry rock: about 4%', Math.abs(E.fallChance(dry) - 0.04) < 1e-9); check('wet rock is worse', E.fallChance(wet) > 0.09); check('anchored: under 1%', E.fallChance(roped) < 0.01, E.fallChance(roped));
  const falls = rate(3000, i => { const s = camp('US-S6', 500 + i, ['Axe', 'Knife']); s.mats.cordage = 0; s.rain = true; s.hours = 1; s.phase = 0; E.act(s, 'climb'); return s.conditions.some(c => /fall/.test(c.name)) || s.status === 'medical'; });
  check('falls happen at the stated rate', Math.abs(falls - 0.1) < 0.02, falls);
  const ok = camp('US-S6'); ok.hours = 1; ok.phase = 0; ok.mats.cordage = 4; E.act(ok, 'climb'); check('a look-out from the top', ok.sys.lookout === ok.day || ok.conditions.length > 0); check('once a day', !E.available(ok, 'climb').ok);
  const w = camp('US-S6'); w.wind = true; check('not in the wind', !E.available(w, 'climb').ok);
}
{ // noise: damp ground and fresh snow are quiet, crust and dry leaves are loud
  const n = (w, day) => { const s = camp('US-S6'); Object.assign(s, { storm: false, rain: false, fog: false, snowfall: false }, w); if (day != null) s.day = day; return E.stalkNoise(s); };
  check('rain hides your steps', n({ rain: true }) > 1); const snowDay = E.DATA.seasons.find(x => x.key === 'US-S6').climate.snow;
  check('dry autumn leaves give you away', n({}, snowDay - 5) < 1, n({}, snowDay - 5)); check('a hard winter crust is loud', n({}, 95) < 1 || E.temperature(Object.assign(camp('US-S6'), { day: 95 })) >= -15);
}
{ // the latrine: without one the camp fouls the water; with one it clears
  const s = camp('US-S6'); for (let i = 0; i < 20; i++) { s.event = null; s.morale = s.moraleDawn = 80; E.endDay(s); E.beginDay(s); s.event = null; s.stores = [{ id: 'ration', por: 30, left: Infinity, smoked: false }]; } check('a camp with no latrine fouls', E.fouling(s) > 0.2, E.fouling(s));
  const sick = foul => rate(4000, i => { const t = camp('US-S6', 900 + i, ['Axe']); t.sys.fouling = foul; t.boiled = 0; t.event = null; E.endDay(t); return t.conditions.some(c => /Giardia/.test(c.name)); });
  const clean = sick(0), foul = sick(1); check('fouled water makes giardia likelier', foul > clean * 1.8, [clean, foul]);
  s.hours = 1; s.phase = 0; check('a latrine is offered', E.available(s, 'dig_latrine').ok); E.act(s, 'dig_latrine'); const f0 = E.fouling(s); for (let i = 0; i < 5; i++) { s.event = null; E.endDay(s); E.beginDay(s); s.event = null; } check('with a latrine it clears', E.fouling(s) < f0, [f0, E.fouling(s)]);
  E.moveCamp(s, 400); check('a new camp starts clean', E.fouling(s) === 0 && !E.latrineOk(s));
}
{ // hot or cold smoke
  const hang = mode => { const s = camp('US-S2'); s.fire = true; s.crafts.smoker = 2; s.stores = [{ id: 'ration', por: 30, left: Infinity, smoked: false }, { id: 'salmon', por: 4, left: 2, smoked: false }]; const w0 = s.firewood; E.act(s, 'smoke', { extra: { mode } }); return { s, wood: w0 - s.firewood, left: s.stores.find(x => x.id === 'salmon').left }; };
  const hot = hang('hot'), cold = hang('cold'); check('hot smoke cooks the outside: a few safe days', hot.left >= 4); check('cold smoke does not cook it', cold.left < 4, cold.left); check('cold smoke uses less wood', cold.wood < hot.wood, [hot.wood, cold.wood]);
  const moist = mode => { const s = hang(mode).s; s.today.early = { kcal: 1e6, units: {}, types: [], lean: 0, fat: 0, protein: 0 }; s.event = null; E.endDay(s); const x = s.stores.find(x => x.id === 'salmon'); return x ? x.moist : null; };
  check('cold smoke dries slower', moist('cold') > moist('hot'), [moist('hot'), moist('cold')]);
  const spoils = mode => { const s = hang(mode).s; for (let n = 0; n < 3; n++) { s.today.early = { kcal: 1e6, units: {}, types: [], lean: 0, fat: 0, protein: 0 }; s.event = null; E.endDay(s); E.beginDay(s); s.event = null; s.storm = s.rain = false; s.firewood = 20; s.fire = true; } return !s.stores.some(x => x.id === 'salmon'); };
  check('cold-smoked fresh fish can spoil in mild weather before it dries; hot-smoked lasts', spoils('cold') && !spoils('hot'));
  const flare = mode => rate(600, i => { const s = camp('US-S2', 2000 + i, ['Ferro rod', 'Axe']); s.fire = true; s.crafts.smoker = 2; s.stores.push({ id: 'salmon', por: 6, left: 4, smoked: false }); E.act(s, 'smoke', { extra: { mode } }); s.event = null; s.firewood = 10; E.endDay(s); return s.today.night.some(l => /smoker went up in flames/.test(l[0])); });
  check('no flame, no flare-ups in cold smoke', flare('cold') === 0 && flare('hot') > 0);
}
{ // the log bridge: floods can tear a log loose; wet logs are slick
  const torn = rate(1500, i => { const s = camp('US-S2', 3000 + i); s.crafts.bridge = 2; s.lastStorm = s.day; s.event = null; E.endDay(s); E.beginDay(s); return s.spate && s.crafts.bridge === 1; });
  check('the flood after a storm can tear the bridge', torn > 0.2 && torn < 0.4, torn);
  const slips = rate(4000, i => { const s = camp('US-S2', 5000 + i); s.rain = true; s.wet = 0; return E.wade(s, true).length > 0; }); check('wet logs are slick now and then', slips > 0.01 && slips < 0.035, slips);
  const dry = camp('US-S2'); dry.wet = 0; E.wade(dry, true); check('the bridge keeps you dry in dry weather', dry.wet === 0);
}
{ // splints
  const s = camp(); s.conditions.push({ name: 'Broken wrist from a fall', days: 14, dmg: 1.6 }); s.mats.poles = 1; s.mats.cordage = 1; check('splinting offered', E.available(s, 'splint').ok); E.act(s, 'splint');
  const c = s.conditions.find(x => /wrist/.test(x.name)); check('a splint halves the pain and shortens it', c.splinted && Math.abs(c.dmg - 0.8) < 1e-9 && c.days === 11, JSON.stringify(c));
  const t = camp(); t.conditions.push({ name: 'Sprained ankle from a fall', days: 6, dmg: 1 }); t.mats.bark = 2; t.mats.cordage = 1; E.act(t, 'splint', { extra: { good: false } }); const d = t.conditions[t.conditions.length - 1]; check('set crooked, it takes longer', d.days === 9, d.days);
  check('nothing to splint, not offered', !E.available(camp(), 'splint').ok);
}
console.log(fails ? `${fails} check(s) failed, ${passes} passed.` : `All ${passes} checks passed.`); process.exit(fails ? 1 : 0);
