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
{ // something alive in a snare is a real choice
  check('the snare event exists', !!E.EVENTS.snarepred && E.EVENTS.snarepred.options.length === 3);
}
console.log(fails ? `${fails} upkeep check(s) failed, ${passes} passed.` : `All ${passes} upkeep checks passed.`); process.exitCode = fails ? 1 : 0;
