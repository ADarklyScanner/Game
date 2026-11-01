// Clothes and spirits: wear, mending, the sleeping bag, tea by the fire.  node mend.js
const { loadGame } = require('./load-game'); const E = loadGame(process.env.GAME_FILE || undefined);
let fails = 0, passes = 0; const check = (name, ok, detail) => { if (ok) passes++; else { fails++; console.log('FAIL', name, detail ?? ''); } };
const GEAR = ['Axe', 'Ferro rod', 'Knife', 'Sleeping bag', 'Paracord', 'Fishing gear', 'Pot'];
function camp(gear = GEAR, seed = 3) { const s = E.newGame('US-S6', gear, { seed, weight: 200 }); E.beginDay(s); s.event = null; s.storm = s.rain = s.fog = s.wind = s.snowfall = false; s.firewood = 20; s.stores = [{ id: 'ration', por: 30, left: Infinity, smoked: false }]; return s; }
{ // work and storms wear clothes
  const s = camp(); E.act(s, 'firewood'); check('chopping wears clothes', E.clothesOf(s) < 1, E.clothesOf(s));
  const t = camp(); t.shelterLvl = 0; t.storm = true; t.event = null; E.endDay(t); check('a storm with no real shelter wears them', E.clothesOf(t) < 1, E.clothesOf(t));
}
{ // the plan's test: mending puts back 90% of the warmth worn clothes lost
  const cold = c => { const s = E.newGame('AU-S4', ['Ferro rod', 'Knife'], { seed: 9, weight: 200 }); E.beginDay(s); s.event = null; s.storm = s.wind = s.snowfall = false; s.stores = [{ id: 'ration', por: 30, left: Infinity, smoked: false }]; s.fire = false; s.sys.clothes = c; E.endDay(s); return s.lastDay.cold; };
  const whole = cold(1), worn = cold(0.4);
  const m = camp(); m.sys.clothes = 0.4; m.mats.bone = 1; m.mats.cordage = 2; check('mending offered', E.available(m, 'mend').ok); E.act(m, 'mend');
  check('first mend carves a bone needle', m.sys.needle === true && m.mats.bone === 0 && m.mats.cordage === 1);
  const after = cold(E.clothesOf(m)); check('worn clothes are colder', worn > whole); check('mending restores 90% of the lost warmth', Math.abs((worn - after) / (worn - whole) - 0.9) < 0.02, [whole, worn, after]);
  const n = camp(['Ferro rod', 'Sleeping bag']); n.sys.clothes = 0.4; n.mats.bone = 1; n.mats.cordage = 1; check('no knife, no needle', !E.available(n, 'mend').ok, E.available(n, 'mend').why);
}
{ // holes in the sleeping bag can be patched now
  const s = camp(); s.bagHoles = 2; s.sys.needle = true; s.mats.cordage = 2; E.act(s, 'mend'); check('a bag hole patched', s.bagHoles === 1 && s.mats.cordage === 1);
}
{ // the plan's test: a hot drink by a warm fire eases the day
  const will = tea => { const s = camp(GEAR, 21); s.morale = 50; s.fire = true; s.teaToday = tea; s.event = null; E.endDay(s); return s.morale; };
  check('tea by the fire lifts spirits', will(true) > will(false), [will(false), will(true)]);
}
console.log(fails ? `${fails} mend check(s) failed, ${passes} passed.` : `All ${passes} mend checks passed.`); process.exit(fails ? 1 : 0);
