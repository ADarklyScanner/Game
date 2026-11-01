// Water, hygiene and waste: salvaged cans, hands after butchery, gut piles.  node hygiene.js
const { loadGame } = require('./load-game'); const E = loadGame(process.env.GAME_FILE || undefined);
let fails = 0, passes = 0; const check = (name, ok, detail) => { if (ok) passes++; else { fails++; console.log('FAIL', name, detail ?? ''); } };
const GEAR = ['Axe', 'Ferro rod', 'Knife', 'Sleeping bag', 'Paracord', 'Fishing gear', 'Pot', 'Shovel'];
function camp(gear = GEAR, seed = 3) { const s = E.newGame('US-S2', gear, { seed, weight: 200 }); E.beginDay(s); s.event = null; s.storm = s.rain = s.fog = s.wind = false; s.fire = true; s.firewood = 10; s.stores = [{ id: 'ration', por: 30, left: Infinity, smoked: false }]; return s; }
const rate = (n, f) => { let k = 0; for (let i = 0; i < n; i++) if (f(i)) k++; return k / n; };
const sickWith = (s, re) => s.conditions.some(c => re.test(c.name));

{ // the plan's test: boiling kills germs but not what a salvaged can used to hold
  const sick = (boiled, scrubbed) => rate(800, i => { const s = camp(GEAR, 100 + i); s.sys.taint = 1; s.potWater = 2; s.boiled = boiled ? 2 : 0; if (scrubbed) s.sys.taint = 0; E.endDay(s); return sickWith(s, /salvaged can/); });
  const raw = sick(false), boiled = sick(true), clean = sick(true, true);
  check('a tainted can makes you sick sometimes', raw > 0.015 && raw < 0.08, raw); check('boiling does not help', boiled > 0.015, boiled); check('a scrubbed can is safe', clean === 0, clean);
  const g = camp(); g.sys.taint = 1; check('scrubbing needs a fire', E.available(g, 'scrub').ok); E.act(g, 'scrub'); check('scrubbed clean', g.sys.taint === 0);
}
{ // the plan's test: soap after butchery takes the risk to zero; cold water alone does not quite
  const sick = gear => rate(1500, i => { const s = camp(gear, 300 + i); s.raw = [{ id: 'hare', por: 2, left: 2 }]; E.act(s, 'clean'); s.event = null; E.endDay(s); return sickWith(s, /dirty hands/); });
  const soap = sick([...GEAR, 'Soap']), plain = sick(GEAR); check('with soap: no risk', soap === 0, soap); check('without soap: a small risk', plain > 0 && plain < 0.03, plain);
}
{ // gut piles: game guts make a pile, fish guts do not; a pile draws raiders; burying it fixes that
  const f = camp(); f.raw = [{ id: 'trout', por: 2, left: 2 }]; E.act(f, 'clean'); check('fish guts make no pile', !(f.sys.offal > 0), f.sys.offal);
  const h = camp(); h.raw = [{ id: 'hare', por: 2, left: 2 }, { id: 'grouse', por: 1, left: 2 }]; E.act(h, 'clean'); check('mammal and bird guts make a pile', h.sys.offal === 1, h.sys.offal);
  const raided = pile => rate(1500, i => { const s = camp(GEAR, 600 + i); s.stores.push({ id: 'hare', por: 6, left: 4, smoked: false }); s.sys.offal = pile; E.endDay(s); return s.today.night.some(l => /got into the food/.test(l[0])); });
  const none = raided(0), big = raided(6); check('a gut pile at camp draws raiders', big > none * 1.5, [none, big]);
  const b = camp(); b.sys.offal = 4; check('burying is offered', E.available(b, 'bury').ok); E.act(b, 'bury'); check('a proper pit with a shovel clears it', b.sys.offal === 0);
  const nb = camp(['Ferro rod', 'Knife']); nb.sys.offal = 4; E.act(nb, 'bury'); check('a scrape by hand only partly clears it', nb.sys.offal > 0 && nb.sys.offal < 2, nb.sys.offal);
  const d = camp(); d.sys.offal = 4; for (let i = 0; i < 10; i++) { d.event = null; E.endDay(d); E.beginDay(d); d.event = null; } check('an unburied pile fades within about ten days', !(d.sys.offal > 0.5), d.sys.offal);
}
console.log(fails ? `${fails} hygiene check(s) failed, ${passes} passed.` : `All ${passes} hygiene checks passed.`); process.exit(fails ? 1 : 0);
