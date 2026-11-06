// Things that were built once and never changed now wear, break and need upkeep (the sibling pass, Nov 3).  node upkeep.js
const { loadGame } = require('./load-game'); const E = loadGame(process.env.GAME_FILE || undefined);
let fails = 0, passes = 0; const check = (name, ok, detail) => { if (ok) passes++; else { fails++; console.log('FAIL', name, detail ?? ''); } };
const GEAR = ['Axe', 'Ferro rod', 'Knife', 'Sleeping bag', 'Paracord', 'Fishing gear', 'Pot'];
function camp(key = 'US-S6', seed = 3, gear = GEAR) { const s = E.newGame(key, gear, { seed, weight: 200 }); E.beginDay(s); s.event = null; s.storm = s.rain = s.fog = s.wind = s.snowfall = false; s.firewood = 20; s.fire = true; s.shelterType = 'leanto'; s.shelterLvl = 1; return s; }
const nights = (mk, n, f) => { let hit = 0; for (let i = 0; i < n; i++) { const s = mk(i); E.endDay(s); if (f(s)) hit++; } return hit; };

{ // the fish trap clogs, high water tears it, checking the line clears and mends it
  const mk = i => { const s = camp('AU-S3', 50 + i); s.fishTrap = true; s.crafts.fishtrap = 1; s.rain = true; return s; };
  check('rain clogs the fish trap some nights', nights(mk, 200, s => s.sys.trapClog) > 5);
  const st = i => { const s = mk(i); s.rain = false; s.storm = true; return s; };
  check('a storm tears gaps in the fence', nights(st, 200, s => (s.sys.trapCond ?? 1) < 0.7) > 30);
  const c = camp('AU-S3', 7); c.fishTrap = true; c.sys.trapClog = true; c.sys.trapCond = 0.4; c.mats.poles = 2; E.act(c, 'checktraps');
  check('checking clears the clog', c.sys.trapClog === false); check('and drives fresh stakes', c.sys.trapCond > 0.8 && c.mats.poles === 1);
  const g = camp('AU-S3', 8); g.fishTrap = true; g.sys.trapCond = 0.05; g.storm = true; let gone = false; for (let d = 0; d < 20 && !gone; d++) { g.storm = true; E.endDay(g); E.beginDay(g); g.event = null; gone = !g.fishTrap; }
  check('a wrecked trap washes away and must be built again', gone && !(g.crafts.fishtrap >= 1));
}
{ // snow buries snares; walking the line resets them
  const s = camp('US-S6', 4); s.snares = 10; s.day = 40; s.snowfall = true; E.endDay(s); check('fresh snow buries the snares', s.sys.snaresBuried === true);
  E.beginDay(s); s.event = null; E.act(s, 'checktraps'); check('walking the line resets them', s.sys.snaresBuried === false);
}
{ // storms lay the rack over and drop what was on it
  const mk = i => { const s = camp('US-S1', 100 + i); s.crafts.rack = 1; s.storm = true; s.stores.push({ id: 'trout', por: 2, left: 5, smoked: false, where: 'rack', moist: 0.6 }); return s; };
  let down = 0, dropped = 0; for (let i = 0; i < 300; i++) { const s = mk(i); E.endDay(s); if (!(s.crafts.rack >= 1)) { down++; if (s.stores.every(z => z.where !== 'rack')) dropped++; } }
  check('a storm sometimes lays the rack flat', down > 10 && down < 90, down); check('and what hung on it falls', dropped === down);
}
{ // snowshoe lacing wears through in deep snow; mending re-laces it
  const s = camp('US-S6', 5); s.day = 40; s.crafts.snowshoes = 1; s.sys.shoeWear = 0.99; s.walkAcc = 4000; E.travel(s, 1); check('worn lacing breaks', s.sys.shoesBroken === true);
  s.sys.needle = true; s.mats.cordage = 3; check('mending is offered for it', E.available(s, 'mend').ok, E.available(s, 'mend').why); E.act(s, 'mend'); check('mending re-laces it', s.sys.shoesBroken === false);
}
{ // mittens wear through in the cold
  const s = camp('AU-S4', 6); s.crafts.mittens = 1; s.sys.mittWear = 0.995; E.endDay(s); check('mittens wear through at the fingertips', s.sys.mittHoles === true);
}
{ // moss frozen to the rock gives half; cooking can scorch or come out just right
  const s = camp('US-S6', 7); let d = 1; while (d < 29 && !(E.temperature({ ...s, day: d }) < 0)) d++; s.day = d; const m0 = s.mats.moss; E.act(s, 'moss'); check('frost-bound moss gives half', E.temperature(s) < 0 && s.mats.moss - m0 === 2, [d, E.temperature(s), s.mats.moss - m0]);
  const w = camp('US-S6', 7); w.day = 2; const w0 = w.mats.moss; E.act(w, 'moss'); check('on a mild day it gives the full four', w.mats.moss - w0 === 4, w.mats.moss - w0);
  let burnt = 0, good = 0; for (let i = 0; i < 200; i++) { const c = camp('US-S6', 300 + i); c.stores = [{ id: 'trout', por: 3, left: 5, smoked: false }]; c.hours = i % 9; E.act(c, 'cook'); const t = c.today.lines.map(l => l[0]).join(' '); if (/charred/.test(t)) burnt++; if (/just right/.test(t)) good++; }
  check('cooking sometimes scorches', burnt > 5 && burnt < 60, burnt); check('and sometimes comes out just right', good > 15, good);
}
{ // a frozen lake with no axe or saw: break a hole by hand, or go without water
  const s = camp('US-S6', 9, ['Knife']); s.day = 60; E.beginDay(s); s.event = null; s.mats.stone = 2;
  check('the lake is frozen and there is no axe', E.status(s).frozen && !E.cutter(s));
  s.crafts.handline = 1; s.hooks = 3; check('fishing says to break a hole first', /hole/i.test(E.available(s, 'fish').why || ''), E.available(s, 'fish').why);
  check('breaking a hole is offered', E.available(s, 'ice_hole').ok, E.available(s, 'ice_hole').why);
  E.act(s, 'ice_hole'); check('then there is water today', E.waterToday(s).ok, JSON.stringify(E.waterToday(s)));
  check('and the hole can be fished', E.available(s, 'setlines').why !== 'Ice');
  const n = camp('US-S6', 9, ['Knife']); n.day = 60; E.beginDay(n); n.event = null; n.mats.stone = 0; n.mats.poles = 0; check('it needs a stone or a pole', !E.available(n, 'ice_hole').ok);
  const a = camp('US-S6', 9); a.day = 60; E.beginDay(a); a.event = null; check('with an axe it is not needed', !E.available(a, 'ice_hole').ok);
}
{ // the rarely-taken items each have a job
  const a = camp('US-S6', 11, ['Scotch eyed auger']); a.mats.poles = 8; a.mats.cordage = 0; check('the auger pegs a bed frame without cordage', E.available(a, 'craft_platform').ok, E.available(a, 'craft_platform').why);
  check('and a cabin needs no cordage', (E.billFor(a, 'cabin').cordage || 0) === 0);
  const n = camp('US-S6', 11, ['Knife']); n.mats.poles = 8; n.mats.cordage = 0; check('without it the frame needs lashing', !E.available(n, 'craft_platform').ok);
  const g = camp('US-S1', 12, ['Ground sheet']); g.rain = true; g.today.done = []; check('a ground sheet catches rain to drink', E.waterToday(g).ok && E.waterToday(g).how === 'rain', JSON.stringify(E.waterToday(g)));
  const sh = camp('US-S6', 13, ['Shovel']); sh.day = 60; E.beginDay(sh); sh.event = null; sh.fire = true; sh.firewood = 20; E.endDay(sh); check('a shovel banks snow against the shelter', !!(sh.sys && sh.sys.banked));
  const sa = camp('US-S6', 14, ['Salt']); sa.stores = [{ id: 'trout', por: 4, left: 5, smoked: false }]; E.endDay(sa); check('salt on the food keeps you going', (sa.lastHabits || []).includes('salt on the food'), JSON.stringify(sa.lastHabits));
  const h = camp('AU-S1', 15, ['Hammock']); h.day = 5; h.stores = [{ id: 'trout', por: 4, left: 5, smoked: false }]; E.endDay(h); check('a hammock on a mild night', E.temperature(h) <= 3 || (h.lastHabits || []).includes('a good night off the ground'), JSON.stringify([E.temperature(h), h.lastHabits]));
}
{ // a shot at an animal you can see is about an hour; a slingshot does not drop a moose
  const s = camp('US-S6', 21, ['Bow and arrows']); s.hours = 8; E.act(s, 'hunt', { extra: { target: 'hare', hit: 'good', scent: 'cross' } }); check('a seen shot takes about an hour', s.hours - 8 < 2, s.hours - 8);
  const b = camp('US-S6', 22, ['Bow and arrows']); b.hours = 8; E.act(b, 'hunt'); check('a blind hunt takes most of the day', b.hours - 8 >= 3, b.hours - 8);
  const big = Object.keys(E.DATA.foods).find(k => E.DATA.foods[k].big); let downs = 0; for (let i = 0; i < 200; i++) { const t = camp('US-S6', 400 + i, ['Slingshot']); E.act(t, 'hunt', { extra: { target: big, hit: 'good', scent: 'up' } }); if (t.carcass && t.carcass.big) downs++; }
  check('a slingshot almost never drops big game', downs <= 10, downs);
}
{ // half a job gives half a result
  const d = camp('US-S6', 31); d.mats.stone = 6; const n0 = d.deadfalls; E.act(d, 'deadfalls', { extra: { good: false } }); check('a deadfall whose stone kept falling sets one, not three', d.deadfalls - n0 === 1, d.deadfalls - n0);
  const c = camp('US-S6', 32); c.mats.bark = 6; const k0 = c.mats.cordage; E.act(c, 'cordage', { extra: { good: false } }); check('cordage stopped part way gives one length', c.mats.cordage - k0 === 1, c.mats.cordage - k0);
  const a = camp('US-S6', 33); a.axeEdge = 0.3; a.mats.stone = 2; E.act(a, 'sharpen', { extra: { good: false } }); check('sharpening stopped part way gives half the edge', a.axeEdge > 0.3 && a.axeEdge < 0.75, a.axeEdge);
}
{ // water: dew at first light, ice melts cheaper than snow, a tarp catches rain
  const d = camp('US-S12', 41, ['Knife']); d.phase = 0; d.hours = 0.2; const w0 = d.water || 0; check('dew is offered at first light in dry country', E.available(d, 'dew').ok, E.available(d, 'dew').why);
  E.act(d, 'dew'); check('and gives half a day of water', Math.abs((d.water || 0) - w0 - 0.5) < 1e-9, d.water); check('once a morning', !E.available(d, 'dew').ok);
  const late = camp('US-S12', 42, ['Knife']); late.phase = 2; check('not in the afternoon', !E.available(late, 'dew').ok);
  const i = camp('US-S6', 43, ['Pot', 'Knife']); i.day = 60; E.beginDay(i); i.event = null; i.fire = true; i.firewood = 10; i.mats.stone = 2; i.potWater = 0; check('lake ice can be melted', E.available(i, 'melt_ice').ok, E.available(i, 'melt_ice').why);
  const f0 = i.firewood; E.act(i, 'melt_ice'); const iceWood = f0 - i.firewood; i.potWater = 0; const f1 = i.firewood; E.act(i, 'melt_snow'); const snowWood = f1 - i.firewood;
  check('ice takes about half the wood of snow', iceWood > 0 && iceWood <= snowWood / 1.9, [iceWood, snowWood]);
  const r = camp('US-S1', 44, ['Tarp', 'Pot']); r.rain = true; r.potWater = 0; r.boiled = 0; check('rain and a tarp: catch it', E.available(r, 'catch_rain').ok, E.available(r, 'catch_rain').why);
  E.act(r, 'catch_rain'); check('fills the pots with clean water', r.potWater === 2 && r.boiled > 0, [r.potWater, r.boiled]);
  const nr = camp('US-S1', 45, ['Pot']); nr.rain = true; check('no tarp or sheet: no rigging', !E.available(nr, 'catch_rain').ok);
}
{ // fire as a tool: a star fire banks on less wood, char cloth takes a spark in damp air, hardened stakes last
  const night = star => { const s = camp('US-S6', 51); s.day = 40; s.firewood = 10; s.fire = true; if (star) E.act(s, 'star_fire'); const w0 = s.firewood; E.endDay(s); return w0 - s.firewood; };
  const plain = night(false), banked = night(true); check('a star fire burns less wood overnight', banked < plain * 0.8, [plain, banked]);
  const c = camp('US-S1', 52, ['Pot', 'Knife']); c.gear = c.gear.filter(g => g !== 'Ferro rod'); c.crafts.bowdrill = 1; c.sys.tinderDamp = 0.35; const before = E.fireOdds(c);
  check('char cloth can be made by the fire', E.available(c, 'craft_charcloth').ok, E.available(c, 'craft_charcloth').why); E.act(c, 'craft_charcloth');
  check('and lights a bow-drill ember in damp tinder that would not take before', before <= 0.03 && E.fireOdds(c) > 0.1, [before, E.fireOdds(c)]);
  const h = camp('AU-S3', 53); h.fishTrap = true; h.crafts.fishtrap = 1; h.mats.poles = 4; check('stakes can be fire-hardened', E.available(h, 'harden_stakes').ok, E.available(h, 'harden_stakes').why); E.act(h, 'harden_stakes');
  let tornHard = 0, tornSoft = 0; for (let i = 0; i < 200; i++) for (const hard of [true, false]) { const t = camp('AU-S3', 600 + i); t.fishTrap = true; t.crafts.fishtrap = 1; t.storm = true; if (hard) t.sys.hardStakes = true; E.endDay(t); if ((t.sys.trapCond ?? 1) < 0.65) { if (hard) tornHard++; else tornSoft++; } }
  check('hardened stakes tear out less often in a storm', tornHard < tornSoft * 0.8, [tornHard, tornSoft]);
}
{ // something alive in a snare is a real choice
  check('the snare event exists', !!E.EVENTS.snarepred && E.EVENTS.snarepred.options.length === 3);
}
console.log(fails ? `${fails} upkeep check(s) failed, ${passes} passed.` : `All ${passes} upkeep checks passed.`); process.exitCode = fails ? 1 : 0;
