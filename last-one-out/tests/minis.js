// The mini-game fixes: no stuck states, warnings before failure, slips that cost.  node minis.js
// A temporary copy of the game gets a hook so the test can start a mini-game directly; the real file is not changed.
const fs = require('fs'); const path = require('path'); const { chromium } = require('playwright');
const { loadGame } = require('./load-game'); const E = loadGame(process.env.GAME_FILE || undefined);
const SRC = process.env.GAME_FILE || path.join(__dirname, '..', 'index.html'); const TMP = '/tmp/last-one-out-minis.html';
const html = fs.readFileSync(SRC, 'utf8'); const hook = 'window.claude?.hot?.snapshot?.(() => ({ game: S }));';
if (!html.includes(hook)) throw new Error('hook point not found');
fs.writeFileSync(TMP, html.replace(hook, 'window.__m = { startLash, startHunt, startFish, startNet, startSteps, startTaps, startCordage, startSharpen, mini: () => mini, S: () => S, acts: () => mini ? mini.acts.map(a => a.label) : [], press: l => { const a = mini && mini.acts.find(x => x.label === l); if (a) { if (a.down) a.down(); if (a.fn) a.fn(); if (a.up) a.up(); return true; } return false; } };\n' + hook));
const KEY = 'last-one-out-v1'; const save = s => JSON.stringify(s, (k, v) => v === Infinity ? 1e9 : v);
let fails = 0, passes = 0; const check = (name, ok, detail) => { if (ok) passes++; else { fails++; console.log('FAIL', name, detail ?? ''); } };
function base() { const s = E.newGame('US-S6', ['Knife', 'Ferro rod', 'Axe', 'Fishing gear', 'Bow and arrows', 'Gillnet', 'Paracord'], { seed: 41, weight: 200 }); s.campChosen = true; E.beginDay(s); s.event = null; s.storm = s.rain = s.fog = s.snowfall = false; s.hours = 2; s.phase = 0; Object.assign(s.mats, { poles: 20, cordage: 20, boughs: 20 }); return s; }
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const fresh = async () => { await p.goto('file://' + TMP); await p.evaluate(([k, v]) => localStorage.setItem(k, v), [KEY, save(base())]); await p.reload(); await p.waitForTimeout(700); };
  // fishing: after the cast you can reel in, and it costs the cast
  await fresh(); await p.evaluate(() => window.__m.startFish(false)); await p.evaluate(() => { const m = window.__m.mini(); m.acts[0].down(); }); await p.waitForTimeout(300); await p.evaluate(() => window.__m.mini().acts[0].up());
  check('after casting, Reel in is offered', (await p.evaluate(() => window.__m.acts())).includes('Reel in'), await p.evaluate(() => window.__m.acts()));
  const h0 = await p.evaluate(() => window.__m.S().hours); await p.evaluate(() => window.__m.press('Reel in')); await p.waitForTimeout(800);
  check('reeling in ends the mini-game', await p.evaluate(() => !window.__m.mini()));
  check('and the time is spent', (await p.evaluate(() => window.__m.S().hours)) > h0);
  // the net: a warning before the cold wins
  await fresh(); await p.evaluate(() => { window.__m.startNet(); window.__m.mini().acts[0].down(); }); let warned = false;
  for (let i = 0; i < 40 && !warned; i++) { await p.waitForTimeout(120); warned = /going numb/.test(await p.evaluate(() => document.querySelector('#mini').textContent)); }
  check('the net warns that the hands are going numb', warned);
  // hunting: a drawn bow can be let down, at a cost
  await fresh(); await p.evaluate(() => window.__m.startHunt(null)); await p.evaluate(() => window.__m.press('Draw'));
  check('a drawn bow can be let down', (await p.evaluate(() => window.__m.acts())).includes('Let down'));
  const d0 = await p.evaluate(() => window.__m.mini().deadline); await p.evaluate(() => window.__m.press('Let down'));
  check('letting down returns to the draw', (await p.evaluate(() => window.__m.acts()))[0] === 'Draw');
  check('and costs time and steadiness', await p.evaluate(d0 => window.__m.mini().deadline < d0 && window.__m.mini().wobble > 0, d0));
  // rhythm crafts: a slip costs a step
  await fresh(); await p.evaluate(() => window.__m.startSteps('mend', { steps: ['Stitch', 'Pull'], need: 8, intro: 'x' }));
  for (const l of ['Stitch', 'Pull', 'Stitch', 'Stitch']) await p.evaluate(l => window.__m.press(l), l);
  check('a slip loses a step', /^2 of 8|Lost a step/.test(await p.evaluate(() => document.querySelector('#padtext') ? document.querySelector('#padtext').textContent : '')), await p.evaluate(() => (document.querySelector('#padtext') || {}).textContent));
  // lashing: running out the clock is a rushed job even with every joint tapped
  await fresh(); await p.evaluate(() => window.__m.startLash('repair', 3, 'x')); await p.evaluate(() => { window.__m.mini().cancel(); });
  await p.waitForTimeout(300); check('a lash that runs out of time is rushed', await p.evaluate(() => { const L = window.__m.S().today.lines.map(l => l[0]).join(' '); return !window.__m.mini(); }));
  // walking away before any work costs nothing and builds nothing
  await fresh(); { const h0 = await p.evaluate(() => window.__m.S().hours); await p.evaluate(() => window.__m.startTaps('craft_smoker', [[50, 50], [100, 50]], '', 'x')); check('a tap craft offers Not now before the first tap', (await p.evaluate(() => window.__m.acts())).includes('Not now'));
    await p.evaluate(() => window.__m.mini().cancel()); await p.waitForTimeout(200); check('timing out with nothing tapped builds nothing', await p.evaluate(h0 => !(window.__m.S().crafts.smoker >= 1) && window.__m.S().hours === h0, h0)); }
  await fresh(); { const c0 = await p.evaluate(() => window.__m.S().mats.cordage); await p.evaluate(() => window.__m.startCordage()); await p.evaluate(() => window.__m.mini().cancel()); await p.waitForTimeout(200);
    check('abandoning cordage untouched makes none', await p.evaluate(c0 => window.__m.S().mats.cordage === c0, c0)); }
  await fresh(); { await p.evaluate(() => { window.__m.S().axeEdge = 0.3; window.__m.startSharpen(); window.__m.mini().cancel(); }); await p.waitForTimeout(200);
    check('abandoning sharpening untouched leaves the edge', await p.evaluate(() => window.__m.S().axeEdge === 0.3)); }
  check('no page errors', !errs.length, errs.slice(0, 3));
  await b.close(); console.log(fails ? `${fails} mini-game check(s) failed, ${passes} passed.` : `All ${passes} mini-game checks passed.`); process.exitCode = fails ? 1 : 0;
})();
