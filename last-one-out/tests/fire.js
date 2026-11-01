// Fire and stove rules: tinder, the hearth, soot in the flue, the smoker, chinking the walls.  node fire.js
const { loadGame } = require('./load-game'); const E = loadGame(process.env.GAME_FILE || undefined);
let fails = 0, passes = 0; const check = (name, ok, detail) => { if (ok) passes++; else { fails++; console.log('FAIL', name, detail ?? ''); } };
const FERRO = ['Ferro rod', 'Axe', 'Saw', 'Knife', 'Sleeping bag', 'Paracord', 'Fishing gear', 'Rations'];
const NOFERRO = ['Axe', 'Saw', 'Knife', 'Sleeping bag', 'Paracord', 'Fishing gear', 'Rations', 'Tarp'];
function camp(gear = FERRO, place = 'US-S6', seed = 3) { const s = E.newGame(place, gear, { seed, weight: 200 }); E.beginDay(s); s.event = null; s.storm = s.rain = s.fog = s.snowfall = s.wind = s.heat = false; s.mats.tinder = 4; s.firewood = 10; s.stores = [{ id: 'ration', por: 30, left: Infinity, smoked: false }]; return s; }
const night = s => { s.event = null; E.endDay(s); E.beginDay(s); s.event = null; };
const rate = (n, f) => { let k = 0; for (let i = 0; i < n; i++) if (f(i)) k++; return k / n; };

{ // the plan's test: tinder over 20% damp will not take an ember from a bow drill
  const s = camp(NOFERRO); s.crafts.bowdrill = 1; s.sys.tinderDamp = 0.25;
  check('bow drill odds collapse in damp tinder', E.fireOdds(s) <= 0.03, E.fireOdds(s));
  const lit = rate(300, i => { const t = camp(NOFERRO, 'US-S6', 100 + i); t.crafts.bowdrill = 1; t.sys.tinderDamp = 0.25; E.act(t, 'light_fire', { extra: { ember: true } }); return t.fire; });
  check('even a good ember will not take in damp tinder', lit < 0.08, lit);
  const t = camp(NOFERRO); t.crafts.bowdrill = 1; t.sys.tinderDamp = 0; check('dry tinder gives the bow drill a fair chance', E.fireOdds(t) > 0.25, E.fireOdds(t));
  const f = camp(); f.sys.tinderDamp = 0.6; const g = camp(); check('a ferro rod still lights damp tinder, less reliably', E.fireOdds(f) < E.fireOdds(g) && E.fireOdds(f) > 0.5, [E.fireOdds(f), E.fireOdds(g)]);
  check('the odds shown say the tinder is damp', /damp tinder/.test(E.available(f, 'light_fire').odds));
}
{ // gathering in the wet makes damp tinder; birch bark sheds water
  const s = camp(); s.mats.tinder = 0; s.rain = true; E.act(s, 'tinder'); check('tinder picked in the rain is damp', E.tinderDamp(s) >= 0.5, E.tinderDamp(s));
  const b = camp(); b.mats.tinder = 0; b.rain = true; E.act(b, 'tinder', { extra: { tree: { kind: 'birch' } } }); check('birch bark picked in the rain stays dry', E.tinderDamp(b) <= 0.05, E.tinderDamp(b));
  const m = camp(); m.mats.tinder = 3; m.sys.tinderDamp = 0; m.rain = true; E.act(m, 'tinder'); check('mixing wet into dry tinder makes it partly damp', E.tinderDamp(m) > 0.1 && E.tinderDamp(m) < 0.6, E.tinderDamp(m));
}
{ // drying out and getting wet
  const s = camp(); s.fire = true; s.sys.tinderDamp = 0.6; night(s); check('tinder kept by the fire dries overnight', E.tinderDamp(s) < 0.3, E.tinderDamp(s));
  const w = camp(FERRO); w.fire = false; w.shelterLvl = 0; w.sys.tinderDamp = 0; w.rain = true; E.endDay(w); check('tinder left out in the rain with no roof gets wet', E.tinderDamp(w) >= 0.3, E.tinderDamp(w));
  const t = camp(NOFERRO); t.fire = false; t.shelterLvl = 0; t.sys.tinderDamp = 0; t.rain = true; E.endDay(t); check('a tarp keeps the tinder dry', E.tinderDamp(t) === 0, E.tinderDamp(t));
}
{ // a stone hearth: less wood, fewer fires lost to wind and storm, and warm stones after it dies
  const a = camp(); a.fire = true; a.firewood = 10; E.endDay(a); const b = camp(); b.fire = true; b.firewood = 10; b.crafts.hearth = 1; E.endDay(b);
  check('the hearth burns less wood', 10 - b.firewood < 10 - a.firewood, [10 - a.firewood, 10 - b.firewood]);
  const lost = h => rate(400, i => { const s = camp(FERRO, 'US-S6', 200 + i); s.fire = true; s.wind = true; s.firewood = 2; if (h) s.crafts.hearth = 1; E.endDay(s); return s.today.night.some(l => /wind scattered/.test(l[0])); });
  const l0 = lost(false), l1 = lost(true); check('wind scatters a fire in a hearth less often', l1 < l0, [l0, l1]);
  const cold = h => { const s = camp(FERRO, 'US-S6', 7); s.fire = true; s.firewood = 0; if (h) s.crafts.hearth = 1; E.endDay(s); return s.lastDay.cold; };
  check('warm stones after the fire dies keep some cold off', cold(true) < cold(false), [cold(false), cold(true)]);
  const s = camp(); s.mats.stone = 6; check('hearth needs 6 stones', E.available(s, 'craft_hearth').ok); E.act(s, 'craft_hearth'); check('hearth built', s.crafts.hearth === 1 && s.mats.stone === 0);
}
{ // the plan's test: soot over 80% brings spark warnings while the fire is high; sweeping clears it
  const s = camp(); s.shelterType = 'cabin'; s.shelterLvl = 3; s.fireInside = true; s.fire = true; s.crafts.chimney = 2; s.firewood = 40;
  for (let i = 0; i < 6; i++) { s.fire = true; night(s); } check('soot builds up in the flue', s.sys.soot > 0.1, s.sys.soot);
  s.sys.soot = 0.85; let warned = false, fired = false; for (let i = 0; i < 12; i++) { s.fire = true; s.firewood = 40; night(s); const l = s.log[s.log.length - 1].lines.map(x => x[0]).join(' '); if (/spits sparks onto the roof|flue caught/.test(l)) warned = true; if (/flue caught/.test(l)) fired = true; if (s.sys.soot < 0.8) s.sys.soot = 0.85; }
  check('over 80% the flue warns of sparks', warned);
  check('the sweep job is offered', E.available(s, 'check_roof').ok); E.act(s, 'check_roof'); check('sweeping clears most of it', s.sys.soot < 0.3, s.sys.soot);
  const g = camp(); g.shelterType = 'cabin'; g.shelterLvl = 3; g.fireInside = true; g.crafts.chimney = 2; g.greenWood = 20; g.firewood = 30; g.fire = true; night(g); const n = camp(); n.shelterType = 'cabin'; n.shelterLvl = 3; n.fireInside = true; n.crafts.chimney = 2; n.firewood = 30; n.fire = true; night(n);
  check('green wood fouls the flue faster', g.sys.soot > n.sys.soot, [n.sys.soot, g.sys.soot]);
}
{ // fat dripping in the smoker: flare-ups without a pot or pan, none with one
  const flare = gear => rate(400, i => { const s = camp(gear, 'US-S2', 300 + i); s.fire = true; s.crafts.smoker = 2; s.stores.push({ id: 'salmon', por: 6, left: 4, smoked: false }); E.act(s, 'smoke'); s.event = null; s.firewood = 10; E.endDay(s); return s.today.night.some(l => /smoker went up in flames/.test(l[0])); });
  const noPan = flare(FERRO), pan = flare([...FERRO, 'Pot']); check('fatty fish in a smoker can flare up without a drip pan', noPan > 0.03 && noPan < 0.2, noPan); check('a pot under the meat catches the drips', pan === 0, pan);
}
{ // chinking the walls
  const s = camp(); s.shelterType = 'leanto'; s.shelterLvl = 1; s.mats.moss = 10; check('a lean-to has no walls to chink', !E.available(s, 'caulk').ok);
  const c = camp(); c.shelterType = 'cabin'; c.shelterLvl = 3; c.mats.clay = 3; c.stores.push({ id: 'fat', por: 1, left: 90, smoked: false, rendered: true }); E.act(c, 'caulk');
  check('clay and tallow make a tight seal', E.sealOf(c) >= 0.99, E.sealOf(c));
  const m = camp(); m.shelterType = 'hut'; m.shelterLvl = 2; m.mats.moss = 4; E.act(m, 'caulk'); check('moss makes a lesser seal', E.sealOf(m) > 0.6 && E.sealOf(m) < 0.9, E.sealOf(m));
  const cold = seal => { const s = camp(FERRO, 'US-S6', 9); s.shelterType = 'cabin'; s.shelterLvl = 3; s.fire = false; s.sys.seal = seal; E.endDay(s); return s.lastDay.cold; };
  check('a sealed cabin loses less heat', cold(1) < cold(0) * 0.9, [cold(0), cold(1)]);
  const d = camp(); d.shelterType = 'cabin'; d.shelterLvl = 3; d.sys.seal = 1; d.storm = true; E.endDay(d); const e = camp(); e.shelterType = 'cabin'; e.shelterLvl = 3; e.sys.seal = 1; E.endDay(e);
  check('storms crack the chinking faster', d.sys.seal < e.sys.seal, [e.sys.seal, d.sys.seal]);
  E.moveCamp(c, 500); check('moving camp leaves the chinking and hearth behind', E.sealOf(c) === 0 && !c.crafts.hearth);
}
{ // a bough bed keeps the ground cold off; it packs down; moving camp leaves it behind
  const cold = bed => { const s = camp(FERRO, 'US-S6', 9); s.shelterType = 'leanto'; s.shelterLvl = 1; s.fire = false; s.sys.bed = bed; E.endDay(s); return s.lastDay.cold; };
  check('a bough bed cuts the night cold', cold(1) < cold(0) * 0.9, [cold(0), cold(1)]);
  const s = camp(); s.shelterType = 'leanto'; s.shelterLvl = 1; s.mats.boughs = 8; check('a bed takes 8 boughs', E.available(s, 'bed').ok); E.act(s, 'bed'); check('bed laid', E.bedOf(s) === 1 && s.mats.boughs === 0);
  for (let i = 0; i < 10; i++) { s.event = null; E.endDay(s); E.beginDay(s); s.event = null; } check('it packs down night by night', E.bedOf(s) < 0.8 && E.bedOf(s) > 0.6, E.bedOf(s));
  s.mats.boughs = 4; s.sys.bed = 0.5; check('4 boughs fluff it up', E.available(s, 'bed').ok); E.act(s, 'bed'); check('fluffed up', E.bedOf(s) === 1 && s.mats.boughs === 0);
  E.moveCamp(s, 400); check('moving camp leaves the bed behind', E.bedOf(s) === 0);
}
console.log(fails ? `${fails} fire check(s) failed, ${passes} passed.` : `All ${passes} fire checks passed.`); process.exit(fails ? 1 : 0);
