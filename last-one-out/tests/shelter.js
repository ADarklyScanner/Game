// Shelter rules: snow on the roof, the fire reflector, the raised bed, cabin logs shrinking, snowshoes.  node shelter.js
const { loadGame } = require('./load-game'); const E = loadGame(process.env.GAME_FILE || undefined);
let fails = 0, passes = 0; const check = (name, ok, detail) => { if (ok) passes++; else { fails++; console.log('FAIL', name, detail ?? ''); } };
const GEAR = ['Axe', 'Ferro rod', 'Knife', 'Sleeping bag', 'Paracord', 'Fishing gear', 'Pot', 'Saw'];
function camp(shelter, place = 'US-S7', seed = 3) { const s = E.newGame(place, GEAR, { seed, weight: 200 }); E.beginDay(s); s.event = null; s.storm = s.rain = s.fog = s.wind = s.snowfall = false; s.firewood = 20; s.stores = [{ id: 'ration', por: 30, left: Infinity, smoked: false }];
  if (shelter) { s.shelterType = shelter; s.shelterLvl = { tarp: 1, leanto: 1, hut: 2, rock: 3, cabin: 3 }[shelter]; s.shelterCond = 1; } return s; }
const rate = (n, f) => { let k = 0; for (let i = 0; i < n; i++) if (f(i)) k++; return k / n; };
const night = (s, w) => { s.event = null; Object.assign(s, { storm: false, rain: false, fog: false, wind: false, snowfall: false }, w || {}); E.endDay(s); E.beginDay(s); s.event = null; };
{ // the plan's test: a shallow roof suffers more under the same snow than a steep one
  const after = shelter => { const s = camp(shelter); s.sys.snowLoad = 2; for (let i = 0; i < 3; i++) night(s, { snowfall: true }); return s.shelterType === shelter ? s.shelterCond : 0; };
  const lean = after('leanto'), hut = after('hut'); check('snow wears a shallow lean-to roof faster than a steep hut', lean < hut - 0.05, [lean, hut]);
  const s = camp('hut'); for (let i = 0; i < 4; i++) night(s, { snowfall: true }); check('snow builds up on the roof', E.snowLoadOf(s) >= 1, E.snowLoadOf(s));
  check('clearing it is offered', E.available(s, 'clear_roof').ok); E.act(s, 'clear_roof'); check('cleared', E.snowLoadOf(s) === 0);
  const m = camp('hut', 'US-S2'); m.sys.snowLoad = 1; night(m); check('it melts above freezing', E.snowLoadOf(m) < 1 || E.temperature(m) <= 0, [E.snowLoadOf(m), E.temperature(m)]);
  const cold = load => { const c = camp('cabin', 'US-S7', 9); c.sys.snowLoad = load; c.fire = false; E.endDay(c); return c.lastDay.cold; }; check('a blanket of snow keeps a walled shelter warmer', cold(1) < cold(0), [cold(0), cold(1)]);
}
{ // a reflector wall throws the fire's heat into an open shelter
  const cold = (shelter, refl) => { const s = camp(shelter, 'US-S7', 9); s.fire = true; s.fireInside = false; if (refl) s.crafts.reflector = 1; E.endDay(s); return s.lastDay.cold; };
  check('reflector warms a lean-to', cold('leanto', true) < cold('leanto', false) * 0.95, [cold('leanto', false), cold('leanto', true)]);
  const s = camp('leanto'); s.mats.poles = 6; check('reflector needs 6 poles', E.available(s, 'craft_reflector').ok); E.act(s, 'craft_reflector'); check('built', s.crafts.reflector === 1 && s.mats.poles === 0);
  check('not offered for a cabin', !E.available(camp('cabin'), 'craft_reflector').ok);
}
{ // the plan's test: a raised frame with a bough bed keeps the ground cold off
  const cold = (bed, frame) => { const s = camp('leanto', 'US-S7', 9); s.fire = false; s.sys.bed = bed; if (frame) s.crafts.platform = 1; E.endDay(s); return s.lastDay.cold; };
  check('a raised frame under the bed beats a bed on the ground', cold(1, true) < cold(1, false), [cold(1, false), cold(1, true)]);
  check('frame and bed together cut cold by a quarter', cold(1, true) <= cold(0, false) * 0.75, [cold(0, false), cold(1, true)]);
  const s = camp('leanto'); s.mats.poles = 6; s.mats.cordage = 2; E.act(s, 'craft_platform'); check('frame built', s.crafts.platform === 1);
  check('no frame without a shelter', !E.available(camp(null), 'craft_platform').ok);
}
{ // the plan's test: green cabin logs shrink and open gaps about four weeks after building
  const s = camp('cabin', 'US-S6'); s.sys.cabinDay = s.day - 28; s.sys.seal = 0.9; const c0 = (() => { const t = camp('cabin', 'US-S6', 9); t.fire = false; E.endDay(t); return t.lastDay.cold; })();
  night(s); check('gaps open after 28 days', s.sys.gaps === true && E.sealOf(s) === 0); check('the log says so', s.log.some(d => d.lines.some(l => /dried and shrunk/.test(l[0]))));
  const g = camp('cabin', 'US-S6', 9); g.sys.gaps = true; g.fire = false; E.endDay(g); check('a gappy cabin is colder', g.lastDay.cold > c0, [c0, g.lastDay.cold]);
  s.mats.clay = 3; s.mats.moss = 1; E.act(s, 'caulk'); check('chinking closes the gaps', s.sys.gaps === false && E.sealOf(s) > 0.8);
}
{ // the plan's test: snowshoes cut the effort of walking in deep snow by 60%
  const walk = shoes => { const s = camp(null, 'US-S7'); while (!E.status(s).snowy && s.day < 120) { s.event = null; E.endDay(s); E.beginDay(s); } s.event = null; s.phase = 0; s.hours = 0; if (shoes) s.crafts.snowshoes = 1; const b0 = s.today.burn; E.travel(s, 4000); return { burn: s.today.burn - b0, hours: s.hours }; };
  const no = walk(false), yes = walk(true); check('snowshoes: 60% less effort in deep snow', Math.abs(yes.burn / no.burn - 0.4) < 0.02, [no.burn, yes.burn]); check('and quicker', yes.hours < no.hours, [no.hours, yes.hours]);
}
{ // the plan's test: a wading staff makes the ford 80% steadier; the bridge keeps you dry
  const slips = staff => rate(4000, i => { const s = camp(null, 'US-S2', 3000 + i); s.wet = 0; if (staff) s.crafts.staff = 1; return E.wade(s, false).length > 0; });
  const bare = slips(false), staff = slips(true); check('fording: an occasional slip', bare > 0.02 && bare < 0.07, bare); check('a staff cuts slips by about 80%', Math.abs(staff / bare - 0.2) < 0.08, [bare, staff]);
  const w = camp(null, 'US-S2'); w.wet = 0; E.wade(w, false); check('wading wets you', w.wet >= 0.25); const b = camp(null, 'US-S2'); b.wet = 0; E.wade(b, true); check('the bridge keeps you dry', b.wet === 0);
  const c = camp(null, 'US-S2'); c.mats.poles = 1; check('a staff takes one pole', E.available(c, 'craft_staff').ok); E.act(c, 'craft_staff'); check('staff made', c.crafts.staff === 1 && c.mats.poles === 0);
}
console.log(fails ? `${fails} shelter check(s) failed, ${passes} passed.` : `All ${passes} shelter checks passed.`); process.exit(fails ? 1 : 0);
