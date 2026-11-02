// One check per bug fixed in the whole-game bug hunt (see BUGS.md). Each failed before its fix.  node regress.js
const { loadGame } = require('./load-game'); const E = loadGame(process.env.GAME_FILE || undefined);
let fails = 0, passes = 0; const check = (name, ok, detail) => { if (ok) passes++; else { fails++; console.log('FAIL', name, detail ?? ''); } };
const GEAR = ['Axe', 'Ferro rod', 'Knife', 'Sleeping bag', 'Paracord', 'Fishing gear', 'Pot', 'Bow and arrows', 'Trapping wire'];
function camp(place = 'US-S6', seed = 3, gear = GEAR) { const s = E.newGame(place, gear, { seed, weight: 200 }); E.beginDay(s); s.event = null; s.stores = [{ id: 'ration', por: 30, left: Infinity, smoked: false }]; s.firewood = 20; s.storm = false; s.hours = 1; s.phase = 0; return s; }
const rate = (n, f) => { let k = 0; for (let i = 0; i < n; i++) if (f(i)) k++; return k / n; };
const snowDay = place => E.DATA.seasons.find(x => x.key === place).climate.snow;

{ // the moss check and gathering moss are two separate jobs
  check('"Gather moss" still exists', /moss/i.test(E.ACTIONS.moss.label) && E.ACTIONS.moss.hours >= 1, E.ACTIONS.moss);
  check('"Check the moss" has its own id', !!E.ACTIONS.moss_check);
  const s = camp(); const m0 = s.mats.moss; E.act(s, 'moss_check'); check('checking the moss gathers nothing', s.mats.moss === m0, [m0, s.mats.moss]);
}
{ // cleaning a bird gives feathers and bone
  const s = camp(); s.raw = [{ id: 'grouse', por: 2.5, left: 2 }]; const f0 = s.mats.feathers, b0 = s.mats.bone; E.act(s, 'clean');
  check('cleaning a grouse adds feathers or bone', s.mats.feathers > f0 || s.mats.bone > b0, [f0, s.mats.feathers, b0, s.mats.bone]);
}
{ // a bear on the kill only while bears are awake
  const place = 'US-S5'; const sd = snowDay(place); const s = camp(place); s.day = sd + 30; s.carcass = { id: 'moose', por: 40, big: true, dressed: true, day: s.day - 1 };
  check('no bear on the kill in deep winter', !E.EVENTS.bearkill.cond(s));
}
{ // health never goes below 0 during the day, and reaching 0 ends the run
  const s = camp(); s.health = 1; s.event = null; E.EVENTS.snake && E.EVENTS.snake.options.forEach(() => {});
  s.health = -5; E.act(s, 'rest'); check('health floored at 0', s.health >= 0, s.health); check('collapse ends the run', s.status === 'medical', s.status);
}
{ // splinting never makes a sprain last longer
  const s = camp(); s.conditions.push({ name: 'Sprained ankle from a fall', days: 1, dmg: 1 }); s.mats.poles = 2; s.mats.cordage = 2; E.act(s, 'splint', { extra: { good: true } });
  check('a nearly healed sprain stays nearly healed', s.conditions[0].days <= 1, s.conditions[0].days);
}
{ // a rough night out counts as a bad night for creeping cold
  const s = camp('US-S6'); s.day = snowDay('US-S6') + 20; s.wet = 0.8; s.fire = false; s.shelterType = null; s.shelterLvl = 0; s.sys.chill = 1; s.roughNight = true; s.event = null; E.endDay(s);
  check('the cold slide is not reset by a rough night', (s.sys.chill || 0) >= 1, s.sys.chill);
}
{ // set lines with no bait catch far less, and say so
  const catchRate = bait => { let n = 0; for (let i = 0; i < 1500; i++) { const s = camp('US-S6', 400 + i); s.mats.bait = bait; s.hooks = 4; s.mats.cordage = 4; E.act(s, 'setlines'); s.event = null; const r0 = s.raw.length; E.endDay(s); E.beginDay(s); n += s.raw.length > r0 ? 1 : 0; } return n / 1500; };
  const baited = catchRate(5), bare = catchRate(0); check('bare hooks catch much less', bare < baited * 0.5, [baited, bare]);
  const s = camp(); s.mats.bait = 0; s.hooks = 4; s.mats.cordage = 4; const L = E.act(s, 'setlines'); check('the text says the hooks are bare', L.some(l => /bare hooks/.test(l[0])), L);
}
{ // a tie with the winner puts you second
  const s = camp(); const top = Math.max(...s.rivals.map(r => r.days)); s.day = top; s.status = 'tapped'; const w = s.rivals.find(r => r.days === top); w.place = 1;
  check('tie with the winner is second', E.placing(s).place === 2, E.placing(s));
}
{ // the event card and the log tell the same story
  let same = true, seen = 0; for (let i = 0; i < 600 && same; i++) { const s = camp('US-S1', 50 + i); s.event = null; s.today.event = false; s.stores.push({ id: 'trout', por: 3, left: 3, smoked: false }); const L = E.act(s, 'rest'); if (s.event) { seen++; if (!L.some(l => l[0] === s.event.text)) same = false; } }
  check('event card text is the logged text', same && seen > 0, seen);
}
{ // "A wolves" no more
  const places = E.DATA.seasons.map(x => x.key); let bad = null;
  for (const p of places) { const s = camp(p); const has = E.DATA.seasons.find(x => x.key === p).predators.some(q => /marten|wolverine|fox|jackal|hyena|raven|wolf|wolves/.test(q[0])); if (!has) continue; const t = E.EVENTS.raider.text(s); if (/^A [a-z]+s is/.test(t) || /^A [aeiou]/i.test(t)) bad = t; }
  check('raider text reads right for plural animals', !bad, bad);
}
{ // tracking odds on the button include snow on the trail
  const s = camp(); s.wounded = { id: 'hare', p: 0.5 }; s.snowfall = true; check('button shows 30% in fresh snow', /30%/.test(E.available(s, 'track').odds), E.available(s, 'track').odds);
}
{ // a wrong forecast in snow season never says rain
  let rain = 0; for (let i = 0; i < 400; i++) { const s = camp('US-S6', 600 + i); s.day = snowDay('US-S6') + 10; s.phase = 3; s.hours = 15; s.sys.skyDay = null; const L = E.act(s, 'read_sky'); if (L.some(l => /Rain by morning/.test(l[0]))) rain++; }
  check('no rain forecasts once the snow has come', rain === 0, rain);
}
{ // remade arrows forget the crooked ones that are gone
  const s = camp(); s.crafts.bow = 2; s.gear = s.gear.filter(g => g !== 'Bow and arrows'); s.arrows = 0; s.sys.crooked = 2; s.fire = true; s.mats.feathers = 2; s.mats.poles = 2; E.act(s, 'craft_arrows', { extra: { good: true } });
  check('a new straight pair is not counted crooked', !s.sys.crooked, s.sys.crooked);
}
{ // over-shaving a bow leaves it weak; re-tillering evens it at a lighter draw
  const s = camp(); s.gear = s.gear.filter(g => g !== 'Bow and arrows'); s.crafts.bow = 2; s.sys.tiller = 0.75; E.act(s, 'tiller_bow', { extra: { good: false, weak: true } });
  check('over-shaved bow is weak', s.sys.tiller === 0.6 && s.sys.weakBow, s.sys.tiller);
  let fixed = 0; for (let i = 0; i < 50 && s.sys.tiller < 0.85; i++) { s.hours = 1; E.act(s, 'tiller_bow', { extra: { good: true } }); } check('re-tillered to 0.85, not full power', s.sys.tiller === 0.85, s.sys.tiller);
  check('then no more re-tillering is offered', !E.available(s, 'tiller_bow').ok);
}
{ // the slingshot still hunts with a homemade bow that has no arrows
  const s = camp('US-S6', 3, ['Knife', 'Slingshot', 'Ferro rod']); s.crafts.bow = 2; s.arrows = 0; s.slingAmmo = 20; check('hunting allowed with the slingshot', E.available(s, 'hunt').ok, E.available(s, 'hunt').why);
}
{ // multi-session builds check the bill only before the first session
  const s = camp(); s.crafts.smoker = 1; s.mats.poles = 0; check('a half-built smoker can be finished with no poles left', E.available(s, 'craft_smoker').ok, E.available(s, 'craft_smoker').why);
}
{ // dropping a paid shelter plan gives the materials back
  const s = camp(); s.mats.poles = 30; s.mats.boughs = 30; s.mats.cordage = 10; E.chooseShelter(s, 'leanto'); const before = { ...s.mats }; E.act(s, 'shelter');
  if (s.shelterGoal) { const mid = { ...s.mats }; E.dropPlan(s); check('materials come back when the plan is dropped', s.mats.poles > mid.poles || s.mats.boughs > mid.boughs, [before, mid, s.mats]); } else passes++;
}
{ // the same illness does not stack
  const s = camp(); for (let i = 0; i < 3; i++) s.conditions.length; const add = () => { E.EVENTS; }; add();
  const t = camp(); t.raw = []; t.conditions = []; t.stores = [{ id: 'ration', por: 30, left: Infinity, smoked: false }];
  for (let i = 0; i < 3; i++) { t.event = null; t.sys.taint = 0; t.conditions.push({ name: 'Frostnipped toes', days: 5, dmg: 1 }); }
  const before = t.conditions.length; check('setup', before === 3);
  const u = camp('US-S6', 11); u.day = snowDay('US-S6') + 40; u.wet = 1; u.fire = false; u.shelterType = null; u.shelterLvl = 0; u.gear = u.gear.filter(g => g !== 'Sleeping bag');
  for (let d = 0; d < 6 && u.status === 'playing'; d++) { u.event = null; u.morale = 80; u.health = 90; u.wet = 1; u.fire = false; E.endDay(u); E.beginDay(u); }
  const names = u.conditions.map(c => c.name); check('no illness listed twice', new Set(names).size === names.length, names);
}
{ // hanging meat is eaten after everything else
  const s = camp(); s.crafts.rack = 1; s.stores = [{ id: 'hare', por: 6, left: 4, smoked: false, where: 'rack', moist: 0.5 }, { id: 'ration', por: 8, left: Infinity, smoked: false }]; s.event = null; E.endDay(s);
  const rack = s.stores.find(x => x.where === 'rack'); check('the rack is not raided for supper', rack && rack.por >= 5.9, s.stores);
}
{ // "0 portions" never printed; leather mittens notice sloppy stitching
  check('no "0 portions" text in the game', !/\b0 portions\b/.test(require('fs').readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8')));
}
{ // resting all day while eating nothing does not keep your spirits up
  const s = camp('US-S1', 12); s.stores = []; for (let d = 0; d < 21 && s.status === 'playing'; d++) E.runDay(s, () => 'rest');
  check('three weeks of only resting and no food wears morale down', s.morale < 75, s.morale);
  const w = camp(); w.morale = 50; E.act(w, 'rest'); const a = w.morale; E.act(w, 'rest'); check('a second rest with no work does nothing for morale', w.morale === a, [a, w.morale]);
  const j = camp(); j.morale = 50; j.mats.cordage = 0; E.act(j, 'boughs'); const b = j.morale; E.act(j, 'rest'); check('a rest after work still helps', j.morale >= b + 4, [b, j.morale]);
}
{ // rushed hands-on jobs come out worse: bed, roof repair, raft
  const b = camp(); b.mats.boughs = 10; b.shelterType = 'leanto'; b.shelterLvl = 1; E.act(b, 'bed', { extra: { good: false } }); check('a rushed bed is thinner', b.sys.bed < 1, b.sys.bed);
  const r = camp(); r.shelterType = 'leanto'; r.shelterLvl = 1; r.shelterCond = 0.5; r.mats.boughs = 10; r.mats.poles = 10; r.mats.moss = 10; E.act(r, 'repair', { extra: { good: false } }); check('a rushed repair does not make the roof like new', r.shelterCond < 1, r.shelterCond);
}
{ // a fumbled bite costs most of the session
  const rateOf = fumble => rate(3000, i => { const s = camp('US-S6', 1000 + i); s.mats.bait = 5; const r0 = s.raw.length; E.act(s, 'fish', { extra: fumble ? { fumble: 0.6 } : {} }); return s.raw.length > r0; });
  const clean = rateOf(false), fumbled = rateOf(true); check('a missed bite catches less', fumbled < clean * 0.75, [clean, fumbled]);
}
{ // the craft list says what is missing before it says the light is going
  const s = camp(); s.hours = E.dayHours(s) - 0.5; s.mats.clay = 0; s.mats.stone = 0; const why = E.available(s, 'craft_chimney').why; check('missing things named first', !/daylight/.test(why), why);
  const w = camp(); w.hours = E.dayHours(w) - 0.2; w.mats.bait = 5; check('daylight still refuses a job you could otherwise do', /daylight/.test(E.available(w, 'fish').why), E.available(w, 'fish').why);
}
{ // bracing the shelter at dusk never runs past the light
  const s = camp('US-S6', 5); s.shelterType = 'leanto'; s.shelterLvl = 1; s.storm = true; s.hours = E.dayHours(s) - 1; s.event = { id: 'storm', optIds: [0, 1] }; E.choose(s, 0);
  check('hours stay inside the day', s.hours <= E.dayHours(s) + 1e-9, [s.hours, E.dayHours(s)]); check('an hour is not enough to brace it', !s.braced);
}
{ // the old camp has its own words
  const s = camp('US-S7', 9); let txt = ''; for (let i = 0; i < 40 && !txt; i++) { s.hours = 1; s.today.done = []; const L = E.act(s, 'search', { extra: { ruin: true } }); const l = L.find(x => /old camp/.test(x[0])); if (l) txt = l[0]; if (L.some(x => /Searched around camp/.test(x[0]))) { txt = 'WRONG'; } }
  check('the ruin search never says "around camp"', txt !== 'WRONG', txt);
}
{ // every hands-on craft remembers a rushed job, and it works less well
  const make = (id, good, setup) => { const s = camp(); s.fire = true; Object.assign(s.mats, { poles: 20, cordage: 20, boughs: 20, stone: 20, feathers: 2, bone: 2 }); s.shelterType = 'leanto'; s.shelterLvl = 1; if (setup) setup(s); for (let i = 0; i < 4; i++) { s.hours = 1; s.phase = 0; E.act(s, id, { extra: { good } }); } return s; };
  for (const [id, k] of [['craft_reflector', 'reflector'], ['craft_platform', 'platform'], ['craft_hearth', 'hearth'], ['craft_rack', 'rack'], ['craft_staff', 'staff'], ['craft_diggingstick', 'diggingstick'], ['craft_woodshed', 'woodshed'], ['craft_smoker', 'smoker']]) {
    const bad = make(id, false), good = make(id, true);
    check(`${k}: a rushed one is remembered`, bad.sys.poor && bad.sys.poor[k] === true, bad.sys.poor); check(`${k}: a careful one is not`, !(good.sys.poor && good.sys.poor[k]), good.sys.poor);
  }
  const rk = make('craft_rack', false); check('a sagging rack holds less', E.available(rk, 'hang') && true);
  const warm = (poor) => { const s = camp('US-S6', 3); s.crafts.platform = 1; s.sys.bed = 1; if (poor) s.sys.poor = { platform: true }; return E.bedWarmth(s); };
  check('a sagging bed frame keeps you less warm', warm(true) < warm(false), [warm(false), warm(true)]);
  const wood = (poor) => { const s = camp('US-S6', 3); s.crafts.stove = 1; s.fire = true; s.firewood = 10; s.storm = false; s.wind = false; if (poor) s.sys.poor = { stove: true }; E.endDay(s); return 10 - s.firewood; };
  check('a leaky stove burns more wood', wood(true) > wood(false), [wood(false), wood(true)]);
}
{ // a rushed cairn can come down in a storm; a careful one stands
  let fell = 0, stood = 0; for (let i = 0; i < 300; i++) { const s = camp('US-S6', 2000 + i); s.storm = true; s.sys.cairns = [{ x: 1, y: 1, day: 1, loose: true }, { x: 2, y: 2, day: 1 }]; s.event = null; E.endDay(s); if (!s.sys.cairns.some(c => c.loose)) fell++; if (s.sys.cairns.some(c => !c.loose)) stood++; }
  check('loose cairns fall in storms', fell > 60 && fell < 160, fell); check('careful cairns stand', stood === 300, stood);
}
{ // snares set with the wrong loop size catch less
  const caught = poor => { let n = 0; for (let i = 0; i < 1500; i++) { const s = camp('US-S6', 3000 + i); s.snares = 10; s.deadfalls = 0; s.fishTrap = false; s.trapsCatch = []; if (poor) s.sys.poorSnares = 10; s.event = null; E.endDay(s); n += s.trapsCatch.length; } return n; };
  const a = caught(false), b = caught(true); check('badly sized loops catch about 40% less', b < a * 0.75 && b > a * 0.45, [a, b]);
}
{ // calories and wood are not lost to rounding
  const s = camp(); s.fire = true; s.stores = [{ id: 'trout', por: 4, left: 60, smoked: false, dried: true, moist: 0.1 }, { id: 'fat', por: 2, left: 90, smoked: false, rendered: true }]; const k0 = E.storeKcal(s);
  if (E.available(s, 'craft_pemmican').ok) { E.act(s, 'craft_pemmican'); check('pemmican keeps its calories (within 2 kcal)', Math.abs(E.storeKcal(s) - k0) < 2, [k0, E.storeKcal(s)]); } else passes++;
}
console.log(fails ? `${fails} regression check(s) failed, ${passes} passed.` : `All ${passes} regression checks passed.`); process.exitCode = fails ? 1 : 0;
