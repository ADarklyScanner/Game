// Light and the night: what needs a fire or a lamp, the fat lamp, overnight broth.  node light.js
const { loadGame } = require('./load-game'); const E = loadGame(process.env.GAME_FILE || undefined);
let fails = 0, passes = 0; const check = (name, ok, detail) => { if (ok) passes++; else { fails++; console.log('FAIL', name, detail ?? ''); } };
const GEAR = ['Axe', 'Ferro rod', 'Knife', 'Sleeping bag', 'Paracord', 'Fishing gear', 'Rations', 'Pot'];
function dusk(opts = {}) { const s = E.newGame('US-S6', GEAR, { seed: opts.seed || 3, weight: 200 }); E.beginDay(s); s.event = null; s.storm = s.rain = s.fog = s.snowfall = s.wind = false;
  s.shelterType = 'cabin'; s.shelterLvl = 3; s.morale = 60; s.fire = !!opts.fire; s.firewood = 10; s.mats.cordage = 10; s.mats.moss = 4; s.mats.stone = 2; s.mats.poles = 3; s.mats.bone = 4; s.mats.bark = 4; s.potWater = 2;
  s.stores = [{ id: 'ration', por: 30, left: Infinity, smoked: false }]; if (opts.tallow) s.stores.push({ id: 'fat', por: opts.tallow, left: 90, smoked: false, rendered: true }); if (opts.lamp) s.crafts.lamp = 1;
  s.hours = E.dayHours(s); s.phase = 3; return s; }
const tallow = s => s.stores.filter(x => x.id === 'fat' && x.rendered).reduce((a, x) => a + x.por, 0);
{ // in the dark with no fire and no lamp: only things you can do by feel
  const s = dusk(); check('cannot whittle in the dark', !E.available(s, 'whittle').ok && /No light/.test(E.available(s, 'whittle').why), E.available(s, 'whittle').why);
  check('can still talk to the camera', E.available(s, 'talk_camera').ok); check('can twist cordage by feel', E.available(s, 'cordage').ok);
}
{ // the fat lamp
  const s = dusk({ fire: true, tallow: 1 }); s.hours = 2; s.phase = 0; check('lamp can be made', E.available(s, 'craft_lamp').ok, E.available(s, 'craft_lamp').why); E.act(s, 'craft_lamp');
  check('lamp made from a stone and a wick', s.crafts.lamp === 1 && s.mats.stone === 1 && s.mats.moss === 3);
  const n = dusk({ tallow: 0.1 }); check('no tallow, no lamp', !E.available(n, 'craft_lamp').ok);
}
{ // the plan's test: lamplight removes the night-work penalty; it burns tallow
  const lamp = dusk({ lamp: true, tallow: 2 }); const m0 = lamp.morale; check('lamp lets you work at night', E.available(lamp, 'whittle').ok, E.available(lamp, 'whittle').why);
  E.act(lamp, 'whittle', { inside: true }); check('no night-work penalty by lamplight', lamp.morale >= m0, [m0, lamp.morale]);
  check('the lamp burns tallow', tallow(lamp) < 2 && tallow(lamp) > 1.5, tallow(lamp));
  const fire = dusk({ fire: true }); E.act(fire, 'whittle'); check('by firelight alone night work wears on you more than by lamplight', fire.morale < lamp.morale, [fire.morale, lamp.morale]);
  const empty = dusk({ lamp: true, tallow: 0 }); check('a lamp with no tallow gives no light', !E.available(empty, 'whittle').ok);
}
{ // a lamp inside can be knocked into the bedding now and then
  let k = 0; for (let i = 0; i < 600; i++) { const s = dusk({ lamp: true, tallow: 5, seed: 900 + i }); E.act(s, 'whittle', { inside: true }); if (s.log.length && s.today.lines.some(l => /caught the lamp/.test(l[0]))) k++; }
  check('the lamp is occasionally knocked over inside', k > 2 && k < 40, k);
}
{ // the plan's test: bone broth left simmering all night is 45% richer
  const broth = fire => { const s = dusk({ fire: true }); s.hours = 3; s.phase = 0; E.act(s, 'bone_broth'); s.event = null; s.fire = fire; s.today.early = { kcal: 1e6, units: {}, types: [], lean: 0, fat: 0, protein: 0, rawMeat: false, oldMeat: false, tox: false, hard: false }; E.endDay(s); return s.stores.filter(x => x.id === 'broth').reduce((a, x) => a + x.por, 0); };
  const kept = broth(true), cold = broth(false); check('simmered overnight: about 45% more broth', Math.abs(kept / cold - 1.45) < 0.05, [cold, kept]);
}
console.log(fails ? `${fails} light check(s) failed, ${passes} passed.` : `All ${passes} light checks passed.`); process.exit(fails ? 1 : 0);
