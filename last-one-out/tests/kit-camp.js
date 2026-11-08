// Camp and fire kit variants: each one's trade-off, proved with the engine.  node kit-camp.js
const { loadGame } = require('./load-game'); const E = loadGame(process.env.GAME_FILE || undefined);
let fails = 0, passes = 0; const check = (name, ok, detail) => { if (ok) passes++; else { fails++; console.log('FAIL', name, detail ?? ''); } };
const VARIANTS = { Pot: ['Cast iron pot', 'Billy can'], 'Sleeping bag': ['Synthetic sleeping bag', 'Down sleeping bag'], Tarp: ['Canvas tarp', 'Silnylon tarp', 'Poncho'],
  Canteen: ['Plastic bottle', 'Water bladder'], 'Ferro rod': ['Stormproof matches', 'Magnesium block', 'Lighter'] };
/* a game on a quiet day at camp, the weather and the cold set by hand */
function game(kit, o = {}) { const s = E.newGame(o.season || 'US-S6', ['Knife', ...kit], { seed: o.seed || 7, weight: 200 }); s.campChosen = true; E.beginDay(s); s.event = null;
  s.storm = s.rain = s.fog = s.snowfall = s.wind = false; s.coldSnap = 0; s.hours = 2; s.phase = 0; if (o.day != null) s.day = o.day; return s; }
const dayAt = (season, test) => { const s = game([], { season }); for (let d = 0; d < 140; d++) if (test(E.temperature(s, d))) return d; return null; };

{ // the kit list
  for (const [base, ids] of Object.entries(VARIANTS)) for (const id of ids) { const g = E.DATA.gear.find(x => x.id === id), v = E.VARIANT[id];
    check(`${id} can be brought`, !!g && g.rate === 0.01 && v && v.base === base && E.GEAR_FAMILY[base].includes(id), id);
    check(`${id} has a cost of 1 to 4`, E.gearCost(id) >= 1 && E.gearCost(id) <= 4, E.gearCost(id));
    check(`${id} has a plain effect line`, typeof g.effect === 'string' && g.effect.length > 20 && !/[—–]/.test(g.effect), g.effect); }
  check('the ten most common items are the same ten', E.DATA.gear.slice(0, 10).every(g => !E.VARIANT[g.id] || !E.VARIANT[g.id].base));
}
{ // pots: cast iron renders fat with almost no loss and boils slowly; a billy can boils fast and scorches fat; the iron is felt on a camp move
  const render = kit => { const s = game(kit); s.fire = true; s.firewood = 5; s.stores = [{ id: 'fat', por: 10, left: 20 }]; E.act(s, 'render_fat', { extra: {} }); return s.stores.find(x => x.id === 'fat').por; };
  const iron = render(['Cast iron pot']), pot = render(['Pot']), billy = render(['Billy can']), none = render([]);
  check('cast iron renders more fat than a plain pot', iron > pot, [iron, pot]);
  check('a plain pot still renders 85%', pot === 8.5, pot);
  check('a billy can loses more fat than a plain pot', billy < pot, [billy, pot]);
  check('but a billy can beats a flat stone', billy > none, [billy, none]);
  const hrs = kit => E.jobHours(game(kit), 'boil');
  check('a billy can boils fastest, cast iron slowest', hrs(['Billy can']) < hrs(['Pot']) && hrs(['Pot']) < hrs(['Cast iron pot']), [hrs(['Billy can']), hrs(['Pot']), hrs(['Cast iron pot'])]);
  const kg = kit => E.moveCampCost(game(kit), 800).kg;
  check('cast iron weighs more on a camp move', kg(['Cast iron pot']) > kg(['Pot']), [kg(['Cast iron pot']), kg(['Pot'])]);
  check('a billy can weighs less', kg(['Billy can']) < kg(['Pot']), [kg(['Billy can']), kg(['Pot'])]);
  for (const id of VARIANTS.Pot) { const s = game([id]); s.fire = true; s.potWater = 1; check(`${id} boils water`, E.available(s, 'boil').ok); }
}
{ // sleeping bags: down is warmest dry and close to useless soaked; synthetic keeps most of its warmth wet
  const d = dayAt('US-S6', t => t < 0 && t > -8);
  const night = (kit, wet) => { const s = game(kit, { day: d }); s.fire = false; s.wet = wet; E.endDay(s); return s.history[s.history.length - 1].tdee; };
  check('found a cold night to test on', d != null, d);
  const downDry = night(['Down sleeping bag'], 0), synDry = night(['Synthetic sleeping bag'], 0), downWet = night(['Down sleeping bag'], 1), synWet = night(['Synthetic sleeping bag'], 1), noneWet = night([], 1);
  check('dry, the down bag keeps you warmer', downDry < synDry, [downDry, synDry]);
  check('soaked, the synthetic bag keeps you warmer', synWet < downWet, [synWet, downWet]);
  check('soaked down is close to no bag at all', downWet - synWet > (noneWet - synWet) * 0.4, [downWet, synWet, noneWet]);
  check('the synthetic bag loses little when soaked', synWet - synDry < downWet - downDry, [synWet - synDry, downWet - downDry]);
  const holed = (kit) => { const s = game(kit, { day: d }); s.fire = false; s.bagHoles = 3; E.endDay(s); return s.history[s.history.length - 1].tdee - night(kit, 0); };
  check('holes let more warmth out of down than synthetic', holed(['Down sleeping bag']) > holed(['Synthetic sleeping bag']), [holed(['Down sleeping bag']), holed(['Synthetic sleeping bag'])]);
  const kg = kit => E.moveCampCost(game(kit), 800).kg; check('synthetic is the heavier bag', kg(['Synthetic sleeping bag']) > kg(['Down sleeping bag']));
}
{ // tarps: canvas wears slowly, silnylon fast; a poncho keeps you dry at work and makes a poor shelter
  const storm = kit => { const s = game(kit); s.shelterType = 'tarp'; s.shelterLvl = 1; s.shelterCond = 1; s.storm = true; s.braced = false; E.endDay(s); return s.shelterCond; };
  const canvas = storm(['Canvas tarp']), tarp = storm(['Tarp']), sil = storm(['Silnylon tarp']);
  check('a storm takes less out of canvas than a plain tarp', canvas > tarp, [canvas, tarp]);
  check('and more out of silnylon', sil < tarp, [sil, tarp]);
  const workWet = kit => { const s = game(kit); s.rain = true; s.wet = 0; E.act(s, 'boughs', { extra: {} }); return s.wet; };
  check('a poncho keeps you drier working in the rain', workWet(['Poncho']) < workWet(['Tarp']) * 0.6, [workWet(['Poncho']), workWet(['Tarp'])]);
  const camp = kit => { const s = game(kit); s.shelterType = 'tarp'; s.shelterLvl = 1; s.shelterCond = 1; return s; };
  const dry = kit => E.shelterScores(camp(kit)).find(r => r[0] === 'Dry')[1];
  check('a poncho shelter scores less dry than a tarp', dry(['Poncho']) < dry(['Tarp']), [dry(['Poncho']), dry(['Tarp'])]);
  const rainNight = kit => { const s = camp(kit); s.rain = true; s.wet = 0; s.fire = false; E.endDay(s); return s.history[s.history.length - 1].tdee; };
  check('a rainy night under a poncho is colder than under a tarp', rainNight(['Poncho']) > rainNight(['Tarp']), [rainNight(['Poncho']), rainNight(['Tarp'])]);
  const windNight = kit => { const s = camp(kit); s.wind = true; s.fire = false; s.day = 40; E.endDay(s); return s.history[s.history.length - 1].tdee; };
  check('silnylon flapping in the wind costs warmth', windNight(['Silnylon tarp']) > windNight(['Tarp']), [windNight(['Silnylon tarp']), windNight(['Tarp'])]);
  for (const id of VARIANTS.Tarp) check(`${id} can be pitched as a tarp camp`, E.shelterOptions(game([id])).includes('tarp') && !E.shelterOptions(game([])).includes('tarp'));
  const kg = kit => E.moveCampCost(game(kit), 800).kg; check('canvas is heavy to move', kg(['Canvas tarp']) > kg(['Tarp']) && kg(['Silnylon tarp']) < kg(['Tarp']));
}
{ // water carriers: plastic cannot be boiled in; a bladder holds more and can split; a clear bottle in the sun makes the water safe
  const boilOk = kit => { const s = game(kit); s.fire = true; s.potWater = 1; return E.available(s, 'boil').ok; };
  check('a metal canteen can be boiled in', boilOk(['Canteen']));
  check('a plastic bottle cannot', !boilOk(['Plastic bottle']));
  check('nor a water bladder', !boilOk(['Water bladder']));
  const cap = kit => { const s = game([...kit, 'Ground sheet']); s.rain = true; s.potWater = 0; E.act(s, 'catch_rain'); return s.potWater; };
  check('a bladder holds twice a canteen', cap(['Water bladder']) === 2 && cap(['Canteen']) === 1, [cap(['Water bladder']), cap(['Canteen'])]);
  check('a pot and a canteen hold what they always did', cap(['Pot', 'Canteen']) === 3, cap(['Pot', 'Canteen']));
  { const s = game(['Water bladder', 'Ground sheet']); s.sys = s.sys || {}; s.sys.bladderTorn = true; s.rain = true; check('a split bladder holds nothing', !E.available(s, 'catch_rain').ok); }
  let torn = 0, keeps = 0; for (let sd = 1; sd <= 30; sd++) { const s = game(['Water bladder'], { seed: sd }); const c = game(['Canteen'], { seed: sd }); for (let d = 0; d < 60 && s.status === 'playing'; d++) { E.endDay(s); E.beginDay(s); s.event = null; } for (let d = 0; d < 5; d++) { E.endDay(c); E.beginDay(c); c.event = null; } if (s.sys && s.sys.bladderTorn) torn++; if (!(c.sys && c.sys.bladderTorn)) keeps++; }
  check('bladders split now and then over a season', torn > 0 && torn < 30, torn);
  const warm = dayAt('US-S6', t => t > 3);
  const sun = kit => { const s = game(kit, { day: warm }); s.boiled = 0; s.potWater = 1; E.endDay(s); E.beginDay(s); return s.boiled; };
  check('found a warm day to test on', warm != null, warm);
  check('a bottle left in the sun gives safe water the next day', sun(['Plastic bottle']) >= 1, sun(['Plastic bottle']));
  check('a canteen does not', sun(['Canteen']) === 0, sun(['Canteen']));
  { const s = game(['Plastic bottle'], { day: warm }); s.boiled = 0; s.potWater = 1; s.rain = true; E.endDay(s); E.beginDay(s); check('but not on a rainy day', s.boiled === 0, s.boiled); }
}
{ // fire: matches are best in the wet and run out; magnesium shrugs off damp tinder; a lighter is easy until hard cold, and runs dry
  const odds = (kit, set) => { const s = game(kit); s.mats.tinder = 3; s.firewood = 2; if (set) set(s); return E.fireOdds(s); };
  const damp = s => { s.sys = s.sys || {}; s.sys.tinderDamp = 0.6; }, wet = s => { s.rain = true; damp(s); };
  check('matches light damp tinder better than a ferro rod', odds(['Stormproof matches'], wet) > odds(['Ferro rod'], wet) + 0.15, [odds(['Stormproof matches'], wet), odds(['Ferro rod'], wet)]);
  check('magnesium handles damp tinder better than a ferro rod', odds(['Magnesium block'], damp) > odds(['Ferro rod'], damp) + 0.1, [odds(['Magnesium block'], damp), odds(['Ferro rod'], damp)]);
  check('but the wind costs magnesium more', odds(['Magnesium block'], s => { s.wind = true; }) < odds(['Ferro rod'], s => { s.wind = true; }), [odds(['Magnesium block'], s => { s.wind = true; }), odds(['Ferro rod'], s => { s.wind = true; })]);
  check('a lighter is the easiest on a mild, dry day', odds(['Lighter']) > odds(['Ferro rod']), [odds(['Lighter']), odds(['Ferro rod'])]);
  const hard = dayAt('US-S6', t => t < -8);
  check('found a hard frost to test on', hard != null, hard);
  const cold = s => { s.day = hard; };
  check('a lighter fails in hard cold', odds(['Lighter'], cold) < 0.4 && odds(['Ferro rod'], cold) > 0.9, [odds(['Lighter'], cold), odds(['Ferro rod'], cold)]);
  check('the plain ferro rod is unchanged', odds(['Ferro rod']) === 0.97 && odds(['Ferro rod'], damp) === Math.max(0.05, 0.97 * 0.7), [odds(['Ferro rod']), odds(['Ferro rod'], damp)]);
  { const s = game(['Stormproof matches']); s.mats.tinder = 3; s.firewood = 2; E.act(s, 'light_fire', { extra: {} }); check('a match is used up with each try', E.matchesLeft(s) === 24, E.matchesLeft(s)); }
  { const s = game(['Stormproof matches']); s.mats.tinder = 3; s.firewood = 2; s.sys = s.sys || {}; s.sys.matches = 1; E.act(s, 'light_fire', { extra: {} });
    check('with the last match gone there is no way to light a fire', E.matchesLeft(s) === 0 && !E.igniter(s) && !E.available(s, 'light_fire').ok, [E.matchesLeft(s), E.igniter(s)]);
    s.mats.cordage = 2; check('so a bow drill can be carved', E.available(s, 'craft_bowdrill').ok, E.available(s, 'craft_bowdrill').why); }
  { const s = game(['Lighter']); s.mats.tinder = 3; s.firewood = 2; s.sys = s.sys || {}; s.sys.lighterFuel = 1; E.act(s, 'light_fire', { extra: {} });
    check('a lighter runs dry', E.fuelLeft(s) === 0 && !E.igniter(s), [E.fuelLeft(s), E.igniter(s)]); }
  { const s = game(['Ferro rod']); check('a ferro rod still rules out a bow drill', !E.available(s, 'craft_bowdrill').ok && E.available(s, 'craft_bowdrill').why === 'You have a ferro rod'); }
  { const s = game(['Magnesium block']); s.mats.tinder = 30; s.firewood = 50; for (let i = 0; i < 40; i++) { s.fire = false; s.hours = 2; s.today.done = []; E.act(s, 'light_fire', { extra: {} }); } check('a magnesium block lasts', E.igniter(s) === 'ferro'); }
}
{ // old saves: a game saved before these fields existed has every match and all the gas
  const s = game(['Stormproof matches', 'Lighter']); delete s.sys; check('an old save has a full box and a full lighter', E.matchesLeft(s) === 25 && E.fuelLeft(s) === 60);
}
console.log(fails ? `${fails} camp kit check(s) failed, ${passes} passed.` : `All ${passes} camp kit checks passed.`); process.exitCode = fails ? 1 : 0;
