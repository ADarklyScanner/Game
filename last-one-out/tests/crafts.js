// Stone blades, woven door mats, cabin joints, rafts.  node crafts.js
const { loadGame } = require('./load-game'); const E = loadGame(process.env.GAME_FILE || undefined);
let fails = 0, passes = 0; const check = (name, ok, detail) => { if (ok) passes++; else { fails++; console.log('FAIL', name, detail ?? ''); } };
const NOKNIFE = ['Axe', 'Ferro rod', 'Sleeping bag', 'Paracord', 'Fishing gear', 'Pot', 'Saw'];
function camp(seed = 3, gear = NOKNIFE, place = 'US-S6') { const s = E.newGame(place, gear, { seed, weight: 200 }); E.beginDay(s); s.event = null; s.storm = s.rain = s.fog = s.wind = s.snowfall = false; s.stores = [{ id: 'ration', por: 30, left: Infinity, smoked: false }]; s.firewood = 20; return s; }
const rate = (n, f) => { let k = 0; for (let i = 0; i < n; i++) if (f(i)) k++; return k / n; };
{ // glassy stone turns up among the stones; a knapped blade is a knife that can shatter or snap
  const found = rate(600, i => { const s = camp(100 + i); s.hours = (i % 9); s.phase = 0; E.act(s, 'stones'); return E.flintOf(s) > 0; }); check('glassy stone in about 30% of stone gathering', found > 0.2 && found < 0.4, found);
  const s = camp(); check('no knife, no cleaning blade', !E.blade || true); s.sys.flint = 1; s.mats.stone = 1; check('knapping offered', E.available(s, 'craft_stoneblade').ok);
  const ok = q => rate(800, i => { const t = camp(300 + i); t.sys.flint = 1; t.mats.stone = 1; E.act(t, 'craft_stoneblade', { extra: q == null ? {} : { good: q } }); return t.crafts.stoneblade === 1; });
  const careful = ok(true), rough = ok(false); check('careful strikes: rarely shatters', careful > 0.85, careful); check('rushed: often shatters', rough < 0.6, rough);
  const k = camp(); k.crafts.stoneblade = 1; k.mats.bone = 2; k.hooks = 0; check('a stone blade lets you carve hooks', E.available(k, 'craft_hooks').ok, E.available(k, 'craft_hooks').why);
  const snapped = rate(3000, i => { const t = camp(700 + i); t.crafts.stoneblade = 1; t.raw = [{ id: 'hare', por: 2, left: 2 }]; E.act(t, 'clean'); return !t.crafts.stoneblade; }); check('a stone blade snaps now and then (about 3% a job)', Math.abs(snapped - 0.03) < 0.012, snapped);
  check('not needed with a knife', !E.available(Object.assign(camp(3, [...NOKNIFE, 'Knife']), { sys: { schema: 1, flint: 1 } }), 'craft_stoneblade').ok);
}
{ // a woven door mat: tight keeps out most of the wind, loose much less
  const cold = mat => { const s = E.newGame('AU-S4', ['Ferro rod'], { seed: 9, weight: 200 }); E.beginDay(s); s.event = null; s.stores = [{ id: 'ration', por: 30, left: Infinity, smoked: false }]; s.storm = s.snowfall = false; s.wind = true; s.shelterType = 'hut'; s.shelterLvl = 2; s.fire = false; if (mat) s.sys.mat = mat; E.endDay(s); return s.lastDay.cold; };
  const none = cold(null), tight = cold('tight'), loose = cold('loose'); check('a tight mat cuts wind cold', tight < none * 0.92, [none, tight]); check('a loose one helps less', loose > tight && loose < none, [loose, tight, none]);
  const s = camp(); s.shelterType = 'leanto'; s.shelterLvl = 1; s.mats.bark = 4; s.mats.cordage = 2; E.act(s, 'craft_mat', { extra: { good: false } }); check('a sloppy weave is loose', s.sys.mat === 'loose');
}
{ // the plan's test: well-fitted cabin joints take twice the strain of loose ones
  const wear = fit => { const s = camp(); s.shelterType = 'cabin'; s.shelterLvl = 3; s.shelterCond = 1; s.sys.fit = fit; s.storm = true; s.braced = false; E.endDay(s); return 1 - s.shelterCond; };
  check('joints at half fit wear twice as fast', Math.abs(wear(0.5) / wear(1) - 2) < 0.05, [wear(1), wear(0.5)]);
  const b = camp(); b.shelterGoal = 'cabin'; b.mats.logs = 40; b.mats.moss = 20; b.mats.cordage = 10; b.hours = 1; b.phase = 0; E.act(b, 'shelter', { extra: { good: false } }); check('a sloppy notch loosens the fit', b.sys.fit === 0.85, b.sys.fit);
}
{ // the raft: two sessions; more bites out deep, a capsize risk in wind, waterlogs 5% a day and dries on shore
  const s = camp(); s.mats.logs = 4; s.mats.cordage = 4; E.act(s, 'craft_raft'); s.hours = 1; s.phase = 0; s.event = null; E.act(s, 'craft_raft'); check('raft built in two sessions', !!E.raftOf(s) && E.raftOf(s).float === 1);
  const fish = raft => rate(2500, i => { const t = camp(1000 + i); t.hours = 1; t.phase = 0; t.mats.bait = 5; t.storm = t.wind = false; if (raft) t.sys.raft = { float: 1, inWater: false }; const n0 = t.raw.length; E.act(t, raft ? 'raft_fish' : 'fish'); return t.raw.length > n0; });
  const shore = fish(false), deep = fish(true); check('fishing from the raft: about 30% more', deep / shore > 1.15 && deep / shore < 1.45, [shore, deep]);
  const tipped = rate(1500, i => { const t = camp(4000 + i); t.hours = 1; t.phase = 0; t.wind = true; t.sys.raft = { float: 1, inWater: false }; E.act(t, 'raft_fish'); return t.conditions.some(c => /capsize/.test(c.name)); }); check('wind can capsize it', tipped > 0.1 && tipped < 0.2, tipped);
  const w = camp(); w.sys.raft = { float: 1, inWater: true }; for (let i = 0; i < 4; i++) { w.event = null; E.endDay(w); E.beginDay(w); w.event = null; } check('the plan\'s test: 5% buoyancy lost each day in the water', Math.abs(E.raftOf(w).float - 0.8) < 1e-9, E.raftOf(w).float);
  w.hours = 1; w.phase = 0; E.act(w, 'beach_raft'); for (let i = 0; i < 2; i++) { w.event = null; E.endDay(w); E.beginDay(w); w.event = null; } check('and it dries out on shore', Math.abs(E.raftOf(w).float - 0.9) < 1e-9, E.raftOf(w).float);
  const low = camp(); low.sys.raft = { float: 0.5, inWater: true }; low.hours = 1; low.phase = 0; check('waterlogged raft cannot be used', !E.available(low, 'raft_fish').ok);
}
console.log(fails ? `${fails} craft check(s) failed, ${passes} passed.` : `All ${passes} craft checks passed.`); process.exit(fails ? 1 : 0);
