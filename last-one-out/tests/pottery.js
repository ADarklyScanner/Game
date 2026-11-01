// Pottery: shaping, drying, pit firing, and using a clay pot.  node pottery.js
const { loadGame } = require('./load-game'); const E = loadGame(process.env.GAME_FILE || undefined);
let fails = 0, passes = 0; const check = (name, ok, detail) => { if (ok) passes++; else { fails++; console.log('FAIL', name, detail ?? ''); } };
const NOPOT = ['Axe', 'Ferro rod', 'Knife', 'Sleeping bag', 'Paracord', 'Fishing gear'];
function camp(seed = 3, shelter = 'leanto') { const s = E.newGame('US-S6', NOPOT, { seed, weight: 200 }); E.beginDay(s); s.event = null; s.storm = s.rain = s.fog = s.wind = s.snowfall = false; s.firewood = 20; s.mats.clay = 6; s.mats.stone = 2; s.stores = [{ id: 'ration', por: 30, left: Infinity, smoked: false }]; if (shelter) { s.shelterType = shelter; s.shelterLvl = 1; } return s; }
const night = (s, w) => { s.event = null; Object.assign(s, { storm: false, rain: false, fog: false, wind: false, snowfall: false }, w || {}); E.endDay(s); E.beginDay(s); s.event = null; };
const rate = (n, f) => { let k = 0; for (let i = 0; i < n; i++) if (f(i)) k++; return k / n; };
{ // shaping
  const s = camp(); check('a pot takes 3 clay', E.available(s, 'shape_pot').ok); E.act(s, 'shape_pot'); check('shaped with grit', E.greenPots(s).length === 1 && E.greenPots(s)[0].temper && s.mats.clay === 3 && s.mats.stone === 1);
  E.act(s, 'shape_pot'); check('no more than two drying at once', !E.available(s, 'shape_pot').ok);
}
{ // drying: days, faster by the fire, undone by rain in the open
  const days = fire => { const s = camp(); E.act(s, 'shape_pot'); let n = 0; while (E.greenPots(s)[0] && E.greenPots(s)[0].dry < 1 && n < 20) { s.fire = fire; night(s); n++; } return n; };
  const slow = days(false), quick = days(true); check('air drying takes about a week', slow >= 6 && slow <= 8, slow); check('by the fire, about four days', quick >= 4 && quick < slow, quick);
  const r = camp(5, null); E.act(r, 'shape_pot'); r.sys.greenPots[0].dry = 0.6; r.fire = false; night(r, { rain: true }); check('rain in the open softens a drying pot', E.greenPots(r)[0].dry < 0.6, E.greenPots(r)[0].dry);
  const cracked = temper => rate(400, i => { const s = camp(100 + i); s.mats.stone = temper ? 2 : 0; E.act(s, 'shape_pot'); s.fire = true; night(s); return E.greenPots(s).length === 0; });
  check('plain clay can crack drying fast by the fire', cracked(false) > 0.05, cracked(false)); check('tempered clay does not', cracked(true) === 0, cracked(true));
}
{ // the plan's risk: firing damp clay bursts it; dry tempered pots mostly survive
  const fired = (dry, temper) => rate(400, i => { const s = camp(300 + i); s.fire = true; s.sys.greenPots = [{ dry, temper }]; E.act(s, 'fire_pots'); return E.clayPots(s) === 1; });
  const good = fired(1, true), plain = fired(1, false), damp = fired(0.5, true);
  check('dry tempered pots mostly come out whole', good > 0.75, good); check('plain clay fails more', plain < good, [plain, good]); check('damp pots mostly burst', damp < 0.25, damp);
  const s = camp(); s.fire = true; s.sys.greenPots = [{ dry: 1, temper: true }]; check('firing needs 2 days of wood', E.available(s, 'fire_pots').ok); s.firewood = 1; check('and refuses without it', !E.available(s, 'fire_pots').ok);
}
{ // a fired clay pot does what a pot does
  const s = camp(); s.fire = true; s.potWater = 1; check('no pot: nothing to boil in', !E.available(s, 'boil').ok); s.sys.clayPots = 1;
  check('clay pot: can boil water', E.available(s, 'boil').ok); check('clay pot: counts as a pot', E.potLike(s));
  s.mats.bone = 2; check('clay pot: bone broth', E.available(s, 'bone_broth').ok);
  const w = camp(); w.sys.clayPots = 1; w.potWater = 0; w.fire = true; check('clay pot carries one potful', (() => { E.act(w, 'water'); return w.potWater === 1; })(), w.potWater);
  const broke = rate(1500, i => { const c = camp(700 + i); c.sys.clayPots = 1; c.fire = true; c.cook = 'boil'; c.potWater = 2; c.event = null; E.endDay(c); return E.clayPots(c) === 0; });
  check('a clay pot cracks on the coals now and then', broke > 0.005 && broke < 0.03, broke);
}
console.log(fails ? `${fails} pottery check(s) failed, ${passes} passed.` : `All ${passes} pottery checks passed.`); process.exit(fails ? 1 : 0);
