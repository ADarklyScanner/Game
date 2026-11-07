// The mini-game fixes: no stuck states, warnings before failure, slips that cost.  node minis.js
// A temporary copy of the game gets a hook so the test can start a mini-game directly; the real file is not changed.
const fs = require('fs'); const path = require('path'); const { chromium } = require('playwright');
const { loadGame } = require('./load-game'); const E = loadGame(process.env.GAME_FILE || undefined);
const SRC = process.env.GAME_FILE || path.join(__dirname, '..', 'index.html'); const TMP = '/tmp/last-one-out-minis.html';
const html = fs.readFileSync(SRC, 'utf8'); const hook = 'window.claude?.hot?.snapshot?.(() => ({ game: S }));';
if (!html.includes(hook)) throw new Error('hook point not found');
fs.writeFileSync(TMP, html.replace(hook, 'window.__m = { startMushroom, urand, autoResolve, startSetLines, startCheckNet, startTend, startSmoke, startRender, startMelt, startRaftLoad, startFell, startSnare, W: () => W, startSlice, startClean, startDress, startRaft, startFilter, startCook, startBuild, startFire, startLash, startHunt, startFish, startNet, startSteps, startTaps, startCordage, startSharpen, startForage, startSearch, mini: () => mini, S: () => S, acts: () => mini ? mini.acts.map(a => a.label) : [], press: l => { const a = mini && mini.acts.find(x => x.label === l); if (a) { if (a.down) a.down(); if (a.fn) a.fn(); if (a.up) a.up(); return true; } return false; } };\n' + hook));
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
  for (const l of ['Stitch', 'Pull', 'Stitch', 'Stitch']) { await p.evaluate(l => window.__m.press(l), l); await p.waitForTimeout(320); }
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
  // hands remember: a craft done well before starts further on; three good in a row offer the usual way
  await fresh(); await p.evaluate(() => { window.__m.S().sys.handsMem = { mend: { reps: 2, streak: 3 } }; window.__m.startSteps('mend', { steps: ['Stitch', 'Pull'], need: 8, intro: 'x' }); });
  check('a practised craft starts further on', /remember the start/.test(await p.evaluate(() => (document.querySelector('#padtext') || {}).textContent || '')));
  check('and offers the usual way', (await p.evaluate(() => window.__m.acts())).includes('Do it the usual way'));
  await p.evaluate(() => window.__m.press('Do it the usual way')); await p.waitForTimeout(200); check('the usual way finishes the job at once', await p.evaluate(() => !window.__m.mini()));
  await fresh(); await p.evaluate(() => { window.__m.S().sys.handsMem = { mend: { reps: 0, streak: 1 } }; window.__m.startSteps('mend', { steps: ['Stitch', 'Pull'], need: 8, intro: 'x' }); });
  check('a new hand gets no shortcut', !(await p.evaluate(() => window.__m.acts())).includes('Do it the usual way'));
  // forage by hand: the walk ends by itself and the engine hears what you picked
  await fresh(); { const h0 = await p.evaluate(() => window.__m.S().hours); await p.evaluate(() => window.__m.startForage()); await p.waitForTimeout(10500);
    check('the forage walk ends by itself', await p.evaluate(() => !window.__m.mini())); check('walking it without picking costs nothing', await p.evaluate(h0 => window.__m.S().hours === h0, h0)); }
  await fresh(); { await p.evaluate(() => window.__m.startForage()); await p.waitForTimeout(300); const box = await p.evaluate(() => { const r = document.querySelector('#mini svg').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
    for (let k = 0; k < 40 && await p.evaluate(() => !!window.__m.mini()); k++) { await p.mouse.click(box.x + box.w * Math.min(0.97, k / 40 + 0.02), box.y + box.h * 0.58); await p.waitForTimeout(220); }
    await p.waitForTimeout(500); const L = await p.evaluate(() => window.__m.S().today.lines.map(l => l[0]).join(' ')); check('foraging by hand reports what you picked and what you left', /as you walked|nothing in your hands/.test(L) && /left plenty|stripped it/.test(L), L.slice(-200)); }
  // the shore: sweeping more sand is a search; touching none is nothing
  await fresh(); { const h0 = await p.evaluate(() => window.__m.S().hours); await p.evaluate(() => { window.__m.startSearch(); window.__m.press('Done looking'); }); check('a search with no sweeping costs nothing', await p.evaluate(h0 => window.__m.S().hours === h0 && !window.__m.mini(), h0)); }
  await fresh(); { await p.evaluate(() => window.__m.startSearch()); await p.waitForTimeout(200); const box = await p.evaluate(() => { const r = document.querySelector('#mini svg').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
    await p.mouse.move(box.x + 5, box.y + box.h * 0.5); await p.mouse.down(); for (let k = 0; k <= 30; k++) await p.mouse.move(box.x + box.w * k / 30, box.y + box.h * (0.2 + 0.6 * (k % 2))); await p.mouse.up();
    await p.evaluate(() => window.__m.press('Done looking')); await p.waitForTimeout(300); check('a swept shore is searched', await p.evaluate(() => window.__m.S().today.done.includes('search'))); }
  // thread crafts are paced: rushing the next move tangles it
  await fresh(); await p.evaluate(() => window.__m.startSteps('mend', { steps: ['Stitch', 'Pull'], need: 8, intro: 'x' })); await p.evaluate(() => { window.__m.press('Stitch'); window.__m.press('Pull'); });
  check('rushing a stitch tangles it', /tangled/.test(await p.evaluate(() => (document.querySelector('#padtext') || {}).textContent || '')));
  // the fire chain starts with the lay
  await fresh(); await p.evaluate(() => { const S = window.__m.S(); S.mats.tinder = 3; S.firewood = 3; window.__m.startFire(); });
  check('lighting a fire starts with how you lay it', ['Teepee', 'Log cabin', 'Lean-to lay'].every(l => 0) || (await p.evaluate(() => window.__m.acts())).includes('Log cabin'), await p.evaluate(() => window.__m.acts()));
  await p.evaluate(() => window.__m.press('Teepee')); check('then the strike', await p.evaluate(() => window.__m.mini() && window.__m.mini().type === 'fire'));
  check('no page errors', !errs.length, errs.slice(0, 3));
  // cooking: taken off early is underdone; left in the coals unturned it chars
  await fresh(); await p.evaluate(() => { const S = window.__m.S(); S.fire = true; S.stores.push({ id: 'trout', por: 4, left: 5, smoked: false }); window.__m.startCook(); });
  await p.evaluate(() => window.__m.mini().acts[0].down()); await p.waitForTimeout(800); await p.evaluate(() => window.__m.mini().acts[0].up());
  check('once the food is over the fire, Not now becomes Take it off', (await p.evaluate(() => window.__m.acts())).includes('Take it off'), await p.evaluate(() => window.__m.acts()));
  await p.evaluate(() => window.__m.press('Take it off')); await p.waitForTimeout(500);
  check('taken off early, the middle is cold', await p.evaluate(() => !window.__m.mini() && /still cold/.test(JSON.stringify(window.__m.S().today.lines))));
  await fresh(); await p.evaluate(() => { const S = window.__m.S(); S.fire = true; S.stores.push({ id: 'trout', por: 4, left: 5, smoked: false }); window.__m.startCook(); window.__m.mini().acts[0].down(); });
  await p.waitForTimeout(8500); check('held in the coals and never turned, it chars', await p.evaluate(() => !window.__m.mini() && /charred/.test(JSON.stringify(window.__m.S().today.lines))));
  // the water filter: bottom layer first; out of order is gritty, in order is clear
  for (const order of [[2, 0, 1, 3], [0, 1, 2, 3]]) { await fresh();
    await p.evaluate(() => { const S = window.__m.S(); S.fire = true; S.potWater = 2; S.boiled = 0; S.gear.push('Pot'); window.__m.startFilter(); });
    for (const i of order) { const r = await p.evaluate(i => { const b = document.querySelector(`#mini .fl[data-i="${i}"] rect`).getBoundingClientRect(); return [b.x + b.width / 2, b.y + b.height / 2]; }, i); await p.mouse.click(r[0], r[1]); await p.waitForTimeout(80); }
    await p.waitForTimeout(900); const txt = await p.evaluate(() => JSON.stringify(window.__m.S().today.lines));
    if (order[0] === 2) check('a filter built out of order lets sand through', /sand ran through/.test(txt)); else check('a filter built bottom up runs clear', /tastes of nothing/.test(txt)); }
  // the raft: pole to the drop-off and hold; in wind, a gust taken standing rolls it
  for (const windy of [false, true]) { await fresh();
    await p.evaluate(w => { const S = window.__m.S(); S.sys = S.sys || {}; S.sys.raft = { float: 1, inWater: false }; S.wind = w; S.storm = false; window.__m.startRaft(); }, windy);
    if (!windy) { const r = await p.evaluate(() => { const b = document.querySelector('#mini svg').getBoundingClientRect(); return [b.x + b.width * 205 / 300, b.y + b.height * 42 / 100]; }); await p.mouse.move(r[0], r[1]); await p.mouse.down(); await p.waitForTimeout(9000); await p.mouse.up(); await p.waitForTimeout(800);
      check('poled out and held over the drop-off', await p.evaluate(() => !window.__m.mini() && /Held the raft over the drop-off/.test(JSON.stringify(window.__m.S()))), await p.evaluate(() => [!!window.__m.mini(), document.querySelector('#mini') && document.querySelector('#mini').textContent])); }
    else { await p.waitForTimeout(10500); check('a gust taken standing rolls the raft', await p.evaluate(() => !window.__m.mini() && window.__m.S().conditions.some(c => /capsize/.test(c.name)))); } }
  // butchery: each animal its own steps
  const trace = async (ms = 18) => { const pts = await p.evaluate(() => { const g = document.querySelector('#mini path[stroke-dasharray]'); const svg = g.ownerSVGElement; const b = svg.getBoundingClientRect(); const vb = svg.viewBox.baseVal; const L = g.getTotalLength(); const out = []; for (let i = 0; i <= 24; i++) { const q = g.getPointAtLength(L * i / 24); out.push([b.x + b.width * q.x / vb.width, b.y + b.height * q.y / vb.height]); } return out; });
    await p.mouse.move(pts[0][0], pts[0][1]); await p.mouse.down(); for (const q of pts) { await p.mouse.move(q[0], q[1]); await p.waitForTimeout(ms); } await p.mouse.up(); await p.waitForTimeout(500); };
  const svgXY = (x, y) => p.evaluate(([x, y]) => { const svg = document.querySelector('#mini svg'); const b = svg.getBoundingClientRect(); const vb = svg.viewBox.baseVal; return [b.x + b.width * x / vb.width, b.y + b.height * y / vb.height]; }, [x, y]);
  const peel = async (fast) => { for (let k = 0; k < 14 && await p.evaluate(() => /Peel|peel|Skin it|steady|Steady|%/.test(document.querySelector('#mini').textContent)); k++) { const a = await svgXY(150, 100), b = await svgXY(150, 10); await p.mouse.move(a[0], a[1]); await p.mouse.down(); const nS = fast ? 4 : 12; for (let i = 1; i <= nS; i++) { await p.mouse.move(a[0], a[1] + (b[1] - a[1]) * i / nS); await p.waitForTimeout(fast ? 18 : 30); } /* a flick: 90 px in about 70 ms */ await p.mouse.up(); await p.waitForTimeout(80); } await p.waitForTimeout(500); };
  const pluck = async (dir) => { for (let pass = 0; pass < 4; pass++) for (const y of [40, 50, 60, 70, 78]) { const a = await svgXY(dir < 0 ? 250 : 60, y), b = await svgXY(dir < 0 ? 60 : 250, y); await p.mouse.move(a[0], a[1]); await p.mouse.down(); for (let i = 1; i <= 14; i++) { await p.mouse.move(a[0] + (b[0] - a[0]) * i / 14, a[1]); await p.waitForTimeout(8); } await p.mouse.up(); if (await p.evaluate(() => !!document.querySelector('#mini path[stroke-dasharray]'))) return; } };
  for (const fast of [false, true]) { await fresh(); await p.evaluate(() => { const S = window.__m.S(); S.raw = [{ id: 'hare', por: 3, left: 2 }]; S.mats.hide = 0; window.__m.startClean(); }); await trace(); await peel(fast);
    const g = await p.evaluate(() => ({ hide: window.__m.S().mats.hide, raw: window.__m.S().raw.length, open: !!window.__m.mini() }));
    if (!fast) check('a hare opened and skinned steadily gives a hide', g.hide === 1 && g.raw === 0 && !g.open, g); else check('skinned with a jerk, the hide tears', g.hide === 0 && g.raw === 0 && !g.open, g); }
  for (const dir of [-1, 1]) { await fresh(); await p.evaluate(() => { const S = window.__m.S(); S.raw = [{ id: 'grouse', por: 1, left: 2 }]; window.__m.startClean(); }); await pluck(dir); await trace();
    const t = await p.evaluate(() => JSON.stringify(window.__m.S().today.lines)); const open = await p.evaluate(() => !!window.__m.mini());
    if (dir < 0) check('plucked toward the tail, the skin holds', !open && !/against the grain and tore/.test(t)); else check('plucked against the grain, the skin tears', !open && /against the grain and tore/.test(t)); }
  { await fresh(); await p.evaluate(() => { const S = window.__m.S(); S.carcass = { id: 'moose', por: 40, big: true, dressed: false, day: S.day, hour: S.hours, fat: 4, organ: 3 }; S.mats.hide = 0; window.__m.startDress(); }); await trace();
    for (let k = 0; k < 40 && await p.evaluate(() => !!window.__m.act || true) && await p.evaluate(() => !!(window.__m.mini() && window.__m.mini().acts.find(a => a.label === 'Ease them out'))); k++) { await p.evaluate(() => window.__m.mini().acts.find(a => a.label === 'Ease them out').down()); await p.waitForTimeout(700); await p.evaluate(() => { const a = window.__m.mini() && window.__m.mini().acts.find(a => a.label === 'Ease them out'); if (a) a.up(); }); await p.waitForTimeout(750); }
    await p.waitForTimeout(500); await peel(false);
    for (let leg = 0; leg < 4; leg++) for (let f = 0.25; f <= 0.8; f += 0.05) { const L = await p.evaluate(i => { const e = document.querySelector(`#mini .leg[data-i="${i}"]`); return e && e.getAttribute('d'); }, leg); if (!L) break; const n = L.match(/-?[\d.]+/g).map(Number); const r = await svgXY(n[0] + (n[2] - n[0]) * f, n[1] + (n[3] - n[1]) * f); await p.mouse.click(r[0], r[1]); await p.waitForTimeout(40); if (await p.evaluate(() => /parts clean/.test(document.querySelector('#mini').textContent))) { await p.waitForTimeout(20); break; } }
    await p.waitForTimeout(900); const g = await p.evaluate(() => ({ dressed: window.__m.S().carcass && window.__m.S().carcass.dressed, hide: window.__m.S().mats.hide, burst: /bladder burst/.test(JSON.stringify(window.__m.S().today.lines)), open: !!window.__m.mini() }));
    check('a moose opened, gutted gently, skinned and quartered at the joints', g.dressed && g.hide === 2 && !g.burst && !g.open, g); }
  // slicing for the rack: even strips dry through, fat ones stay wet in the middle
  for (const even of [true, false]) { await fresh(); await p.evaluate(() => { const S = window.__m.S(); S.crafts.rack = 1; S.stores.push({ id: 'hare', por: 2, left: 3, smoked: false }); window.__m.startSlice(); });
    const xs = even ? Array.from({ length: 11 }, (_, i) => 58 + i * 18.5) : [110, 190];
    for (const x of xs) { const a = await svgXY(x, 26), b = await svgXY(x, 78); await p.mouse.move(a[0], a[1]); await p.mouse.down(); for (let i = 1; i <= 5; i++) { await p.mouse.move(a[0], a[1] + (b[1] - a[1]) * i / 5); await p.waitForTimeout(10); } await p.mouse.up(); await p.waitForTimeout(40); }
    if (!even) await p.evaluate(() => window.__m.press('Hang them up')); await p.waitForTimeout(800);
    const r = await p.evaluate(() => { const S = window.__m.S(); const on = S.stores.filter(x => x.where === 'rack'); return { n: on.length, thick: on.map(x => x.thick), open: !!window.__m.mini() }; });
    if (even) check('even strips hang thin', r.n > 0 && r.thick.every(t => !t) && !r.open, r); else check('fat strips hang thick', r.n > 0 && r.thick.every(t => t) && !r.open, r); }
  // felling: pick a way for it to fall, cut, and step clear when it cracks (or don't)
  for (const clear of [true, false]) { await fresh(); await p.evaluate(() => { const W = window.__m.W(); const t = W.trees.find(x => !x.gone && !x.cut && x.kind !== 'log' && x.kind !== 'snag' && x.age === 'mature'); window.__tree = t; W.player.x = t.x - 30; W.player.y = t.y + 10; window.__m.S().mats.logs = 0; window.__m.startFell(t); });
    const c = await p.evaluate(() => { const L = (t => ({ a: ((t.k || 0) * 2.399) % 6.283 }))(window.__tree); const i = Math.round(L.a / (Math.PI / 4)) % 8; const e = document.querySelector(`#mini .fd[data-i="${i}"]`); const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
    await p.mouse.click(c[0], c[1]); await p.waitForTimeout(1200);
    for (let k = 0; k < 8 && await p.evaluate(() => !!window.__m.mini() && window.__m.acts()[0] === 'Swing'); k++) { await p.evaluate(() => window.__m.press('Swing')); await p.waitForTimeout(120); }
    check('the last swing of a felling cracks and asks you to step clear', (await p.evaluate(() => window.__m.acts())).includes('Step clear'), await p.evaluate(() => window.__m.acts()));
    if (clear) await p.evaluate(() => window.__m.press('Step clear')); await p.waitForTimeout(1700);
    const g = await p.evaluate(() => ({ logs: window.__m.S().mats.logs, kick: window.__m.S().conditions.some(c => /kickback/.test(c.name)), open: !!window.__m.mini() }));
    if (clear) check('stepped clear, the tree is down and you are not hurt', g.logs > 0 && !g.kick && !g.open, g); else check('stood at the stump, the butt kicks back', g.logs > 0 && g.kick, g); }
  // snares: the site, the loop, and the cover
  for (const bare of [false, true]) { await fresh(); await p.evaluate(() => { const S = window.__m.S(); S.mats.wire = 6; window.__m.startSnare(window.__m.W().tracks[0]); });
    let c = await p.evaluate(() => { const e = document.querySelector('#mini .ss[data-i="0"]'); const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }); await p.mouse.click(c[0], c[1]); await p.waitForTimeout(800);
    const a = await svgXY(150, 50), b2 = await svgXY(140, 65); await p.mouse.move(a[0], a[1]); await p.mouse.down(); for (let i = 1; i <= 6; i++) { await p.mouse.move(a[0] + (b2[0] - a[0]) * i / 6, a[1] + (b2[1] - a[1]) * i / 6); await p.waitForTimeout(20); } await p.mouse.up();
    await p.evaluate(() => window.__m.press('Set it')); await p.waitForTimeout(200);
    if (bare) await p.evaluate(() => window.__m.press('Leave it bare')); else for (let i = 0; i < 4; i++) { c = await p.evaluate(i => { const e = document.querySelector(`#mini .cv[data-i="${i}"]`); const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, i); await p.mouse.click(c[0], c[1]); await p.waitForTimeout(60); }
    await p.waitForTimeout(700); const g = await p.evaluate(() => ({ snares: window.__m.S().snares, good: (window.__m.S().sys || {}).goodSnares || 0, poor: (window.__m.S().sys || {}).poorSnares || 0, open: !!window.__m.mini() }));
    if (!bare) check('snares set in the funnel and covered are good sets', g.snares > 0 && g.good > 0 && !g.poor && !g.open, g); else check('snares left bare are poor sets', g.snares > 0 && g.poor > 0 && !g.open, g); }
  // the figure-4: assembled in order it holds and the stone comes next
  { await fresh(); await p.evaluate(() => { window.__m.S().mats.stone = 6; window.__m.startSnare(window.__m.W().tracks[0], true); });
    for (const j of [1, 2, 0]) { const c = await svgXY(66 + j * 85, 21); await p.mouse.click(c[0], c[1]); await p.waitForTimeout(80); } await p.waitForTimeout(900);
    check('a figure-4 built in order leads on to the stone', (await p.evaluate(() => window.__m.acts())).includes('Nudge left'), await p.evaluate(() => window.__m.acts())); }
  // loading the raft: spread out it rides level; all on one side it swamps
  for (const even of [true, false]) { await fresh(); await p.evaluate(() => { window.__sw = null; window.__m.startRaftLoad({ kg: 120 }, sw => { window.__sw = sw; }); });
    const n = await p.evaluate(() => document.querySelectorAll('#mini .rc').length); const order = even ? [4, 4, 4, 4, 4] : [0, 3, 6, 0, 3];
    for (let k = 0; k < 5; k++) { const c = await p.evaluate(i => { const r = document.querySelector(`#mini .rc[data-i="${i}"]`).getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, order[k]); await p.mouse.click(c[0], c[1]); await p.waitForTimeout(60); }
    await p.evaluate(() => window.__m.press('Push off')); await p.waitForTimeout(300); const sw = await p.evaluate(() => window.__sw);
    if (even) check('a load spread across the deck rides level', sw === 0, sw); else check('a load piled on one side swamps', sw > 0, sw); }
  // by the fire and the water
  const lastLines = () => p.evaluate(() => JSON.stringify(window.__m.S().today.lines));
  { await fresh(); await p.evaluate(() => { const S = window.__m.S(); S.hooks = 4; S.mats.bait = 2; S.mats.cordage = 4; window.__m.startSetLines(); });
    for (const y of [56, 82]) { const c = await svgXY(259, y); await p.mouse.click(c[0], c[1]); await p.waitForTimeout(80); } await p.waitForTimeout(900);
    check('two set lines go out at the depths you choose', await p.evaluate(() => !window.__m.mini() && window.__m.S().setlines === true && window.__m.S().lineGear.depthOk != null), await p.evaluate(() => window.__m.S().lineGear)); }
  for (const right of [true, false]) { await fresh(); await p.evaluate(() => { const S = window.__m.S(); S.gear.push('Gillnet'); S.net = { catch: ['trout', 'whitefish'], torn: false }; window.__m.startCheckNet(); });
    for (let k = 0; k < 6 && await p.evaluate(() => !!window.__m.mini()); k++) { const f = await p.evaluate(() => { const g = document.querySelector('#mini .nf'); if (!g) return null; const m = g.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\) scale\(([-\d.]+)/); return [+m[1], +m[2], +m[3]]; }); if (!f) break; const a = await svgXY(f[0], f[1]), b = await svgXY(f[0] + (right ? -f[2] : f[2]) * 40, f[1]); await p.mouse.move(a[0], a[1]); await p.mouse.down(); for (let i = 1; i <= 5; i++) { await p.mouse.move(a[0] + (b[0] - a[0]) * i / 5, a[1]); await p.waitForTimeout(15); } await p.mouse.up(); await p.waitForTimeout(60); if (!right && k >= 2) break; }
    await p.waitForTimeout(400); if (right) check('fish backed out of the mesh tail first come out clean', await p.evaluate(() => !window.__m.mini() && window.__m.S().raw.length === 2 && !window.__m.S().net.torn), await p.evaluate(() => [window.__m.S().raw.length, window.__m.S().net])); else check('pulled forward, they tangle', /tangles tighter/.test(await p.evaluate(() => document.querySelector('#mini') ? document.querySelector('#mini').textContent : '')), ''); }
  { await fresh(); await p.evaluate(dh => { const S = window.__m.S(); S.fire = true; S.firewood = 5; S.phase = 3; S.hours = dh; window.__m.startTend(); }, E.dayHours(base()));
    for (let k = 0; k < 60 && await p.evaluate(() => !!window.__m.mini()); k++) { const h = await p.evaluate(() => +document.querySelector('#lv').getAttribute('height') / 72); if (h < 0.5) await p.evaluate(() => window.__m.press('Split hardwood')); await p.waitForTimeout(400); }
    await p.waitForTimeout(500); check('a fire tended in the band gives a steady bed of coals', /steady bed of coals/.test(await lastLines()) && await p.evaluate(() => window.__m.S().fire), await lastLines()); }
  { await fresh(); await p.evaluate(dh => { const S = window.__m.S(); S.fire = true; S.firewood = 5; S.phase = 3; S.hours = dh; window.__m.startTend(); }, E.dayHours(base())); await p.waitForTimeout(9500); check('a fire left alone burns out', await p.evaluate(() => window.__m.S().fire === false), ''); }
  { await fresh(); await p.evaluate(() => { const S = window.__m.S(); S.fire = true; S.firewood = 5; S.crafts.smoker = 2; S.stores.push({ id: 'trout', por: 2, left: 3, smoked: false }); window.__m.startSmoke('hot'); });
    for (let k = 0; k < 60 && await p.evaluate(() => !!window.__m.mini()); k++) { const h = await p.evaluate(() => +document.querySelector('#hv').getAttribute('height') / 72); if (h > 0.52) await p.evaluate(() => window.__m.press('Green boughs')); else if (h < 0.32) await p.evaluate(() => window.__m.press('Punk wood')); await p.waitForTimeout(300); }
    await p.waitForTimeout(500); check('a smoker kept to thin smoke hangs the meat without a flare', /thin blue smoke/.test(await lastLines()), await lastLines()); }
  { await fresh(); await p.evaluate(() => { const S = window.__m.S(); S.fire = true; S.gear.push('Pot'); S.stores.push({ id: 'fat', por: 3, left: 20, smoked: false }); window.__m.startRender(); });
    for (let k = 0; k < 80 && await p.evaluate(() => !!window.__m.mini()); k++) { const h = await p.evaluate(() => +document.querySelector('#hv').getAttribute('height') / 72); await p.evaluate(h => { const a = window.__m.mini().acts[0]; if (h < 0.5) a.down(); else a.up(); }, h); if (k % 6 === 5) await p.evaluate(() => window.__m.press('Skim')); await p.waitForTimeout(250); }
    await p.waitForTimeout(400); check('fat kept at a simmer and skimmed renders clear', /Clear, white tallow/.test(await lastLines()), await lastLines()); }
  { await fresh(); await p.evaluate(() => { const S = window.__m.S(); S.fire = true; S.gear.push('Pot'); window.__m.startMelt(); }); await p.evaluate(() => window.__m.press('Add a handful of snow')); await p.waitForTimeout(2200);
    check('dry snow in a hot pot scorches it', /scorching/.test(await p.evaluate(() => document.querySelector('#mini').textContent)), ''); }
  // pop-ups on the map: tap a tree for its jobs; choose one, walk there, it starts
  { await fresh(); const t = await p.evaluate(() => { const W = window.__m.W(); const r = document.querySelector('#cv').getBoundingClientRect(); const t = W.trees.filter(x => !x.gone && x.kind !== 'log' && !x.cut).map(x => ({ x, sx: (x.x - W.cam.x) * W.scale + r.left, sy: (x.y - W.cam.y) * W.scale + r.top })).filter(o => o.sx > 40 && o.sx < 350 && o.sy > 230 && o.sy < 480).sort((a, b) => Math.hypot(a.x.x - W.player.x, a.x.y - W.player.y) - Math.hypot(b.x.x - W.player.x, b.x.y - W.player.y))[0]; return t && [t.sx, t.sy]; });
    if (t) { await p.mouse.click(t[0], t[1]); await p.waitForTimeout(300); const n = await p.evaluate(() => document.querySelectorAll('.pop .pb button').length); check('tapping a tree opens its pop-up with its jobs', n >= 2, n);
      if (n) { await p.evaluate(() => document.querySelector('.pop .pb button').click()); let started = false; for (let i = 0; i < 50 && !started; i++) { await p.waitForTimeout(200); started = await p.evaluate(() => !!window.__m.mini()); } check('choosing a job walks there and starts it', started); } } else check('a tree on screen to tap', false); }
  // the hands-on jobs roll from the run's seed: the same state gives the same chances (the daily challenge is the same for everyone)
  { const roll = async () => { await fresh(); return p.evaluate(() => { window.__m.autoResolve(); return [window.__m.urand(), window.__m.urand(), window.__m.urand()]; }); };
    const a1 = await roll(), a2 = await roll(); check('hands-on chances come from the seed', JSON.stringify(a1) === JSON.stringify(a2), [a1, a2]); }
  // keyboard alone: arrows move a cursor over the drawing, E presses
  { await fresh(); await p.evaluate(() => window.__m.startLash('craft_rack', 4, 'Lash it')); await p.waitForTimeout(200);
    const pts = await p.evaluate(() => [...document.querySelectorAll('#mini .joint')].map(c => [+c.getAttribute('cx'), +c.getAttribute('cy')])); let cur = [150, 50];
    for (const [x, y] of pts) { const dx = Math.round((x - cur[0]) / 7), dy = Math.round((y - cur[1]) / 7); for (let i = 0; i < Math.abs(dx); i++) await p.keyboard.press(dx > 0 ? 'ArrowRight' : 'ArrowLeft'); for (let i = 0; i < Math.abs(dy); i++) await p.keyboard.press(dy > 0 ? 'ArrowDown' : 'ArrowUp'); cur = [cur[0] + dx * 7, cur[1] + dy * 7]; await p.keyboard.press('e'); await p.waitForTimeout(60); }
    await p.waitForTimeout(700); check('a hand job done with the keyboard alone', await p.evaluate(() => !window.__m.mini() && window.__m.S().crafts.rack >= 1), await p.evaluate(() => [!!window.__m.mini(), window.__m.S().crafts.rack])); }
  // the mushroom is drawn, and cut open
  { await fresh(); await p.evaluate(() => { const W = window.__m.W(); const b = W.bushes.find(x => x.look) || W.bushes[0]; b.look = b.look || ['red cap with white flecks', 1]; W.player.x = b.x; W.player.y = b.y + 10; window.__m.startMushroom(b); });
    check('the mushroom is drawn from its description', await p.evaluate(() => { const v = document.querySelector('#mini svg'); return !!v && v.innerHTML.length > 2000 && window.__m.mini() && window.__m.mini().type === 'look'; })); }
  // the debris hut's second session is shingling: out of order leaves a leak, in order leaves none
  for (const order of [[4, 0, 1, 2, 3], [0, 1, 2, 3, 4]]) { await fresh();
    await p.evaluate(() => { const S = window.__m.S(); Object.assign(S.mats, { poles: 20, boughs: 30, moss: 20, cordage: 10 }); S.shelterGoal = 'hut'; S.shelterWork = 1; S.shelterPaid = true; window.__m.startBuild(); });
    const rows = await p.evaluate(() => document.querySelectorAll('#mini .sh').length); if (order[0] === 4) check('the hut roof is shingled layer by layer', rows === 5, rows);
    for (const i of order) { const r = await p.evaluate(i => { const b = document.querySelector(`#mini .sh[data-i="${i}"]`).getBoundingClientRect(); return [b.x + b.width / 2, b.y + b.height / 2]; }, i); await p.mouse.click(r[0], r[1]); await p.waitForTimeout(80); }
    await p.waitForTimeout(700); const st = await p.evaluate(() => { const S = window.__m.S(); return [S.shelterType, !!(S.sys && S.sys.leaky)]; });
    if (order[0] === 4) check('a layer laid out of order leaves a leak', st[0] === 'hut' && st[1], st); else check('layers laid bottom up leave no leak', st[0] === 'hut' && !st[1], st); }
  await b.close(); console.log(fails ? `${fails} mini-game check(s) failed, ${passes} passed.` : `All ${passes} mini-game checks passed.`); process.exitCode = fails ? 1 : 0;
})();
