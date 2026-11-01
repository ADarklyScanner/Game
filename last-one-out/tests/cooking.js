// Cooking rules: raw meat and fish, worms in pig and predator meat.  node cooking.js
const { loadGame } = require('./load-game'); const E = loadGame(process.env.GAME_FILE || undefined);
let fails = 0, passes = 0; const check = (name, ok, detail) => { if (ok) passes++; else { fails++; console.log('FAIL', name, detail ?? ''); } };
const GEAR = ['Pot', 'Fishing gear', 'Ferro rod', 'Sleeping bag', 'Saw', 'Axe', 'Knife', 'Paracord', 'Gillnet', 'Tarp'];
// one supper: a single food in the stores, cooked a given way, then the night
function supper(seed, food, cook, fire = true, gear = GEAR) {
  const s = E.newGame('US-S3', gear, { seed, weight: 200 }); E.beginDay(s); s.event = null; s.storm = s.rain = false;
  s.fire = fire; s.firewood = fire ? 10 : 0; s.cook = cook; s.potWater = 2; s.stores = [{ id: food, por: 6, left: 5, smoked: false }]; s.conditions = [];
  E.endDay(s); return s;
}
const rate = (n, f) => { let k = 0; for (let i = 0; i < n; i++) if (f(i)) k++; return k / n; };
const wormed = s => !!(s.sys && s.sys.latent && s.sys.latent.length);
const sickWith = (s, name) => s.conditions.some(c => c.name === name);

const rawBoar = rate(600, i => wormed(supper(100 + i, 'boar', 'raw')));
check('raw boar carries worms about 15% of the time', rawBoar > 0.09 && rawBoar < 0.22, rawBoar);
const roastBoar = rate(600, i => wormed(supper(100 + i, 'boar', 'roast')));
check('roasted boar: a small risk, thick pieces can stay pink', roastBoar > 0 && roastBoar < 0.07, roastBoar);
check('boiled boar in a pot: no worms', rate(300, i => wormed(supper(100 + i, 'boar', 'boil'))) === 0);
check('a stew with no water at camp is roasted instead, so the risk stays', rate(600, i => { const s = E.newGame('US-S3', GEAR, { seed: 100 + i, weight: 200 }); E.beginDay(s); s.event = null; s.fire = true; s.cook = 'boil'; s.potWater = 0; s.stores = [{ id: 'boar', por: 6, left: 5, smoked: false }]; E.endDay(s); return wormed(s); }) > 0);
check('boil without a pot is a roast, so the risk stays', rate(600, i => wormed(supper(100 + i, 'boar', 'boil', true, ['Ferro rod', 'Axe', 'Knife']))) > 0);
check('hare never carries worms, raw or not', rate(300, i => wormed(supper(100 + i, 'hare', 'raw'))) === 0);
check('dried boar still carries them (drying does not kill worms)', (() => { let k = 0; for (let i = 0; i < 400; i++) { const s = E.newGame('US-S3', GEAR, { seed: 100 + i, weight: 200 }); E.beginDay(s); s.event = null; s.fire = false; s.cook = 'roast'; s.stores = [{ id: 'boar', por: 6, left: 100, smoked: false, dried: true, moist: 0.12 }]; E.endDay(s); if (wormed(s)) k++; } return k > 0; })());

{ // the worms show up a week or more later, and the log names the meal
  let s = null; for (let i = 0; i < 300 && !s; i++) { const t = supper(100 + i, 'boar', 'raw'); if (wormed(t)) s = t; }
  const l = s.sys.latent[0]; check('symptoms are due 7 to 12 days later', l.due - l.ate >= 7 && l.due - l.ate <= 12, l);
  let guard = 0; while (!sickWith(s, 'Trichinosis') && guard++ < 20 && s.status === 'playing') { E.beginDay(s); s.event = null; s.stores = [{ id: 'ration', por: 20, left: Infinity, smoked: false }]; E.endDay(s); }
  check('trichinosis arrives', sickWith(s, 'Trichinosis'));
  check('the log ties it to the boar and the day', s.log.some(d => d.lines.some(x => /wild boar|boar/i.test(x[0]) && /carrying worms/.test(x[0]) && new RegExp(`day ${l.ate}`).test(x[0]))));
}
// the old bug: choosing raw with a fire going used to be risk-free
const rawWithFire = rate(800, i => sickWith(supper(300 + i, 'hare', 'raw', true), 'Food poisoning from raw meat'));
check('raw meat with a fire going is still risky', rawWithFire > 0.01 && rawWithFire < 0.08, rawWithFire);
check('roasted hare is safe', rate(400, i => sickWith(supper(300 + i, 'hare', 'roast', true), 'Food poisoning from raw meat')) === 0);
const rawFish = rate(800, i => sickWith(supper(300 + i, 'trout', 'raw', true), 'Food poisoning from raw fish'));
check('raw fish: a small risk', rawFish > 0.003 && rawFish < 0.05, rawFish);
console.log(fails ? `${fails} cooking check(s) failed, ${passes} passed.` : `All ${passes} cooking checks passed.`); process.exit(fails ? 1 : 0);
