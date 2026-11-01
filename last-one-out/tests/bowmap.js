// A bow of your own, cairns, and finding your way.  node bowmap.js
const { loadGame } = require('./load-game'); const E = loadGame(process.env.GAME_FILE || undefined);
let fails = 0, passes = 0; const check = (name, ok, detail) => { if (ok) passes++; else { fails++; console.log('FAIL', name, detail ?? ''); } };
const GEAR = ['Axe', 'Ferro rod', 'Knife', 'Sleeping bag', 'Paracord', 'Fishing gear', 'Pot'];
function camp(seed = 3, gear = GEAR) { const s = E.newGame('US-S6', gear, { seed, weight: 200 }); E.beginDay(s); s.event = null; s.storm = s.rain = s.fog = s.wind = s.snowfall = false; s.stores = [{ id: 'ration', por: 30, left: Infinity, smoked: false }]; s.mats.poles = 4; s.mats.cordage = 6; return s; }
const rate = (n, f) => { let k = 0; for (let i = 0; i < n; i++) if (f(i)) k++; return k / n; };
{ // carving a bow: a stave, then tiller and string
  const s = camp(); check('no bow to start', !E.hasBow(s)); check('carving offered', E.available(s, 'craft_bow').ok); E.act(s, 'craft_bow'); check('first session uses a pole', s.crafts.bow === 1 && s.mats.poles === 3 && !E.hasBow(s));
  s.hours = 1; s.phase = 0; s.event = null; E.act(s, 'craft_bow'); check('second session strings it', E.hasBow(s) && s.mats.cordage === 4 && s.arrows === 0);
  check('arrows can be made for it', E.available(Object.assign(s, { mats: Object.assign(s.mats, { feathers: 1 }) }), 'craft_arrows').ok);
  check('no carving without a knife', !E.available(camp(3, ['Ferro rod', 'Axe']), 'craft_bow').ok);
  check('not needed if you brought one', !E.available(camp(3, [...GEAR, 'Bow and arrows']), 'craft_bow').ok);
  const uneven = rate(800, i => { const t = camp(100 + i); t.crafts.bow = 1; E.act(t, 'craft_bow'); return t.sys.tiller < 1; }); check('a first bow often comes out uneven', uneven > 0.35 && uneven < 0.55, uneven);
}
{ // the plan's test: uneven limbs cost a quarter of the bow's cast; re-tillering can fix it
  const odds = tiller => { const s = camp(); s.crafts.bow = 2; s.sys.tiller = tiller; s.arrows = 10; return E.huntOdds(s); };
  check('uneven limbs: 25% less', Math.abs(odds(0.75) / odds(1) - 0.75) < 0.01, [odds(1), odds(0.75)]);
  const bought = (() => { const s = camp(3, [...GEAR, 'Bow and arrows']); return E.huntOdds(s); })(); check('a homemade bow casts a little weaker than a bought one', odds(1) < bought && odds(1) > bought * 0.8, [bought, odds(1)]);
  const fixed = rate(800, i => { const t = camp(300 + i); t.crafts.bow = 2; t.sys.tiller = 0.75; E.act(t, 'tiller_bow'); return t.sys.tiller === 1; }); check('re-tillering fixes it about 60% of the time', Math.abs(fixed - 0.6) < 0.06, fixed);
  const t = camp(); t.crafts.bow = 2; t.sys.tiller = 1; check('an even bow needs no re-tiller', !E.available(t, 'tiller_bow').ok);
}
{ // cairns and finding your way
  const s = camp(); s.mats.stone = 4; check('a cairn takes 4 stones', E.available(s, 'cairn').ok); E.act(s, 'cairn', { extra: { x: 100, y: 200 } }); check('cairn stored where it was built', s.sys.cairns.length === 1 && s.sys.cairns[0].x === 100 && s.mats.stone === 0);
  check('the plan\'s test: two landmarks in sight, no drift', E.driftChance(2, true, true) === 0); check('one in sight: some drift', E.driftChance(1, true, true) > 0 && E.driftChance(1, true, true) < E.driftChance(0, true, true));
  check('clear weather: no drift', E.driftChance(0, true, false) === 0); check('near camp: no drift', E.driftChance(0, false, true) === 0);
  const lost = rate(3000, i => E.bearings(camp(500 + i), 0, true, true).length > 0); check('lost in fog with nothing to steer by about 8% per 100 m', Math.abs(lost - 0.08) < 0.02, lost);
  let t = null; for (let i = 0; i < 400 && !t; i++) { const c = camp(900 + i); c.hours = 1; c.phase = 0; const h0 = c.hours; if (E.bearings(c, 0, true, true).length) t = { h0, h1: c.hours }; } check('getting lost costs half an hour', t && Math.abs(t.h1 - t.h0 - 0.5) < 0.01, t);
}
console.log(fails ? `${fails} bow/map check(s) failed, ${passes} passed.` : `All ${passes} bow/map checks passed.`); process.exit(fails ? 1 : 0);
