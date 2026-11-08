// Big game by sex, age and condition, and bears by kind.  node beasts.js
const { loadGame } = require('./load-game'); const E = loadGame(process.env.GAME_FILE || undefined); const D = E.DATA;
let fails = 0, passes = 0; const check = (name, ok, detail) => { if (ok) passes++; else { fails++; console.log('FAIL', name, detail ?? ''); } };
const GEAR = ['Axe', 'Ferro rod', 'Knife', 'Sleeping bag', 'Bow and arrows', 'Pot', 'Saw'];
function camp(place, seed = 3, day = 5) { const s = E.newGame(place, GEAR, { seed, weight: 200 }); E.beginDay(s); s.event = null; s.day = day; return s; }

{ // every big game animal in the data has kinds, and the kinds average out near the book weight
  const bigIds = new Set(D.seasons.flatMap(se => se.big || []));
  for (const id of bigIds) {
    check(`${id} has sex and age classes`, !!E.BEASTS[id]);
    const ks = E.BEASTS[id] || []; const w = ks.reduce((a, k) => a + k.w, 0), m = ks.reduce((a, k) => a + k.w * k.m, 0);
    check(`${id} weights add to 1`, Math.abs(w - 1) < 1e-9, w); check(`${id} average weight near the book`, m > 0.85 && m < 1.05, m);
  }
}
{ // a run of kills rolls a mix, and the same animal rolls the same all day
  const s = camp('US-S6'); const seen = {}; for (let i = 0; i < 600; i++) { const b = E.rollBeast(s, 'moose', 'a' + i); seen[b.k] = (seen[b.k] || 0) + 1; }
  check('bulls, cows and yearlings all turn up', seen.bull > 100 && seen.cow > 200 && seen.yearling > 80, JSON.stringify(seen));
  check('the same animal is the same animal', JSON.stringify(E.rollBeast(s, 'moose', 'x')) === JSON.stringify(E.rollBeast(s, 'moose', 'x')));
  const rng = s.rng; E.rollBeast(s, 'moose', 'y'); check('rolling an animal does not touch the run dice', s.rng === rng);
}
{ // condition: fat in the fall, thin by late winter; bulls run themselves down in the rut
  const fat = (place, day, filter = () => true) => { const s = camp(place, 7, day); s.windows = []; let n = 0, t = 0; for (let i = 0; i < 800; i++) { const b = E.rollBeast(s, 'moose', 'c' + i); if (!filter(b)) continue; t++; if (b.cond === 'fat' || b.cond === 'good') n++; } return n / t; };
  check('moose are mostly in good flesh early', fat('US-S6', 10) > 0.85, fat('US-S6', 10));
  check('and mostly thin by late winter', fat('US-S6', 110) < 0.15, fat('US-S6', 110));
  const s = camp('US-S6', 7, 40); s.windows = [{ id: 'rut', from: 25, to: 31 }]; let bulls = 0, lean = 0, cows = 0, cowsOk = 0;
  for (let i = 0; i < 800; i++) { const b = E.rollBeast(s, 'moose', 'r' + i); if (b.k === 'bull') { bulls++; if (b.cond === 'lean' || b.cond === 'poor') lean++; } if (b.k === 'cow') { cows++; if (b.cond === 'fat' || b.cond === 'good') cowsOk++; } }
  check('bulls after the rut are mostly lean', lean / bulls > 0.7, lean / bulls); check('cows after the rut are still mostly fine', cowsOk / cows > 0.7, cowsOk / cows);
  s.day = 28; check('a bull in the rut window is rutting', E.rollBeast(s, 'moose', Array.from({ length: 50 }, (_, i) => i).find(i => E.rollBeast(s, 'moose', i).k === 'bull')).rutting === true);
  s.day = 80; const bull = E.rollBeast(s, 'moose', Array.from({ length: 50 }, (_, i) => i).find(i => E.rollBeast(s, 'moose', i).k === 'bull')); check('moose bulls drop their antlers in early winter', !bull.antler && bull.dropped);
}
{ // yield follows kind and condition
  const f = D.foods.moose; const y = (k, cond) => E.beastYield(f, { m: E.BEASTS.moose.find(x => x.k === k).m, cond }, 1);
  check('a bull carries more than a yearling', y('bull', 'good').por > 1.8 * y('yearling', 'good').por);
  check('a fat cow has far more fat than a thin one', y('cow', 'fat').fat > 5 * y('cow', 'poor').fat, [y('cow', 'fat').fat, y('cow', 'poor').fat]);
}
{ // a kill in front of you keeps what you saw on the map
  let got = null; for (let i = 0; i < 400 && !got; i++) { const s = camp('US-S6', 50 + i, 12); s.hours = 2; s.phase = 0; const b = E.rollBeast(s, 'moose', 'map' + i); const L = E.act(s, 'hunt', { extra: { target: 'moose', hit: 'good', size: 1, beast: b } }); if (s.carcass) got = { s, b, L }; }
  check('a moose went down in a few hundred tries', !!got);
  if (got) { check('the carcass is the animal you drew on', got.s.carcass.beast && got.s.carcass.beast.label === got.b.label); check('the kill line names it', got.L.some(l => l[0].includes(got.b.label)), JSON.stringify(got.L)); }
}
{ // bears: no generic bear anywhere; the right bears in the right places
  check('no generic "bear" left in any place', D.seasons.every(se => !se.predators.some(p => p[0] === 'bear')));
  const kinds = (place) => { const set = new Set(); for (let i = 0; i < 300; i++) { const s = camp(place, 900 + i); const b = E.bearInfo(s, 'camp'); if (b) set.add(b.kind); } return set; };
  check('Vancouver Island has black bears only', [...kinds('US-S1')].join() === 'black bear', [...kinds('US-S1')]);
  const ch = kinds('US-S8'); check('Chilko Lake has grizzlies and black bears', ch.has('grizzly') && ch.has('black bear'), [...ch]);
  check('Sapmi has brown bears', [...kinds('AU-S4')].join() === 'brown bear', [...kinds('AU-S4')]);
  check('Tasmania has no bears', kinds('AU-S1').size === 0);
  const coats = new Set(); for (let i = 0; i < 300; i++) coats.add(E.bearInfo(camp('US-S10', 400 + i), 'camp').coat); check('black bears come in black, brown and cinnamon', coats.has('black') && coats.has('brown-phase') && coats.has('cinnamon'), [...coats]);
  const coast = new Set(); for (let i = 0; i < 200; i++) coast.add(E.bearInfo(camp('US-S2', 400 + i), 'camp').coat); check('coastal black bears are black', [...coast].join() === 'black', [...coast]);
  const s = camp('US-S8', 11); check('one bear stays the same bear through the day', E.bearInfo(s, 'kill').name === E.bearInfo(s, 'kill').name);
}
console.log(`beasts: ${passes} passed, ${fails} failed`); if (fails) process.exit(1);
