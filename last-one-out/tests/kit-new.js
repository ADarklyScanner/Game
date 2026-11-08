// New kit and traps: the first aid kit, the headlamp, purification tablets and the Paiute deadfall, proved with the engine.  node kit-new.js
const { loadGame } = require('./load-game'); const E = loadGame(process.env.GAME_FILE || undefined);
let fails = 0, passes = 0; const check = (name, ok, detail) => { if (ok) passes++; else { fails++; console.log('FAIL', name, detail ?? ''); } };
const KIT = ['Knife', 'Ferro rod', 'Axe', 'Fishing gear', 'Paracord'];
function base(extra = [], seed = 41, place = 'US-S6') { const s = E.newGame(place, KIT.concat(extra), { seed, weight: 200 }); s.campChosen = true; E.beginDay(s); s.event = null; s.storm = s.rain = s.fog = s.snowfall = false; s.hours = 2; s.phase = 0; return s; }
const nights = (s, n) => { for (let d = 0; d < n && s.status === 'playing'; d++) { s.event = null; E.endDay(s); if (s.status !== 'playing') break; E.beginDay(s); s.event = null; } };

{ // every new item can be picked and costs points
  for (const id of ['First aid kit', 'Headlamp', 'Water purification tablets']) { const g = E.DATA.gear.find(x => x.id === id);
    check(`${id} is in the kit list`, !!g && g.rate === 0.01 && /\.$/.test(g.effect) && !/—/.test(g.effect), g);
    check(`${id} has a cost`, E.gearCost(id) >= 1 && E.gearCost(id) <= 4, E.gearCost(id)); }
  check('the ten most common items are unchanged', E.DATA.gear.slice(0, 10).every(g => !E.VARIANT[g.id]), E.DATA.gear.slice(0, 10).map(g => g.id));
  const s = base(); check('without the items nothing is left of them', E.kitLeft(s, 'aid') === 0 && E.kitLeft(s, 'lamp') === 0 && E.kitLeft(s, 'tabs') === 0 && s.kitLeft === undefined);
  const t = base(['First aid kit', 'Headlamp', 'Water purification tablets']); check('a new run starts them full', E.kitLeft(t, 'aid') === 6 && E.kitLeft(t, 'lamp') === 28 && E.kitLeft(t, 'tabs') === 30, [E.kitLeft(t, 'aid'), E.kitLeft(t, 'lamp'), E.kitLeft(t, 'tabs')]);
  const old = JSON.parse(JSON.stringify(t)); delete old.kitLeft; check('a save with no counts reads them as full', E.kitLeft(old, 'aid') === 6 && E.kitLeft(old, 'tabs') === 30);
}

{ // the first aid kit: fewer infections, burns eased, and it runs out
  const wound = E.EVENTS.wound; const wrap = wound.options.find(o => /Wrap/.test(o.label)), dress = wound.options.find(o => /Clean and dress/.test(o.label));
  const trial = (kit, N = 600) => { let bad = 0; for (let i = 0; i < N; i++) { const s = base(kit ? ['First aid kit'] : [], 1000 + i); s.conditions.push({ name: 'Gashed shin', days: 6, dmg: 1.2, wound: true }); const L = []; wrap.go(s, L);
    for (let d = 0; d < 4; d++) { s.event = null; E.endDay(s); if (s.status !== 'playing') break; E.beginDay(s); } if (s.conditions.some(c => /Gashed shin \(infected\)/.test(c.name)) || s.status !== 'playing' && /infect/i.test(s.endReason)) bad++; } return bad; };
  const without = trial(false), withKit = trial(true);
  console.log('infections out of 600 wrapped wounds:', { without, withKit }); check('a wound wrapped with the kit goes bad far less often', withKit < without * 0.65 && without > 60, { without, withKit });
  { let bad = 0; for (let i = 0; i < 300; i++) { const s = base(['First aid kit'], 5000 + i); s.boiled = 0; s.containers = 0; s.conditions.push({ name: 'Gashed shin', days: 6, dmg: 1.2, wound: true }); dress.go(s, []); if (s.conditions.some(c => /infected/.test(c.name))) bad++; }
    check('cleaned and dressed from the kit, it never goes bad even without boiled water', bad === 0, bad); }
  const s = base(['First aid kit']); s.conditions.push({ name: 'Burned hands', days: 4, dmg: 0.8 }); s.event = null; E.endDay(s); const c = s.conditions.find(x => x.name === 'Burned hands');
  check('a burn is eased by the kit', !!c && c.dmg <= 0.4 && c.kit, c); check('and it used one dressing', E.kitLeft(s, 'aid') === 5, E.kitLeft(s, 'aid'));
  const b = base(); b.conditions.push({ name: 'Burned hands', days: 4, dmg: 0.8 }); b.event = null; E.endDay(b); check('without the kit a burn stays as it was', b.conditions.find(x => x.name === 'Burned hands').dmg === 0.8);
  const u = base(['First aid kit']); const said = [];
  for (let k = 0; k < 7; k++) { const L = []; u.conditions.push({ name: 'Cut ' + k, days: 6, dmg: 1, wound: true }); wrap.go(u, L); said.push(...L.map(x => x[0])); u.conditions = []; }
  check('the kit has six uses', E.kitLeft(u, 'aid') === 0, E.kitLeft(u, 'aid'));
  check('it says when it is running low', said.some(t => /Two dressings left/.test(t)) && said.some(t => /One dressing left/.test(t)), said.filter(t => /dressing/.test(t)));
  check('and when it is empty', said.some(t => /first aid kit is empty/.test(t)));
}

{ // the headlamp: night work and walking in the dark without a fire, until the batteries die
  const night = kit => { const s = base(kit); s.phase = 3; s.hours = E.dayHours ? E.dayHours(s) : 14; s.fire = false; s.nightHours = 0; return s; };
  const job = 'read_sky';
  const n0 = night([]); check('no fire, no lamp: no night work', !E.available(n0, job).ok && E.available(n0, job).why === 'No light to work by', E.available(n0, job));
  const n1 = night(['Headlamp']); check('the headlamp lights night work', E.available(n1, job).ok, E.available(n1, job));
  const h0 = E.kitLeft(n1, 'lamp'); E.act(n1, job); check('and burns battery hours', E.kitLeft(n1, 'lamp') < h0, [h0, E.kitLeft(n1, 'lamp')]);
  const n2 = night(['Headlamp']); n2.kitLeft = { lamp: 0 }; check('with dead batteries it is dark again', !E.available(n2, job).ok, E.available(n2, job));
  const n3 = night(['Headlamp']); n3.kitLeft = { lamp: 0.2 }; const L = E.act(n3, job); check('the batteries die with a warning', E.kitLeft(n3, 'lamp') === 0 && L.concat(n3.today.lines).some(x => /batteries are dead/.test(x[0])), L);
  const w0 = night([]), w1 = night(['Headlamp']); const hp0 = w0.health, hp1 = w1.health, m1 = w1.morale; E.travel(w0, 1500); E.travel(w1, 1500);
  check('walking in the dark costs you', w0.health < hp0, [hp0, w0.health]); check('walking by headlamp does not', w1.health === hp1 && w1.morale === m1, [w1.health, w1.morale]);
  check('and walking uses battery too', E.kitLeft(w1, 'lamp') < 28, E.kitLeft(w1, 'lamp'));
  const f = night(['Headlamp']); f.fire = true; f.firewood = 5; E.act(f, job); check('by the fire the headlamp stays off', E.kitLeft(f, 'lamp') === 28, E.kitLeft(f, 'lamp'));
}

{ // purification tablets: raw water without giardia while they last
  const run = (tabs, N = 160, days = 25) => { let sick = 0, off = 0; for (let i = 0; i < N; i++) { const s = base(tabs ? ['Water purification tablets'] : [], 2000 + i, 'US-S6'); s.containers = 0; E.sysOf(s).fouling = 1; let drank = 0;
    for (let d = 0; d < days && s.status === 'playing'; d++) { s.boiled = 0; s.potWater = 0; s.event = null; E.endDay(s); drank++; if (s.conditions.some(c => /Giardia/.test(c.name))) { sick++; break; } if (s.status !== 'playing') break; E.beginDay(s); } off += Math.abs(E.kitLeft(s, 'tabs') - (tabs ? 30 - drank : 0)); } return { sick, off }; };
  const a = run(false), b = run(true);
  check('raw water from fouled water gives giardia without tablets', a.sick > 20, a); check('and none with them', b.sick === 0, b);
  check('one tablet for each day of raw water', b.off === 0, b.off);
  const s = base(['Water purification tablets']); s.kitLeft = { tabs: 1 }; s.boiled = 0; s.event = null; E.endDay(s);
  check('the last tablet says so', E.kitLeft(s, 'tabs') === 0 && s.log.concat([{ lines: s.today.lines }]).some(d => (d.lines || []).some(x => /last purification tablet/.test(x[0]))) || JSON.stringify(s.log).includes('last purification tablet'), JSON.stringify(s.log).slice(-400));
  const t = base(['Water purification tablets']); t.boiled = 2; t.event = null; E.endDay(t); check('boiled water saves the tablets', E.kitLeft(t, 'tabs') === 30, E.kitLeft(t, 'tabs'));
}

{ // the Paiute deadfall: an opt-in trigger, surer and for slightly bigger animals, for cord and time
  const s = base(); s.mats.stone = 6; const c0 = s.mats.cordage, h0 = s.hours; E.act(s, 'deadfalls'); const fig = s.hours - h0;
  check('the default is still the figure-4', s.deadfalls === 3 && s.mats.cordage === c0 && !(s.sys && s.sys.paiute), [s.deadfalls, s.mats.cordage, s.sys && s.sys.paiute]);
  const p = base(); p.mats.stone = 6; const pc = p.mats.cordage, ph = p.hours; const L = E.act(p, 'deadfalls', { extra: { kind: 'paiute' } });
  check('a Paiute deadfall takes cord', p.deadfalls === 3 && p.mats.cordage === pc - 3 && p.sys.paiute === 3, [p.deadfalls, p.mats.cordage, p.sys.paiute]);
  check('and half an hour more', Math.abs((p.hours - ph) - fig - 0.5) < 0.11, [p.hours - ph, fig]); check('and says what it is', L.some(x => /Paiute/.test(x[0])), L);
  const q = base(); q.mats.stone = 6; q.mats.cordage = 0; E.act(q, 'deadfalls', { extra: { kind: 'paiute' } }); check('with no cord it falls back to figure-4s', q.deadfalls === 3 && !(q.sys && q.sys.paiute));
  const place = E.DATA.seasons.find(se => se.pools.trap.some(([id]) => E.DATA.foods[id].por >= 3 && E.DATA.foods[id].por < 5) && se.pools.trap.some(([id]) => E.DATA.foods[id].por < 3));
  const catches = pai => { let n = 0, big = 0; for (let i = 0; i < 700; i++) { const t = base([], 3000 + i, place.key); t.snares = 0; t.fishTrap = false; t.net = null; t.trapsCatch = []; t.deadfalls = 12; if (pai) E.sysOf(t).paiute = 12; t.event = null; E.endDay(t); n += t.trapsCatch.length; big += t.trapsCatch.filter(id => E.DATA.foods[id].por >= 3).length; } return { n, big }; };
  const f4 = catches(false), pa = catches(true); console.log('700 nights of 12 deadfalls at ' + place.key + ':', { figure4: f4, paiute: pa });
  check('Paiute deadfalls catch more', pa.n > f4.n * 1.15, { f4, pa, place: place.key }); check('and take slightly bigger animals', pa.big > 0 && f4.big === 0, { f4, pa });
}

console.log(fails ? `${fails} new-kit check(s) failed, ${passes} passed.` : `All ${passes} new-kit checks passed.`); process.exitCode = fails ? 1 : 0;
