// Steps 5 and 6: every screen, panel and mini-game at five sizes and several game phases, plus full days played through the page.
// Records which screen functions ran (browser coverage) into .coverage.json.  node screens.js
const fs = require('fs'); const path = require('path'); const { chromium } = require('playwright');
const { loadGame } = require('./load-game'); const { mark } = require('./cover'); const E = loadGame(process.env.GAME_FILE || undefined); const D = E.DATA;
const SRC = process.env.GAME_FILE || path.join(__dirname, '..', 'index.html'); const TMP = '/tmp/last-one-out-screens.html'; const html = fs.readFileSync(SRC, 'utf8');
const hook = 'window.claude?.hot?.snapshot?.(() => ({ game: S }));';
const names = [...new Set([...html.matchAll(/function ((?:start|open|render)[A-Z]\w*)\(/g)].map(m => m[1]))];
fs.writeFileSync(TMP, html.replace(hook, `window.__t = { S: () => S, W: () => W, mini: () => mini, cancel: () => { if (mini) mini.cancel(); }, call: (n, ...a) => ({ ${names.map(n => `${n}`).join(', ')} })[n](...a) };\n` + hook));
const KEY = 'last-one-out-v1'; const save = s => JSON.stringify(s, (k, v) => v === Infinity ? 1e9 : v);
let fails = 0, passes = 0; const issues = new Map(); const fail = (k, d) => { fails++; if (!issues.has(k)) issues.set(k, d); }; const pass = () => passes++;
const PHASES = {
  morning: s => {}, dusk: s => { s.hours = E.dayHours(s) - 0.8; s.phase = 2; }, night: s => { s.hours = E.dayHours(s); s.phase = 3; s.fire = true; },
  inside: s => { s.shelterType = 'cabin'; s.shelterLvl = 3; s.fireInside = true; s.fire = true; }, event: s => { s.event = { id: 'grouse', title: 'Grouse on a branch', text: 'A grouse.', options: [{ label: 'Throw a stick', sub: '' }, { label: 'Take an arrow shot', sub: '' }, { label: 'Let it be', sub: '' }], optIds: [0, 1, 2], phase: 0 }; },
  ended: s => { s.status = 'medical'; s.endReason = 'Test ending.'; },
};
function state(place, phase) {
  const s = E.newGame(place, ['Pot', 'Knife', 'Ferro rod', 'Axe', 'Saw', 'Fishing gear', 'Sleeping bag', 'Paracord', 'Bow and arrows', 'Gillnet'], { seed: 42, weight: 200 }); s.campChosen = true;
  E.beginDay(s); s.event = null; s.storm = s.rain = false; Object.assign(s.mats, { poles: 20, cordage: 20, stone: 20, clay: 12, moss: 10, boughs: 20, hide: 6, bone: 4, feathers: 4, bark: 10, logs: 10, tinder: 5 });
  s.fire = true; s.firewood = 20; s.stores.push({ id: 'hare', por: 3, left: 4, smoked: false }, { id: 'fat', por: 2, left: 90, smoked: false, rendered: true }); s.raw.push({ id: 'trout', por: 2, left: 2 });
  s.carcass = { id: 'hare', por: 3, big: false, dressed: false, day: s.day }; PHASES[phase](s); return s;
}
(async () => {
  const b = await chromium.launch(); const WIDTHS = [[320, 640], [375, 812], [430, 932], [768, 1024], [1280, 800]];
  const ran = new Set();
  async function open(vp, s) { const ctx = await b.newContext({ viewport: { width: vp[0], height: vp[1] } }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.coverage.startJSCoverage({ reportAnonymousScripts: true });
    await p.goto('file://' + TMP); if (s) { await p.evaluate(([k, v]) => localStorage.setItem(k, v), [KEY, save(s)]); await p.reload(); } await p.waitForTimeout(500); return { ctx, p, errs }; }
  async function close({ ctx, p }) { const cov = await p.coverage.stopJSCoverage(); for (const e of cov) for (const f of e.functions) if (f.functionName && f.ranges.some(r => r.count > 0)) ran.add(f.functionName); await ctx.close(); }
  const wide = p => p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  // 1. the setup screen at every size; start a game from it
  for (const vp of WIDTHS) { const t = await open(vp, null); if (await wide(t.p)) fail(`setup screen wider than ${vp[0]}px`, ''); else pass(); await t.p.evaluate(() => [...document.querySelectorAll('button')].find(e => /Drop me off/.test(e.textContent)).click()); await t.p.waitForTimeout(500); if (t.errs.length) fail(`setup/start errors at ${vp[0]}`, t.errs[0]); else pass(); await close(t); }
  // 2. every panel in every phase at every size
  const panels = names.filter(n => n.startsWith('open'));
  for (const vp of WIDTHS) for (const ph of Object.keys(PHASES)) { const t = await open(vp, state('US-S6', ph));
    for (const pn of panels) { await t.p.evaluate(n => { document.querySelectorAll('.scrim').forEach(x => x.remove()); try { window.__t.call(n); } catch (e) { window.__err = (window.__err || []).concat(n + ': ' + e.message); } }, pn).catch(e => t.errs.push(pn + ': ' + e.message)); await t.p.waitForTimeout(120);
      if (await wide(t.p)) fail(`${pn} wider than the screen at ${vp[0]}px (${ph})`, ''); else pass();
      // press every reachable button in the panel once (not the destructive ones)
      await t.p.evaluate(() => { const sc = document.querySelector('.scrim'); if (!sc) return; for (const btn of [...sc.querySelectorAll('button')].slice(0, 12)) { if (/Abandon|Delete|Tap out|press again|Drop me/i.test(btn.textContent)) continue; const r = btn.getBoundingClientRect(); const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); if (top && (top === btn || btn.contains(top))) { try { btn.click(); } catch (e) {} } } }); await t.p.waitForTimeout(80);
    }
    const inner = await t.p.evaluate(() => window.__err || []); for (const e of inner) fail(`panel threw (${ph}, ${vp[0]}px)`, e);
    if (t.errs.length) fail(`page errors in panels (${ph}, ${vp[0]}px)`, t.errs.slice(0, 2).join(' | ')); else pass(); await close(t); }
  // 3. every mini-game started, then abandoned, at phone size
  const minis = [['startFish', [false]], ['startHunt', [null]], ['startTrack', []], ['startClean', []], ['startDress', []], ['startCordage', []], ['startFire', []], ['startLash', ['craft_rack', 4, 'Lash it']], ['startBuild', []], ['startCook', []], ['startFilter', []], ['startSlice', []], ['startRepair', []], ['startNet', []], ['startTrapline', []], ['startSharpen', []], ['startTrace', ['fish', null]], ['startCollect', ['stones', 'stone']], ['startCraft', ['craft_bow']], ['startCraft', ['mend']], ['startCraft', ['work_hide']], ['startCraft', ['fire_pots']], ['startCraft', ['craft_lamp']], ['startCraft', ['cairn', false, { x: 1, y: 1 }]], ['startCraft', ['craft_hearth']]];
  for (const ph of ['morning', 'inside']) { const s = state('US-S2', ph); s.wounded = { id: 'hare', p: 0.5 }; s.crafts.bow = 1; s.sys = Object.assign(E.sysOf(s), { greenPots: [{ dry: 1, temper: true }], clothes: 0.5, needle: true }); s.shelterGoal = 'hut'; s.shelterType = s.shelterType || 'leanto'; s.shelterLvl = s.shelterLvl || 1; s.shelterCond = 0.4;
    const t = await open([390, 844], s);
    for (const [fn, args] of minis) { await t.p.evaluate(([fn, args]) => { try { if (fn === 'startTrace') args = [args[0], () => {}]; window.__t.call(fn, ...args); } catch (e) { window.__err = (window.__err || []).concat(fn + ': ' + e.message); } }, [fn, args]); await t.p.waitForTimeout(250); await t.p.evaluate(() => window.__t.cancel()); await t.p.waitForTimeout(100); }
    // the ones that need a tree, a bush or a trail from the world
    await t.p.evaluate(() => { const W = window.__t.W(); const tr = W.trees.find(x => !x.gone && x.kind !== 'log'); const bush = W.bushes.find(x => x.look) || W.bushes[0]; const track = (W.tracks || [])[0]; const calls = [['startChop', [tr, 'firewood']], ['startMushroom', [bush]], ['startSnare', [track]], ['startHunt', [W.animals[0] || null]]]; for (const [fn, a] of calls) { try { if (a[0]) window.__t.call(fn, ...a); window.__t.cancel(); } catch (e) { window.__err = (window.__err || []).concat(fn + ': ' + e.message); } } });
    const inner = await t.p.evaluate(() => window.__err || []); for (const e of inner) fail(`mini-game threw (${ph})`, e); if (t.errs.length) fail(`page errors in mini-games (${ph})`, t.errs.slice(0, 3).join(' | ')); else pass(); await close(t); }
  // 4. the end screen at every size, and full days played through the page by pressing the first offered job
  for (const vp of WIDTHS) { const t = await open(vp, state('US-S6', 'ended')); await t.p.waitForTimeout(300); if (await wide(t.p)) fail(`end screen wider than ${vp[0]}px`, ''); else pass(); if (t.errs.length) fail('end screen errors', t.errs[0]); await close(t); }
  for (const place of ['US-S6', 'US-S12', 'AU-S4']) { const s = state(place, 'morning'); const t = await open([390, 844], s); let days = 0; const d0 = s.day;
    for (let i = 0; i < 400 && days < 6; i++) { const st = await t.p.evaluate(() => { const S = window.__t.S(); if (!S || S.status !== 'playing') return 'over'; const sc = document.querySelector('.scrim'); if (sc) { /* a picker is open: answer it as a player would, or close it */ window.__sc = (window.__sc || 0) + 1; const sb = window.__sc < 4 && [...sc.querySelectorAll('button.act:not(:disabled)')].find(x => !/Abandon|Delete|Tap out|Drop|press again/i.test(x.textContent)); if (sb) sb.click(); else { sc.remove(); W_unpause: { const w = window.__t.W(); if (w) w.paused = false; } } return S.day; } window.__sc = 0; const b = [...document.querySelectorAll('button.actbtn')].filter(x => (x.offsetParent || x.dataset.tool) && !/Tap out|Abandon|Move camp/i.test(x.textContent)); const pick = b.find(x => /Sleep|Turn in|Wake|Continue|Start the day/i.test(x.textContent)) || b.find(x => x.offsetParent) || b[0]; if (pick && !pick.offsetParent && pick.dataset.tool) { const tab = document.querySelector(`.tool[data-tool="${pick.dataset.tool}"]`); if (tab && !tab.classList.contains('sel')) tab.click(); } const live = pick && ([...document.querySelectorAll('button.actbtn')].find(x => x.offsetParent && x.textContent === pick.textContent) || pick); if (live) live.click(); else window.__t.cancel(); return S.day; }); if (st === 'over') break; days = st - d0; await t.p.waitForTimeout(60); }
    if (t.errs.length) fail(`errors playing ${place} through the page`, t.errs.slice(0, 2).join(' | ')); else pass(); await close(t); }
  for (const n of names) if (ran.has(n)) mark(n.startsWith('start') ? 'ui-mini' : n.startsWith('open') ? 'ui-panel' : 'ui-screen', n);
  const missed = names.filter(n => !ran.has(n) && n !== 'startGame'); await b.close();
  console.log(`Screen functions run: ${names.length - missed.length} of ${names.length}${missed.length ? ' (missed: ' + missed.join(', ') + ')' : ''}.`);
  for (const [k, d] of issues) console.log(`  FAIL ${k}${d ? ': ' + String(d).slice(0, 200) : ''}`);
  console.log(fails ? `${fails} screen problem(s), ${passes} checks passed.` : `All ${passes} screen checks passed.`); process.exit(fails ? 1 : 0);
})();
