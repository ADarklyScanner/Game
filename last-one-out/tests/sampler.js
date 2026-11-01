// Builds varied game states for the exhaustive checks: every place, season stage, weather, gear set, material level and camp setup.
function makeSampler(E, seed = 1) {
  const D = E.DATA; const gearAll = D.gear.map(g => g.id); let r = seed >>> 0;
  const R = () => { r = (Math.imul(r, 1103515245) + 12345) >>> 0; return r / 4294967296; }; const pick = a => a[Math.floor(R() * a.length)]; const chance = p => R() < p;
  const SHELT = [null, 'tarp', 'leanto', 'hut', 'rock', 'cabin']; const LVL = { tarp: 1, leanto: 1, hut: 2, rock: 3, cabin: 3 };
  return function sample() {
    const se = pick(D.seasons); const c = se.climate;
    const gear = chance(0.15) ? [] : chance(0.15) ? gearAll.slice() : gearAll.filter(() => chance(0.35)).slice(0, 10);
    const s = E.newGame(se.key, gear, { seed: Math.floor(R() * 2 ** 31), weight: 150 + Math.floor(R() * 90) });
    const day = pick([1, 2, 5, 12, 25, 40, 60, 90, c.snow ? c.snow + 2 : 30, c.freeze ? c.freeze + 3 : 50, c.freeze ? c.freeze + 20 : 70]);
    s.day = Math.max(0, day - 1); E.beginDay(s); s.event = null;
    for (const w of ['storm', 'rain', 'fog', 'wind', 'snowfall', 'heat']) s[w] = false; const wx = pick(['clear', 'clear', 'rain', 'storm', 'fog', 'wind', 'snowfall', 'heat']); if (wx !== 'clear') s[wx] = true; s.spate = chance(0.1);
    const rich = chance(0.6); for (const k in s.mats) s.mats[k] = rich ? Math.floor(R() * 25) : (chance(0.5) ? 0 : Math.floor(R() * 3));
    s.hooks = Math.floor(R() * 8); s.line = chance(0.5) ? Math.floor(R() * 100) : 0; s.arrows = Math.floor(R() * 12); s.firewood = Math.floor(R() * 20); s.potWater = Math.floor(R() * 3); s.containers = chance(0.2) ? 1 : 0;
    s.fire = chance(0.6); s.health = 20 + R() * 80; s.morale = 10 + R() * 90; s.wet = chance(0.3) ? R() : 0; s.axeEdge = R();
    const sh = pick(SHELT); if (sh && (sh !== 'tarp' || gear.includes('Tarp'))) { s.shelterType = sh; s.shelterLvl = LVL[sh]; s.shelterCond = 0.2 + R() * 0.8; s.fireInside = (sh === 'rock' || sh === 'cabin') && chance(0.4); }
    if (chance(0.3)) { const opts = E.shelterOptions(s); if (opts.length) E.chooseShelter(s, pick(opts)); }
    for (const k of ['bowdrill', 'handline', 'smoker', 'cache', 'rack', 'hearth', 'lamp', 'chimney', 'stove', 'woodshed', 'fishtrap', 'net', 'bridge', 'bow', 'staff', 'leader', 'snowshoes', 'mittens', 'reflector', 'platform', 'stoneblade', 'raft']) if (chance(0.25)) s.crafts[k] = chance(0.5) ? 1 : 2;
    if (s.crafts.cache) s.cachePlace = pick(['camp', 'away']); if (s.crafts.fishtrap >= 3 || chance(0.1)) s.fishTrap = chance(0.5);
    const foods = Object.keys(D.foods); const nStores = chance(0.2) ? 0 : 1 + Math.floor(R() * 6);
    for (let i = 0; i < nStores; i++) { const id = pick(foods); const x = { id, por: Math.round((0.2 + R() * 6) * 10) / 10, left: chance(0.1) ? Infinity : 1 + Math.floor(R() * 20), smoked: chance(0.15) }; if (chance(0.1)) { x.where = pick(['rack', 'smoker']); x.moist = 0.2 + R() * 0.6; x.smoke = R(); } if (chance(0.1)) { x.dried = true; x.moist = 0.12; } if (id === 'fat' && chance(0.5)) x.rendered = true; if (chance(0.03)) x.tox = true; s.stores.push(x); }
    if (chance(0.2)) s.raw.push({ id: pick(foods.filter(f => ['fish', 'game'].includes(D.foods[f].kind))), por: 1 + Math.floor(R() * 3), left: 1 + Math.floor(R() * 2) });
    if (chance(0.1)) { const bigs = se.big || []; const isBig = bigs.length && chance(0.5); const g = isBig ? pick(bigs) : pick(foods.filter(f => D.foods[f].kind === 'game')); s.carcass = { id: g, por: 4 + Math.floor(R() * 20), big: !!isBig, dressed: chance(0.3), day: s.day, fat: D.foods[g].fat, organ: D.foods[g].organ }; }
    if (chance(0.15)) s.wounded = { id: pick(foods.filter(f => D.foods[f].kind === 'game')), p: 0.5 };
    if (chance(0.15)) s.conditions.push({ name: pick(['Sprained ankle from a fall', 'Broken wrist from a fall', 'axe glanced off a log into your leg', 'Trichinosis', 'Giardia from untreated water']), days: 3 + Math.floor(R() * 8), dmg: 1, wound: chance(0.5) });
    if (chance(0.25)) s.snares = Math.floor(R() * 12); if (chance(0.15)) s.deadfalls = Math.floor(R() * 6); if (chance(0.2)) s.trapsCatch = [pick(foods.filter(f => D.foods[f].kind === 'game'))];
    if (chance(0.15) && (gear.includes('Gillnet') || s.crafts.net >= 2)) s.net = { torn: chance(0.3), catch: [], poor: false };
    const sys = E.sysOf(s); if (chance(0.2)) sys.tinderDamp = R(); if (chance(0.2)) sys.soot = R(); if (chance(0.2)) sys.seal = R(); if (chance(0.2)) sys.bed = R(); if (chance(0.2)) sys.snowLoad = R() * 3; if (chance(0.15)) sys.haft = R(); if (chance(0.05)) sys.axeOff = true;
    if (chance(0.2)) sys.offal = R() * 5; if (chance(0.1)) sys.taint = 1; if (chance(0.2)) sys.clothes = R(); if (chance(0.15)) sys.flint = 1 + Math.floor(R() * 2); if (chance(0.1)) sys.leather = Math.floor(R() * 3); if (chance(0.1)) sys.greenPots = [{ dry: R() * 1.2, temper: chance(0.5) }]; if (chance(0.15)) sys.clayPots = 1;
    if (s.crafts.raft >= 2 || chance(0.05)) sys.raft = { float: 0.5 + R() * 0.5, inWater: chance(0.5) }; if (chance(0.1)) sys.mat = pick(['tight', 'loose']); if (chance(0.1)) sys.fouling = R(); if (chance(0.1)) sys.cairns = [{ x: 10, y: 10, day: 1 }];
    // time of day: morning, afternoon, dusk or after dark
    const tod = pick([0, 0.4, 0.75, 1]); s.hours = Math.round(tod * E.dayHours(s) * 10) / 10; s.phase = tod >= 1 ? 3 : tod > 0.7 ? 2 : tod > 0.3 ? 1 : 0; if (s.phase === 3) s.nightHours = chance(0.5) ? 0 : 1;
    return s;
  };
}
module.exports = { makeSampler };
