// Learning by consequence: the notebook, look-alike plants, unknown berries, creeping cold, smoke in a shut cabin, direction.  node conseq.js
const { loadGame } = require('./load-game'); const E = loadGame(process.env.GAME_FILE || undefined);
let fails = 0, passes = 0; const check = (name, ok, detail) => { if (ok) passes++; else { fails++; console.log('FAIL', name, detail ?? ''); } };
const GEAR = ['Axe', 'Ferro rod', 'Knife', 'Sleeping bag', 'Fishing gear', 'Pot', 'Shovel'];
function camp(place = 'US-S6', seed = 3, gear = GEAR) { const s = E.newGame(place, gear, { seed, weight: 200 }); E.beginDay(s); s.event = null; s.storm = s.rain = s.fog = s.wind = s.snowfall = false; s.stores = []; s.firewood = 20; return s; }
const rate = (n, f) => { let k = 0; for (let i = 0; i < n; i++) if (f(i)) k++; return k / n; };
const notes = s => ((s.sys && s.sys.notes) || []).map(n => n.text).join(' | ');
{ // the notebook records what you ate and what happened
  const s = camp(); s.fire = true; s.stores = [{ id: 'mushrooms', por: 1, left: 3, smoked: false, tox: true, look: 'brown cap, white gills, a ring on the stem' }]; s.event = null; E.endDay(s);
  check('bad mushrooms make you sick', s.conditions.some(c => /Mushroom/.test(c.name))); check('and the notebook says what they looked like', /brown cap, white gills/.test(notes(s)), notes(s));
  const t = camp(); t.fire = true; t.stores = [{ id: 'mushrooms', por: 1, left: 3, smoked: false, look: 'orange cap, ridges not gills' }]; t.event = null; E.endDay(t); check('good ones are noted too', /orange cap.*No trouble/.test(notes(t)), notes(t));
}
{ // look-alike plants: rushed picking sometimes brings home the wrong one; looking closely mostly prevents it
  const wrong = closely => rate(3000, i => { const s = camp('US-S8', 100 + i); s.hours = 1; s.phase = 0; if (closely) E.act(s, 'inspect'); E.act(s, 'roots'); return s.stores.some(x => x.tox); });
  const rushed = wrong(false), careful = wrong(true); check('rushed: about 3% look-alikes', rushed > 0.015 && rushed < 0.045, rushed); check('looking closely: far fewer', careful < rushed / 3, [rushed, careful]);
  const s = camp(); s.fire = true; s.stores = [{ id: 'roots', por: 1, left: 5, smoked: false, tox: true, look: 'a root like the others, but paler' }]; s.event = null; E.endDay(s);
  check('eating one poisons you, and it is named', s.conditions.some(c => /look-alike/.test(c.name)) && /paler/.test(notes(s)), notes(s));
}
{ // unknown berries: eat now, test for a day (it can lie), or leave
  const ev = s => { s.event = { id: 'strangeberries', optIds: [0, 1, 2] }; };
  const sick = rate(1500, i => { const s = camp('US-S6', 300 + i); ev(s); E.choose(s, 0); return s.conditions.some(c => /strange berries/.test(c.name)); }); check('eating straight off the bush: sick about a third of the time', Math.abs(sick - 0.35) < 0.04, sick);
  let right = 0, n = 0; for (let i = 0; i < 1500; i++) { const s = camp('US-S6', 600 + i); s.hours = 1; s.phase = 0; ev(s); E.choose(s, 1); const safe = s.sys.plantTest.safe; s.event = null; s.today.early = { kcal: 1e6, units: {}, types: [], lean: 0, fat: 0, protein: 0 }; E.endDay(s); E.beginDay(s); const kept = s.stores.some(x => x.id === 'berries'); n++; if (kept === safe) right++; }
  check('a day of testing is right about 75% of the time, never certain', Math.abs(right / n - 0.75) < 0.04, right / n);
  const s = camp(); s.hours = 1; s.phase = 0; ev(s); E.choose(s, 1); check('testing takes the rest of the day', s.hours >= E.dayHours(s) - 0.01);
}
{ // cold creeps up: shivering, then clumsy hands, then a strange warmth
  const s = camp('AU-S4', 9, ['Knife']); s.day = 50; for (let i = 0; i < 3; i++) { s.fire = false; s.wet = 0.8; s.shelterLvl = 0; s.stores = [{ id: 'ration', por: 30, left: Infinity, smoked: false }]; s.event = null; E.endDay(s); E.beginDay(s); s.event = null; s.day = 50 + i + 1; }
  const all = s.log.flatMap(d => d.lines.map(l => l[0])).join(' '); check('first shivering', /Shivering so hard/.test(all)); check('then clumsy hands', /hands have gone stupid/.test(all)); check('then a strange warmth', /strange warmth/.test(all)); check('noted', /strange warmth/.test(notes(s)));
  const f = camp(); f.sys.clumsyDay = f.day; const g = camp(); check('clumsy hands make a fire harder to light', E.fireOdds(f) < E.fireOdds(g), [E.fireOdds(g), E.fireOdds(f)]);
}
{ // smoke in a shut cabin with no chimney: headaches first, and worse when it is sealed tight
  const ache = (seal, mat) => rate(1500, i => { const s = camp('US-S6', 900 + i); s.shelterType = 'cabin'; s.shelterLvl = 3; s.fire = true; s.fireInside = true; s.sys.seal = seal; s.sys.mat = mat; s.stores = [{ id: 'ration', por: 30, left: Infinity, smoked: false }]; E.endDay(s); return s.today.night.some(l => /dull headache|pounding head/.test(l[0])); });
  check('a sealed cabin with a fire and no chimney gives headaches', ache(0.9, null) > 0.25); check('a draughty one does not', ache(0, null) === 0);
  const bad = rate(3000, i => { const s = camp('US-S6', 4000 + i); s.shelterType = 'cabin'; s.shelterLvl = 3; s.fire = true; s.fireInside = true; s.sys.seal = 0.9; s.sys.mat = 'tight'; s.stores = [{ id: 'ration', por: 30, left: Infinity, smoked: false }]; E.endDay(s); return s.today.night.some(l => /pounding head/.test(l[0])); }); check('sealed and shut tight: now and then much worse', bad > 0.03 && bad < 0.08, bad);
}
{ // a shadow stick gives a heading for the day; the moss rule tells you nothing
  const lost = (stick, moss) => rate(4000, i => { const s = camp('US-S6', 7000 + i); s.hours = 1; s.phase = 0; if (stick) E.act(s, 'shadow_stick'); if (moss) E.act(s, 'moss'); s.fog = true; return E.bearings(s, 0, true, true).length > 0; });
  const plain = lost(false, false), stick = lost(true, false), moss = lost(false, true); check('a shadow stick this morning cuts getting lost by three quarters', stick < plain * 0.4, [plain, stick]); check('moss does not help', moss > plain * 0.8, [plain, moss]);
  const f = camp(); f.fog = true; check('no shadow without sun', !E.available(f, 'shadow_stick').ok);
}
console.log(fails ? `${fails} check(s) failed, ${passes} passed.` : `All ${passes} checks passed.`); process.exit(fails ? 1 : 0);
