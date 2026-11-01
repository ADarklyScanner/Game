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
{ // scraped and softened leather: better patches and warmer mittens
  const s = camp(); s.mats.hide = 3; check('hide work offered', E.available(s, 'work_hide').ok); E.act(s, 'work_hide'); check('soft leather made', s.sys.leather === 1 && s.mats.hide === 2);
  s.sys.clothes = 0.3; s.sys.needle = true; s.mats.cordage = 1; E.act(s, 'mend'); check('a leather patch makes clothes as good as new', E.clothesOf(s) === 1 && s.sys.leather === 0);
  const mitt = soft => { const m = E.newGame('AU-S4', ['Ferro rod', 'Knife'], { seed: 9, weight: 200 }); E.beginDay(m); m.event = null; m.storm = m.wind = m.snowfall = false; m.stores = [{ id: 'ration', por: 30, left: Infinity, smoked: false }]; m.fire = false; m.crafts.mittens = 1; m.sys.softMittens = soft; E.endDay(m); return m.lastDay.cold; };
  check('soft leather mittens are warmer', mitt(true) < mitt(false), [mitt(false), mitt(true)]);
  const k = camp(); k.sys.leather = 2; k.mats.hide = 0; check('mittens from soft leather', E.available(k, 'craft_mittens').ok); E.act(k, 'craft_mittens'); check('made from the leather', k.crafts.mittens === 1 && k.sys.leather === 0 && k.mats.hide === 0 && k.sys.softMittens);
}
console.log(fails ? `${fails} mend check(s) failed, ${passes} passed.` : `All ${passes} mend checks passed.`); process.exit(fails ? 1 : 0);
