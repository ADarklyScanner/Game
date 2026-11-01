// Tool and material rules: axe edges, axe heads, hearth stones, clay chinking.  node tools.js
const { loadGame } = require('./load-game'); const E = loadGame(process.env.GAME_FILE || undefined);
let fails = 0, passes = 0; const check = (name, ok, detail) => { if (ok) passes++; else { fails++; console.log('FAIL', name, detail ?? ''); } };
const GEAR = ['Axe', 'Ferro rod', 'Knife', 'Sleeping bag', 'Paracord', 'Fishing gear', 'Rations', 'Pot'];
function camp(gear = GEAR, place = 'US-S6', seed = 3) { const s = E.newGame(place, gear, { seed, weight: 200 }); E.beginDay(s); s.event = null; s.storm = s.rain = s.fog = s.snowfall = s.wind = s.heat = false; s.firewood = 5; s.stores = [{ id: 'ration', por: 30, left: Infinity, smoked: false }]; return s; }
const rate = (n, f) => { let k = 0; for (let i = 0; i < n; i++) if (f(i)) k++; return k / n; };

{ // a dull axe costs more effort and slips more
  const wood = edge => { const s = camp(); s.axeEdge = edge; s.firewood = 0; E.act(s, 'firewood'); return s.firewood; };
  check('a dull axe gets less wood for the same hours (more work per load)', wood(0.2) < wood(1), [wood(1), wood(0.2)]);
  const hurt = edge => rate(1500, i => { const s = camp(GEAR, 'US-S6', 500 + i); s.axeEdge = edge; s.sys.haft = 1; const L = E.act(s, 'cut_logs'); return s.conditions.some(c => /axe glanced/.test(c.name)) || s.status === 'medical'; });
  const sharp = hurt(1), dull = hurt(0.1); check('a dull edge glances off into your leg more often', dull > sharp, [sharp, dull]);
}
{ // sharpening: a whetstone gives a full edge, a flat river stone only a rough one
  const s = camp(); s.axeEdge = 0.3; s.mats.stone = 1; check('can hone on a flat stone', E.available(s, 'sharpen').ok); E.act(s, 'sharpen'); check('river stone gives a rough edge', Math.abs(s.axeEdge - 0.75) < 1e-9, s.axeEdge);
  check('and no better than that', !E.available(s, 'sharpen').ok);
  const w = camp([...GEAR, 'Sharpening stone']); w.axeEdge = 0.3; E.act(w, 'sharpen'); check('a whetstone gives a full edge', w.axeEdge === 1);
  const n = camp(); n.axeEdge = 0.3; n.mats.stone = 0; check('no stone at all, no sharpening', !E.available(n, 'sharpen').ok);
}
{ // the axe head works loose; rawhide holds it half as fast (50% more retention); frost loosens it faster
  const loss = (wrapped, place) => { const s = camp(GEAR, place || 'US-S6'); s.sys.haft = 1; s.sys.wrapped = wrapped; s.firewood = 0; E.act(s, 'firewood'); return 1 - E.haftOf(s); };
  check('chopping loosens the head', loss(false) > 0); check('a rawhide wrap halves the loosening', Math.abs(loss(true) - loss(false) / 2) < 1e-6, [loss(false), loss(true)]);
  const s = camp(); s.sys.haft = 0.15; let off = false; for (let i = 0; i < 80 && !off; i++) { s.hours = 0; s.phase = 0; s.firewood = 0; s.event = null; E.act(s, 'firewood'); off = !!s.sys.axeOff; }
  check('an ignored loose head flies off in time', off);
  check('with the head off there is no axe', !E.available(s, 'sharpen').ok && E.available(s, 'fix_axe').ok);
  s.mats.hide = 1; E.act(s, 'fix_axe'); check('refitted with a wedge and rawhide', !s.sys.axeOff && E.haftOf(s) === 1 && s.sys.wrapped && s.mats.hide === 0);
  const k = camp(['Axe', 'Ferro rod', 'Rations']); k.sys.axeOff = true; check('no knife, no wedge', !E.available(k, 'fix_axe').ok, E.available(k, 'fix_axe').why);
  const t = camp(); check('a tight head needs no refit', !E.available(t, 'fix_axe').ok);
}
{ // the plan's test: wet river stones in a new hearth can burst in the first hot fires, not later
  const burst = (wet) => rate(500, i => { const s = camp(GEAR, 'US-S6', 700 + i); s.crafts.hearth = 1; s.sys.hearthWet = wet; s.fire = true; s.firewood = 10; E.endDay(s); return s.today.night.some(l => /burst in the night/.test(l[0])); });
  const fresh = burst(3), dried = burst(0); check('new hearth stones can burst', fresh > 0.05 && fresh < 0.2, fresh); check('dried-out stones do not', dried === 0, dried);
  const s = camp(); s.mats.stone = 6; E.act(s, 'craft_hearth'); check('a new hearth starts wet', s.sys.hearthWet === 3);
}
{ // clay needs temper: plain clay cracks as it dries, clay with moss holds
  const seal = temper => { const s = camp(); s.shelterType = 'cabin'; s.shelterLvl = 3; s.mats.clay = 3; s.mats.moss = temper ? 1 : 0; E.act(s, 'caulk'); for (let i = 0; i < 4; i++) { s.event = null; E.endDay(s); E.beginDay(s); s.event = null; s.storm = false; } return E.sealOf(s); };
  const plain = seal(false), tempered = seal(true); check('plain clay cracks as it dries', tempered - plain > 0.15, [plain, tempered]);
}
console.log(fails ? `${fails} tool check(s) failed, ${passes} passed.` : `All ${passes} tool checks passed.`); process.exit(fails ? 1 : 0);
