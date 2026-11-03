// Choosing camp, and the wreck on the far side of every map, played through the real page.  node campsite.js
const fs = require('fs'); const path = require('path'); const { chromium } = require('playwright');
const { loadGame } = require('./load-game'); const E = loadGame(process.env.GAME_FILE || undefined); const D = E.DATA;
const SRC = process.env.GAME_FILE || path.join(__dirname, '..', 'index.html'); const TMP = '/tmp/last-one-out-campsite.html'; const html = fs.readFileSync(SRC, 'utf8');
const hook = 'window.claude?.hot?.snapshot?.(() => ({ game: S }));';
fs.writeFileSync(TMP, html.replace(hook, `window.__t = { S: () => S, W: () => W, acts: () => interactions().map(a => a.label + ' | ' + (a.sub || '') + (a.dim ? ' (dim)' : '')), spot: () => spotOf(W.player), make: () => makeCampHere(), wreck: () => lookAtWreck(), atCamp: () => atCamp(), records: () => records };\n` + hook));
const KEY = 'last-one-out-v1'; const save = s => JSON.stringify(s, (k, v) => v === Infinity ? 1e9 : v);
let fails = 0, passes = 0; const check = (name, ok, detail) => { if (ok) passes++; else { fails++; console.log('FAIL', name, detail ?? ''); } };
const GEAR = ['Pot', 'Knife', 'Ferro rod', 'Axe', 'Fishing gear', 'Sleeping bag', 'Paracord'];
(async () => {
  const b = await chromium.launch(); const errs = [];
  async function open(s) { const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message)); await p.goto('file://' + TMP); await p.evaluate(([k, v]) => localStorage.setItem(k, v), [KEY, save(s)]); await p.reload(); await p.waitForTimeout(700); return { ctx, p }; }
  const fresh = (place = 'US-S6', seed = 42) => { const s = E.newGame(place, GEAR, { seed, weight: 200 }); E.beginDay(s); s.event = null; s.storm = s.rain = s.fog = false; s.mats.tinder = 3; s.firewood = 4; return s; };
  { // a new run starts with no camp: the first job is to pick a spot
    const { ctx, p } = await open(fresh());
    const acts = await p.evaluate(() => window.__t.acts()); check('a new run offers "Make camp here" first', /^Make camp here/.test(acts[0] || ''), acts);
    check('no camp jobs before there is a camp', !acts.some(a => /^Light the fire|^Build shelter/.test(a)), acts);
    check('not at camp yet', !(await p.evaluate(() => window.__t.atCamp())));
    const spot = await p.evaluate(() => window.__t.spot()); check('the spot report knows how far the water is', Number.isFinite(spot.waterM) && spot.waterM > 0, spot);
    // walk to a spot that is fine, make camp there
    await p.evaluate(() => { const W = window.__t.W(); W.player.x += 300; W.player.y += 200; });
    await p.waitForTimeout(200); const sp2 = await p.evaluate(() => window.__t.spot());
    if (!sp2.bad) { const h0 = await p.evaluate(() => window.__t.S().hours); await p.evaluate(() => window.__t.make()); await p.waitForTimeout(300);
      const st = await p.evaluate(() => { const S = window.__t.S(), W = window.__t.W(); return { chosen: S.campChosen, pos: S.campPos, camp: W.camp, hours: S.hours, spot: S.sys && S.sys.campSpot }; });
      check('making camp marks it chosen and remembers where', st.chosen === true && st.pos && st.pos.x === st.camp.x, st);
      check('it takes half an hour', Math.abs(st.hours - h0 - 0.5) < 1e-6, [h0, st.hours]); check('the spot is remembered for the rules', !!st.spot);
      const acts2 = await p.evaluate(() => window.__t.acts()); check('camp jobs appear once there is a camp', acts2.some(a => /^Light the fire|^Build shelter/.test(a)), acts2); check('no more "Make camp here"', !acts2.some(a => /^Make camp here/.test(a)), acts2);
      const saved = await p.evaluate(k => JSON.parse(localStorage.getItem(k)), KEY); check('the choice is saved', saved.campChosen === true && saved.campPos, saved.campPos);
    } else check('found a usable spot to test on', false, sp2.bad);
    await ctx.close();
  }
  { // too close to the water is refused, and says why
    const s = fresh(); const { ctx, p } = await open(s);
    await p.evaluate(() => { const W = window.__t.W(); W.player.x = W.shoreX(W.player.y) + 30; }); await p.waitForTimeout(200);
    const acts = await p.evaluate(() => window.__t.acts()); check('right at the water: offered but greyed out with the reason', acts.some(a => /^Make camp here .*\(dim\)/.test(a) && /water/i.test(a)), acts);
    await ctx.close();
  }
  { // runs saved before camps were chosen keep the camp they had
    const s = fresh(); delete s.campChosen; const { ctx, p } = await open(s);
    const st = await p.evaluate(() => ({ chosen: window.__t.S().campChosen, atCamp: window.__t.atCamp() })); check('an older save keeps its camp', st.chosen === true && st.atCamp, st);
    await ctx.close();
  }
  { // the wreck: on land, far across the map from the landing, in every place; looking at it is remembered
    let far = 0, onLand = 0; const n = D.seasons.length;
    for (const se of D.seasons) { const s = fresh(se.key, 5); s.campChosen = true; const { ctx, p } = await open(s);
      const w = await p.evaluate(() => { const W = window.__t.W(); if (!W.ufo) return null; const u = W.ufo; const land = W.desert || u.x > W.shoreX(u.y) + 300; return { d: Math.hypot(u.x - W.campHome.x, u.y - W.campHome.y), land }; });
      if (w && w.d > 5000) far++; if (w && w.land) onLand++; await ctx.close(); }
    check(`a wreck far from the landing in all ${n} places`, far === n, far); check('always on dry land', onLand === n, onLand);
    const s = fresh(); s.campChosen = true; const { ctx, p } = await open(s);
    await p.evaluate(() => { const W = window.__t.W(); W.player.x = W.ufo.x + 20; W.player.y = W.ufo.y + 40; }); await p.waitForTimeout(300);
    const acts = await p.evaluate(() => window.__t.acts()); check('"Look over the wreck" offered beside it', acts.some(a => /^Look over the wreck/.test(a)), acts);
    await p.evaluate(() => window.__t.wreck()); await p.waitForTimeout(200);
    const r = await p.evaluate(() => ({ stat: window.__t.S().stats.wreck, rec: window.__t.records().wrecks })); check('finding it is recorded in the run and in the records', r.stat && r.rec && r.rec['US-S6'], r);
    await ctx.close();
  }
  await b.close();
  if (errs.length) { fails++; console.log('FAIL page errors', errs.slice(0, 3)); }
  console.log(fails ? `${fails} campsite check(s) failed, ${passes} passed.` : `All ${passes} campsite checks passed.`); process.exitCode = fails ? 1 : 0;
})();
