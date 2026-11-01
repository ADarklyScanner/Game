// Rules for keeping food: drying, smoking, fat and pemmican.  node food.js
const { loadGame } = require('./load-game'); const E = loadGame(process.env.GAME_FILE || undefined); const D = E.DATA;
let fails = 0, passes = 0; const check = (name, ok, detail) => { if (ok) passes++; else { fails++; console.log('FAIL', name, detail ?? ''); } };
const GEAR = ['Pot', 'Fishing gear', 'Ferro rod', 'Sleeping bag', 'Saw', 'Axe', 'Knife', 'Paracord', 'Gillnet', 'Rations'];
// a camp at dawn with a fire, a rack and a smoker, in a mild place; weather set by hand
function camp(opts = {}) {
  const s = E.newGame(opts.place || 'US-S2', opts.gear || GEAR, { seed: opts.seed || 5, weight: 200 });
  E.beginDay(s); s.event = null; s.storm = s.rain = s.fog = s.snowfall = s.wind = s.heat = false;
  s.fire = true; s.firewood = 20; s.mats.poles = 20; s.mats.cordage = 20; s.mats.boughs = 0; s.stores = [];
  return s;
}
const add = (s, id, por, extra = {}) => { s.stores.push(Object.assign({ id, por, left: 4, smoked: false }, extra)); };
const kcal = s => s.stores.reduce((a, x) => a + x.por * D.foods[x.id].kcal, 0);
// the tests feed the character separately, so only the food rules act on the stores
const fed = s => { s.today.early = { kcal: 1e6, units: {}, types: [], lean: 0, fat: 0, protein: 0, rawMeat: false, oldMeat: false, tox: false, hard: false }; };
const endDay = s => { fed(s); E.endDay(s); };
const night = s => { endDay(s); E.beginDay(s); s.event = null; };
const keepWeather = (s, w) => { s.storm = s.rain = s.fog = s.snowfall = s.wind = s.heat = false; Object.assign(s, w || {}); s.fire = true; };

{ // a drying rack is built from poles and cordage; boughs or a tarp give it a roof
  const s = camp(); s.mats.boughs = 4; E.act(s, 'craft_rack');
  check('rack built', s.crafts.rack === 1); check('rack roofed with boughs', s.sys.rackRoof === true && s.mats.boughs === 0);
  const t = camp(); E.act(t, 'craft_rack'); check('rack without boughs has no roof', t.crafts.rack === 1 && t.sys.rackRoof === false);
  t.mats.boughs = 5; check('roof can be added later', E.available(t, 'craft_rack').ok); E.act(t, 'craft_rack'); check('roof added later', t.sys.rackRoof === true && t.mats.boughs === 1);
}
{ // fresh meat dries on a roofed rack in a few dry days, then keeps for months
  const s = camp(); s.mats.boughs = 4; E.act(s, 'craft_rack'); add(s, 'hare', 5);
  E.act(s, 'dry_food'); const hung = s.stores.filter(x => x.where === 'rack');
  check('meat hung on the rack', hung.length === 1 && hung[0].moist > 0.7);
  let days = 0; while (s.stores.some(x => x.where) && days < 20) { keepWeather(s); night(s); keepWeather(s); days++; }
  const x = s.stores.find(x => x.id === 'hare');
  check('dries in 2 to 6 dry days', days >= 2 && days <= 6, `took ${days}`);
  check('dried meat keeps for months', x && x.dried && x.left >= 100, x && x.left);
  check('drying keeps the calories (minus nothing)', x && Math.abs(x.por - 5) < 0.01, x && x.por);
}
{ // the rack holds 12 portions; extra stays in the stores
  const s = camp(); E.act(s, 'craft_rack'); add(s, 'hare', 20); E.act(s, 'dry_food');
  check('rack capacity 12', Math.abs(E.onStation(s, 'rack') - 12) < 0.01, E.onStation(s, 'rack'));
  check('the rest stays fresh in the stores', s.stores.some(x => x.id === 'hare' && !x.where && Math.abs(x.por - 8) < 0.01));
  check('nothing lost when splitting', Math.abs(kcal(s) - 20 * D.foods.hare.kcal) < 1);
}
{ // TEST_S1_01, adapted: rain on an open rack wets the meat again and it spoils instead of drying
  const s = camp(); E.act(s, 'craft_rack'); add(s, 'hare', 4); E.act(s, 'dry_food');
  const m0 = s.stores.find(x => x.where).moist; keepWeather(s, { rain: true }); endDay(s);
  const x = s.stores.find(x => x.where); check('rain raises moisture on an open rack', x && x.moist > m0, x && x.moist);
  check('the night log says so', s.today.night.some(l => /Rain on the open rack/.test(l[0])));
  let n = 0; E.beginDay(s); s.event = null; while (s.stores.some(x => x.where) && n < 10) { keepWeather(s, { rain: true }); night(s); n++; }
  check('wet meat on an open rack spoils before it dries', !s.stores.some(x => x.id === 'hare' && x.dried), JSON.stringify(s.stores));
}
{ // TEST_S1_06, adapted: smoke alone does not keep meat. The smoker going cold leaves wet, smoky meat with only a few days
  const s = camp(); s.crafts.smoker = 2; add(s, 'trout', 4); E.act(s, 'smoke');
  const x = s.stores.find(x => x.where === 'smoker'); check('meat in the smoker', !!x);
  check('hot smoke gives a few safe days at once', x.left >= 4);
  s.firewood = 0; keepWeather(s); endDay(s); // the fire burns its first night on what it was given, then goes out
  const y = s.stores.find(x => x.id === 'trout'); check('smoke is on the surface', y.smoke >= 0.5); check('but it is not dry yet', !y.dried && y.moist > 0.15, y.moist);
  check('so it does not keep for months', y.left < 10, y.left);
}
{ // the smoker dries faster than the rack and keeps flies off
  const s = camp({ place: 'US-S12' }); s.crafts.smoker = 2; add(s, 'catfish', 6); E.act(s, 'smoke'); let days = 0;
  while (s.stores.some(x => x.where) && days < 10) { keepWeather(s); night(s); keepWeather(s); if (E.available(s, 'smoke').ok) E.act(s, 'smoke'); days++; }
  const x = s.stores.find(x => x.id === 'catfish'); check('smoker dries in 2 to 4 days', days >= 2 && days <= 4, days);
  check('smoked and dried', x && x.dried && x.smoked);
  check('no fly losses in the smoker', !s.log.some(d => d.lines.some(l => /Flies found/.test(l[0]))));
}
{ // rendering fat: a pot keeps more than a flat stone, and tallow keeps for months
  const s = camp(); add(s, 'fat', 4, { left: 3 }); E.act(s, 'render_fat'); const f = s.stores.find(x => x.id === 'fat');
  check('rendered with a pot', f.rendered && Math.abs(f.por - 3.4) < 0.01 && f.left >= 90, JSON.stringify(f));
  const t = camp({ gear: ['Ferro rod', 'Axe', 'Knife'] }); add(t, 'fat', 4); E.act(t, 'render_fat'); const g = t.stores.find(x => x.id === 'fat');
  check('rendered on a stone loses more', g.rendered && Math.abs(g.por - 2.6) < 0.01, g.por);
}
{ // TEST_S1_02, adapted: valid pemmican from dried meat and rendered fat keeps forever and keeps the calories
  const s = camp(); add(s, 'hare', 4, { dried: true, moist: 0.12, left: 120 }); add(s, 'fat', 2, { rendered: true, left: 90 }); const k0 = kcal(s);
  check('pemmican available', E.available(s, 'craft_pemmican').ok); E.act(s, 'craft_pemmican');
  const p = s.stores.find(x => x.id === 'pemmican'); check('pemmican made', !!p); check('pemmican keeps forever', p && p.left === Infinity);
  check('calories kept, not made', Math.abs(kcal(s) - k0) < D.foods.pemmican.kcal * 0.05 + 1, `${k0} -> ${kcal(s)}`);
}
{ // TEST_S1_03, adapted: wet meat is turned away with a clear reason and nothing is used up
  const s = camp(); add(s, 'hare', 5, { where: 'rack', moist: 0.45, smoke: 0, left: 4 }); add(s, 'fat', 2, { rendered: true, left: 90 }); const before = JSON.stringify(s.stores);
  const av = E.available(s, 'craft_pemmican'); check('pemmican refused for wet meat', !av.ok && /too wet \(45% water\)/.test(av.why), av.why);
  E.act(s, 'craft_pemmican'); check('nothing used up', JSON.stringify(s.stores) === before);
  const t = camp(); add(t, 'hare', 4, { dried: true, moist: 0.12, left: 120 }); add(t, 'fat', 2, { left: 3 });
  check('raw fat must be rendered first', /render/i.test(E.available(t, 'craft_pemmican').why), E.available(t, 'craft_pemmican').why);
}
{ // older saves: smoked meat from before counts as dried and still makes pemmican
  const s = camp(); add(s, 'hare', 4, { smoked: true, left: 25 }); add(s, 'fat', 2, { rendered: true, left: 90 });
  check('legacy smoked meat counts as dried', E.isDry(s.stores[0])); check('and makes pemmican', E.available(s, 'craft_pemmican').ok);
  const t = camp(); t.sys = 'broken'; check('a broken extension is reset, not a crash', E.sysOf(t).schema === 1);
}
{ // moving camp takes the rack down; the food comes along
  const s = camp(); E.act(s, 'craft_rack'); add(s, 'hare', 4); E.act(s, 'dry_food'); const k0 = kcal(s); E.moveCamp(s, 500);
  check('rack gone after moving', !s.crafts.rack && !s.stores.some(x => x.where)); check('food carried along', Math.abs(kcal(s) - k0) < 1);
}
{ // frozen weather: meat on the rack does not spoil while it slowly dries
  const s = camp({ place: 'AU-S4' }); E.act(s, 'craft_rack'); add(s, 'pike', 4, { left: 8 }); E.act(s, 'dry_food'); const T = E.temperature(s);
  for (let i = 0; i < 5; i++) { keepWeather(s); night(s); }
  const x = s.stores.find(x => x.id === 'pike'); check('frozen meat on the rack has not spoiled', T > -3 || (x && x.left >= 8), `T=${T} left=${x && x.left}`);
}
console.log(fails ? `${fails} food check(s) failed, ${passes} passed.` : `All ${passes} food checks passed.`); process.exit(fails ? 1 : 0);
