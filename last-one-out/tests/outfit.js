// Issued clothing, piece by piece: kinds, colours, per-piece wear, and that the standard outfit plays exactly as the single wear meter did.  node outfit.js
const { loadGame } = require('./load-game'); const E = loadGame(process.env.GAME_FILE || undefined);
let fails = 0, passes = 0; const check = (name, ok, detail) => { if (ok) passes++; else { fails++; console.log('FAIL', name, detail ?? ''); } };
const GEAR = ['Axe', 'Ferro rod', 'Knife', 'Sleeping bag', 'Paracord', 'Fishing gear', 'Pot'];
function camp(outfit, seed = 3) { const s = E.newGame('US-S6', GEAR, { seed, weight: 200, outfit }); E.beginDay(s); s.event = null; s.storm = s.rain = s.fog = s.wind = s.snowfall = false; s.firewood = 20; s.stores = [{ id: 'ration', por: 30, left: Infinity, smoked: false }]; return s; }
const night = (outfit, set = () => {}) => { const s = camp(outfit); s.fire = false; set(s); E.endDay(s); return s; };
{ // the standard outfit changes nothing
  const fx = E.outfitFx(camp({})); check('standard outfit: every effect is 1', fx.cold === 1 && fx.wet === 1 && fx.dry === 1 && fx.kg === 0 && fx.rain === 1 && fx.wade === 1 && fx.sweat === 0, fx);
  check('no outfit passed = standard', E.outfitFx(camp()).cold === 1);
  check('cleanOutfit drops nonsense', JSON.stringify(E.cleanOutfit({ jacket: { k: 'tutu', c: 'pink' }, socks: { len: 'thigh' } })) === JSON.stringify(E.defaultOutfit()));
  check('a colour not in the set falls back', E.cleanOutfit({ jacket: { k: 'leather', c: 'blaze orange' } }).jacket.c === 'black');
}
{ // warmth: a warmer outfit means a warmer night; a down jacket is worse soaked
  const cold = o => night(o).lastDay.cold;
  const warm = { jacket: { k: 'down' }, hats: { k: 'trapper' }, gloves: { k: 'mittens' }, insPants: { k: 'down', style: 'bibs' } };
  check('warm outfit is warmer on a dry night', cold(warm) < cold({}), [cold(warm), cold({})]);
  check('light outfit is colder', cold({ hats: { k: 'cap' }, sweaters: { k: 'vest' }, thermals: { wt: 'light' } }) > cold({}));
  const wetCold = o => night(o, s => { s.wet = 1; }).lastDay.cold;
  check('soaked, cotton is colder than standard', wetCold({ tshirt: { k: 'cotton' }, shirts: { k: 'flannel' }, pants: { k: 'canvas' } }) > wetCold({}));
  check('down loses more of its edge when soaked than synthetic', wetCold({ jacket: { k: 'down' } }) / cold({ jacket: { k: 'down' } }) > wetCold({}) / cold({}));
}
{ // dryness: rain gear sheds rain, quick-dry clothes dry faster, rubber boots keep a ford out
  const rainy = o => { const s = camp(o); s.rain = true; E.act(s, 'firewood'); return s.wet; };
  check('PVC rain gear sheds more rain', rainy({ shell: { k: 'pvc' } }) < rainy({}), [rainy({ shell: { k: 'pvc' } }), rainy({})]);
  const dried = o => night(o, s => { s.wet = 0.8; }).wet;
  check('synthetic layers dry faster overnight', dried({ shirts: { k: 'fleece' }, sweaters: { k: 'fleece' }, thermals: { k: 'synthetic' }, pants: { k: 'synthetic' } }) < dried({}));
  check('rubber boots let less of a ford in', E.outfitFx(camp({ boots: { k: 'rubber' } })).wade < 1);
  const sweat = camp({ shell: { k: 'pvc' } }); E.act(sweat, 'firewood'); check('hard work in PVC soaks you from inside', sweat.wet > 0, sweat.wet);
}
{ // wear lands on the pieces doing the work, and the whole still reads like the old meter
  const s = camp(); E.act(s, 'firewood'); const p = E.pieceWear(s);
  check('chopping wears gloves more than the hat', p.gloves < p.hats, p); check('total = old single meter', E.clothesOf(s) < 1);
  const a = camp(); const b = camp({ gloves: { k: 'work' }, pants: { k: 'canvas' }, jacket: { k: 'leather' } }); for (let i = 0; i < 3; i++) { E.act(a, 'firewood'); a.hours = 1; E.act(b, 'firewood'); b.hours = 1; }
  check('tough pieces wear slower', E.clothesOf(b) > E.clothesOf(a), [E.clothesOf(a), E.clothesOf(b)]);
  const m = camp(); m.sys.clothes = 0.4; m.mats.bone = 1; m.mats.cordage = 2; E.act(m, 'mend'); const w = E.pieceWear(m); const avg = E.OUTFIT.filter(x => x.w > 0).reduce((t, x) => t + x.w * w[x.id], 0) / E.OUTFIT.filter(x => x.w > 0).reduce((t, x) => t + x.w, 0);
  check('pieces follow a mend', Math.abs(avg - E.clothesOf(m)) < 0.002, [avg, E.clothesOf(m)]);
}
{ // the belt
  const n = camp({ belt: { k: 'nylon' } }); check('nylon belt: nothing to salvage', !E.available(n, 'cut_belt').ok);
  const br = camp({ belt: { k: 'braided' } }); const c0 = br.mats.cordage; E.act(br, 'cut_belt'); check('braided belt unravels into 3 cordage', br.mats.cordage === c0 + 3);
}
{ // colour: small and only where real
  const s = camp({ jacket: { c: 'blue' } }); check('blue stands out to deer', E.colorSeen(s, 'deer') < 1 && E.colorSeen(s, 'deer') >= 0.94);
  const o = camp({ jacket: { c: 'blaze orange' } }); check('orange is dull to deer', E.colorSeen(o, 'deer') === 1); check('orange is bright to grouse', E.colorSeen(o, 'grouse') < 1);
  check('colour does not matter to a hare-eating bear', E.colorSeen(s, 'hare') === 1);
  const r = camp({ jacket: { c: 'blue' }, shell: { c: 'olive' } }); r.rain = true; check('in rain the shell is what they see', E.colorSeen(r, 'deer') === 1);
  for (const c of ['olive', 'green', 'khaki', 'grey']) check('standard colours are neutral: ' + c, E.colorSeen(camp({ jacket: { c } }), 'deer') === 1 && E.colorSeen(camp({ jacket: { c } }), 'duck') === 1);
}
{ // saves: an outfit survives a round trip; older saves without one play the standard
  const s = camp({ jacket: { k: 'wool', c: 'red plaid' } }); check('plaid only where it belongs (falls back)', s.outfit.jacket.c !== 'red plaid');
  const t = JSON.parse(JSON.stringify(camp({ jacket: { k: 'wool', c: 'red' } }))); check('outfit round-trips', E.outfitOf(t).jacket.k === 'wool' && E.outfitOf(t).jacket.c === 'red');
  const old = camp(); delete old.outfit; old.sys.clothes = 0.5; delete old.sys.pieces; check('old save: standard outfit, pieces from the meter', E.outfitFx(old).cold === 1 && E.pieceWear(old).pants === 0.5);
}
console.log(fails ? `${fails} of ${fails + passes} outfit checks FAILED.` : `All ${passes} outfit checks passed.`); process.exitCode = fails ? 1 : 0;
