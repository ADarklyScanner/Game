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
{ // knowing the land: scout reports, the kill clock, stave wood, inner bark, what eating teaches
  const sc = camp('US-S6', 61); E.act(sc, 'scout'); const sg = sc.sys.scoutSign; check('scouting names an animal, how fresh and which way', sg && sg.id && /sign: .*heading (north|south|east|west)/.test(sc.today.lines.map(l => l[0]).join(' ')), sc.today.lines.map(l => l[0]));
  const o0 = (() => { const q = camp('US-S6', 61); return E.huntOdds(q); })(); check('and the day\'s hunting odds go up', E.huntOdds(sc) > o0, [o0, E.huntOdds(sc)]);
  const kill = late => { const k = camp('US-S1', 62, ['Knife']); k.day = 5; k.carcass = { hour: 2, id: 'deer', por: 100, big: true, dressed: false, day: 5, size: 1 }; k.hours = 2 + late; E.act(k, 'dress'); return k.carcass ? k.carcass.por : 0; };
  check('a warm kill gutted late loses meat', kill(6) < kill(1), [kill(1), kill(6)]);
  const st = camp('US-S3', 63, ['Knife']); E.act(st, 'cut_poles', { extra: { tree: { kind: 'deciduous', age: 'sapling' } } }); check('a broadleaf sapling gives a hardwood stave', st.sys.staveWood === 'hard');
  st.mats.poles = 3; st.mats.cordage = 4; st.crafts.bow = 0; E.act(st, 'craft_bow'); check('and the bow remembers its wood', st.sys.bowWood === 'hard');
  const soft = camp('US-S3', 64, ['Knife']); soft.sys.bowWood = 'soft'; soft.crafts.bow = 2; soft.sys.tiller = 1; const hard = camp('US-S3', 64, ['Knife']); hard.sys.bowWood = 'hard'; hard.crafts.bow = 2; hard.sys.tiller = 1;
  check('a hardwood bow casts harder than a spruce one', E.bowPower(hard) > E.bowPower(soft), [E.bowPower(hard), E.bowPower(soft)]);
  const bb = camp('US-S3', 65); bb.mats.bark = 0; for (let i = 0; i < 2; i++) E.act(bb, 'bark', { extra: { tree: { kind: 'deciduous', age: 'mature' } } }); const c0 = bb.mats.cordage; E.act(bb, 'cordage'); check('inner bark twists three lengths, not two', bb.mats.cordage - c0 === 3, bb.mats.cordage - c0);
  const m = camp('US-S6', 66); m.stores = [{ id: 'mushrooms', por: 3, left: 5, smoked: false, look: 'grey cap, spongy underside' }]; E.endDay(m); check('eating mushrooms safely puts them in the field notes', m.sys.known && m.sys.known['grey cap, spongy underside'] === 'good', m.sys.known);
  const g = camp('US-S3', 67); E.act(g, 'greens', { extra: { name: 'Chickweed' } }); check('a named green goes into the notes', g.sys.known && g.sys.known['plant:Chickweed'] === 'good');
}
{ // the snow cave and the door
  const deep = camp('US-S6', 71); deep.shelterType = null; deep.shelterLvl = 0; deep.day = 70; E.beginDay(deep); deep.event = null; check('deep snow offers a snow cave', E.shelterOptions(deep).includes('snowcave'), E.shelterOptions(deep));
  const early = camp('US-S6', 72); early.shelterType = null; early.shelterLvl = 0; early.day = 3; check('no drift, no snow cave', !E.shelterOptions(early).includes('snowcave'));
  check('a shovel digs it in one session', E.billFor({ ...deep, gear: ['Shovel'] }, 'snowcave').sessions === 1);
  const cold = type => { let h = 0; for (let i = 0; i < 40; i++) { const c = camp('US-S6', 800 + i, ['Knife']); c.day = 75; E.beginDay(c); c.event = null; c.fire = false; c.firewood = 0; c.storm = c.rain = false; c.shelterType = type; c.shelterLvl = 2; c.shelterCond = 1; const h0 = c.health; E.endDay(c); h += h0 - c.health; } return h; };
  check('a snow cave loses less to a hard cold night than a debris hut', cold('snowcave') < cold('hut'), [cold('snowcave'), cold('hut')]);
  const thaw = camp('US-S6', 73); thaw.day = 75; E.beginDay(thaw); thaw.event = null; thaw.shelterType = 'snowcave'; thaw.shelterLvl = 2; thaw.shelterCond = 1; thaw.rain = true; E.endDay(thaw); check('rain sags a snow cave', thaw.shelterCond < 0.9, thaw.shelterCond);
  const windy = door => { let h = 0; for (let i = 0; i < 40; i++) { const c = camp('US-S6', 900 + i, ['Knife']); c.day = 60; E.beginDay(c); c.event = null; c.fire = false; c.firewood = 0; c.wind = true; c.storm = c.rain = false; c.sys.door = door; const h0 = c.health; E.endDay(c); h += h0 - c.health; } return h; };
  check('a door away from the wind is warmer on a windy night', windy('lee') < windy('fire'), [windy('lee'), windy('fire')]);
}
{ // the old camp's better odds count
  let plain = 0, ruin = 0; for (let i = 0; i < 300; i++) { const a = camp('US-S2', 1000 + i); E.act(a, 'search'); plain += a.found.length; const b = camp('US-S2', 1000 + i); E.act(b, 'search', { mod: 2.2, extra: { ruin: true } }); ruin += b.found.length; }
  check('picking through the old camp finds more than the shore', ruin > plain * 1.5, [plain, ruin]);
}
{ // the raft: dry logs soak up slower; a gust taken standing rolls it; missing the drop-off fishes the shallows
  const mk = dry => { const t = camp('US-S6', 71, ['Axe', 'Fishing gear']); Object.assign(t.mats, { logs: 8, cordage: 8 }); E.act(t, 'craft_raft', { extra: { good: true, logs: dry ? 'dry' : 'green' } }); E.act(t, 'craft_raft', { extra: { good: true } }); return t; };
  const d = mk(true), g = mk(false); check('dry logs make a dry raft', d.sys.raft && d.sys.raft.dry === true && !g.sys.raft.dry, [d.sys.raft, g.sys.raft]);
  for (const t of [d, g]) { t.sys.raft.inWater = true; t.storm = t.rain = t.wind = false; E.endDay(t); E.beginDay(t); t.event = null; }
  check('dry logs soak up slower', d.sys.raft.float > g.sys.raft.float, [d.sys.raft.float, g.sys.raft.float]);
  const c = mk(false); c.wind = true; c.storm = false; E.act(c, 'raft_fish', { extra: { capsize: true, spot: true } }); check('a gust taken standing rolls the raft', c.conditions.some(x => /capsize/.test(x.name)), c.conditions.map(x => x.name));
  const f = mk(false); f.wind = true; f.storm = false; E.act(f, 'raft_fish', { extra: { capsize: false, spot: false } }); check('crouched for the gust, you stay dry', !f.conditions.some(x => /capsize/.test(x.name)));
}
{ // camp layout: the kitchen draws animals or keeps them off; the latrine keeps the water clean or fouls it
  const k = camp('US-S6', 61); k.campChosen = true; const wdir = E.prevailOf(k);
  E.act(k, 'lay_out_camp', { extra: { layout: { kitchen: [1, -1] } } }); check('a kitchen by the bed draws animals', E.kitchenMult(k) > 1, E.kitchenMult(k));
  const cl = v => Math.max(-2, Math.min(2, Math.round(v * 2.9))); const dx = cl(Math.cos(wdir)), dy = cl(Math.sin(wdir)); E.act(k, 'lay_out_camp', { extra: { layout: { kitchen: [dx, dy] } } });
  check('a kitchen out and downwind keeps them off', E.kitchenMult(k) < 1, [dx, dy, E.kitchenMult(k)]);
  E.act(k, 'lay_out_camp', { extra: { layout: { kitchen: [-1, 1] } } }); check('the fire\'s spot is not a kitchen', !k.sys.layout.kitchen, k.sys.layout);
  const lat = cell => { const t = camp('US-S6', 62); t.day = 20; E.sysOf(t).latrineDay = 19; t.sys.fouling = 0.3; t.sys.layout = { latrine: cell, water: 0 }; E.endDay(t); return t.sys.fouling; };
  check('a latrine that drains to the water fouls it', lat([2, 0]) > 0.3, lat([2, 0]));
  check('a latrine well away from the water cleans up faster', lat([-2, 1]) < lat([-1, -1]) || lat([-2, 1]) < 0.27, [lat([-2, 1]), lat([-1, -1])]);
}
{ // cooking by hand: the hands decide, not the dice
  const ck = heat => { const c = camp('US-S6', 51); c.stores = [{ id: 'trout', por: 4, left: 5, smoked: false }]; c.fire = true; const m0 = c.morale; const out = JSON.stringify(E.act(c, 'cook', { extra: { heat } }) || c.log || ''); return { out: out + JSON.stringify(c.lastLines || ''), c }; };
  check('charred by hand is charred', /charred/.test(JSON.stringify(ck('burnt').c)), '');
  check('cooked right by hand comes out right', /just right/.test(JSON.stringify(ck('right').c)), '');
  check('taken off early is cold in the middle', /still cold/.test(JSON.stringify(ck('under').c)), '');
}
{ // the trapline: loops get knocked flat, flat loops catch nothing, and you take and reset only what you reach
  let flatted = 0; for (let i = 0; i < 40; i++) { const t = camp('US-S6', 300 + i); t.snares = 10; t.wind = true; E.endDay(t); if (t.sys && t.sys.sprung) flatted++; }
  check('some snares are knocked flat in a windy night', flatted > 5, flatted);
  let caughtFlat = 0; for (let i = 0; i < 60; i++) { const t = camp('US-S6', 400 + i); t.snares = 4; E.sysOf(t).sprung = 4; t.trapsCatch = []; E.endDay(t); caughtFlat += t.trapsCatch.length; }
  check('flat loops catch nothing', caughtFlat === 0, caughtFlat);
  const h = camp('US-S6', 31); h.snares = 6; E.sysOf(h).sprung = 4; h.trapsCatch = ['hare', 'squirrel']; E.act(h, 'checktraps', { extra: { total: 4, checked: 2, leave: 1 } });
  check('half the line walked resets half the flat loops', h.sys.sprung === 2, h.sys.sprung);
  check('a catch in a set you did not reach stays there', h.trapsCatch.length === 1, h.trapsCatch);
  const b = camp('US-S6', 32); b.snares = 6; E.sysOf(b).sprung = 3; b.trapsCatch = ['hare']; E.act(b, 'checktraps');
  check('checking the whole line resets every loop and takes everything', b.sys.sprung === 0 && b.trapsCatch.length === 0, [b.sys.sprung, b.trapsCatch]);
}
{ // a rushed stage of a build leaves a leak: rain finds it, a proper patch closes it
  const h = camp('US-S6', 21); Object.assign(h.mats, { poles: 20, boughs: 30, moss: 20, cordage: 10 }); E.chooseShelter(h, 'hut', 'lee');
  E.act(h, 'shelter', { extra: { good: true } }); E.act(h, 'shelter', { extra: { good: false } });
  check('a rushed roof leaves a leak', h.shelterType === 'hut' && h.sys.leaky === true && h.shelterCond < 0.85, [h.shelterType, h.sys.leaky, h.shelterCond]);
  h.rain = true; h.shelterCond = 0.8; const n = JSON.stringify(E.endDay(h) || h.log || ''); check('rain comes through the leak at night', /weak spot in the roof/.test(n) || /weak spot in the roof/.test(JSON.stringify(h)), n.slice(0, 200));
  E.beginDay(h); h.event = null; check('a leak is worth patching even when the rest is sound', E.available(h, 'repair').ok !== false, E.available(h, 'repair'));
  h.mats.boughs = 10; h.shelterCond = 0.9; E.act(h, 'repair', { extra: { good: true } }); check('a proper patch closes the leak', h.sys.leaky === false);
  const c = camp('US-S6', 22); Object.assign(c.mats, { poles: 20, boughs: 30, moss: 20, cordage: 10 }); E.chooseShelter(c, 'hut', 'lee'); E.act(c, 'shelter', { extra: { good: true } }); E.act(c, 'shelter', { extra: { good: true } });
  check('a careful build has no leak', c.shelterType === 'hut' && !c.sys.leaky && c.shelterCond === 1, [c.sys.leaky, c.shelterCond]);
}
{ // a wrong turn at the fork costs time and the trail goes colder
  const tr = lost => { const t = camp('US-S6', 1500, ['Bow and arrows']); t.wounded = { id: 'hare', p: 0.9 }; const h0 = t.hours; E.act(t, 'track', { extra: { lost } }); return t.hours - h0; };
  check('following old prints costs half an hour', tr(true) - tr(false) >= 0.49, [tr(true), tr(false)]);
}
{ // something alive in a snare is a real choice
  check('the snare event exists', !!E.EVENTS.snarepred && E.EVENTS.snarepred.options.length === 3);
}
console.log(fails ? `${fails} upkeep check(s) failed, ${passes} passed.` : `All ${passes} upkeep checks passed.`); process.exitCode = fails ? 1 : 0;
