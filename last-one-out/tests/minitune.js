// Tuning harness (mini-game brief 3.5): plays the timing mini-games as three kinds of player and reports how often each does well.
// A "sharp" player reacts in about 0.15 s, an "average" one in about 0.25 s with more spread, a "slow" one in about 0.4 s.
// Targets for the average player: about 70% finish OK or better, 25 to 35% good, under 10% fail hard.
//   node minitune.js [runs per player, default 4] [mini names, comma separated]
// Not part of run-all: it is slow (each run is played in real time) and its numbers wobble from run to run.
const fs = require('fs'); const path = require('path'); const { chromium } = require('playwright');
const { loadGame } = require('./load-game'); const E = loadGame(process.env.GAME_FILE || undefined);
const SRC = process.env.GAME_FILE || path.join(__dirname, '..', 'index.html'); const TMP = '/tmp/last-one-out-tune.html';
const html = fs.readFileSync(SRC, 'utf8'); const hook = 'window.claude?.hot?.snapshot?.(() => ({ game: S }));';
let page = html.replace(hook, 'window.__m = { startCraft, startCook, startTend, startChop, S: () => S, W: () => W, mini: () => mini, act: l => mini && mini.acts.find(a => a.label === l) };\n' + hook);
page = page.replace('function doAct(id, extra, mod, inside) {', 'function doAct(id, extra, mod, inside) { (window.__res = window.__res || []).push({ id, x: extra || {} });');
fs.writeFileSync(TMP, page);
const N = +(process.argv[2] || 4); const only = process.argv[3] ? process.argv[3].split(',') : null;
const PLAYERS = { sharp: [150, 40], average: [250, 110], slow: [400, 160] };
const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
function base() { const s = E.newGame('US-S2', ['Pot', 'Knife', 'Ferro rod', 'Axe', 'Bow and arrows'], { seed: 31, weight: 200 }); s.campChosen = true; E.beginDay(s); s.event = null; s.storm = s.rain = s.fog = s.wind = false; s.fire = true; s.firewood = 20; s.arrows = 2;
  Object.assign(s.mats, { poles: 20, cordage: 20, clay: 12, hide: 6, bone: 4, feathers: 4, bark: 10, logs: 10 }); s.crafts.net = 1; s.found.push({ cls: 'Netting', name: 'Netting' }); s.sys = Object.assign(E.sysOf(s), { flint: 2 }); s.gear = s.gear.filter(g => g !== 'Knife'); s.gear.push('Knife');
  s.stores.push({ id: 'fat', por: 4, left: 90, smoked: false, rendered: true }, { id: 'hare', por: 4, left: 120, smoked: false, dried: true, moist: 0.12 }, { id: 'trout', por: 3, left: 3, smoked: false }); return s; }
// each mini: start it, then play it; the reaction delay is drawn per decision
const wait = (p, ms) => p.waitForTimeout(Math.max(0, ms));
const hold = async (p, label, test, react, ms = 6000) => { await p.evaluate(l => window.__m.act(l).down(), label); const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await p.evaluate(test)) break; await wait(p, 10); } await wait(p, react()); await p.evaluate(l => { const a = window.__m.act(l); if (a && a.up) a.up(); }, label); };
const MINIS = {
  knap: { start: p => p.evaluate(() => window.__m.startCraft('craft_stoneblade', false)), play: async (p, react) => { for (let i = 0; i < 16 && await p.evaluate(() => !!window.__m.mini()); i++) { const c = await p.evaluate(i => { const e = [...document.querySelectorAll('#mini .ks')].find(x => x.getAttribute('fill') !== 'rgba(170,200,160,.35)'); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, i); if (!c) break; await p.mouse.click(c[0], c[1]); for (let k = 0; k < 300; k++) { if (await p.evaluate(() => (document.querySelector('#angt') || {}).textContent === 'now')) break; await wait(p, 10); } await wait(p, react()); await p.evaluate(() => { const a = window.__m.act('Strike'); if (a) a.fn(); }); await wait(p, 120); } } },
  coil: { start: p => p.evaluate(() => window.__m.startCraft('shape_pot', false)), play: async (p, react) => { for (let i = 0; i < 6 && await p.evaluate(() => !!window.__m.mini()); i++) { await hold(p, 'Roll a coil', () => +document.querySelector('#thk').getAttribute('height') / 76 >= 0.5, react); await wait(p, 150 + react()); await p.evaluate(() => { const a = window.__m.act('Smooth it in'); if (a) a.fn(); }); await wait(p, 100); } } },
  mesh: { start: p => p.evaluate(() => window.__m.startCraft('craft_net', false)), play: async (p, react) => { for (let i = 0; i < 10 && await p.evaluate(() => !!window.__m.mini()); i++) { await hold(p, 'Pull the loop', () => +document.querySelector('#loop').getAttribute('r') >= 15, react); await wait(p, 120); } } },
  cook: { start: p => p.evaluate(() => window.__m.startCook()), play: async (p, react) => { let inCoals = false; /* a thoughtful cook: coals while both sides are pale, the edge when they brown, turn when the underside darkens */
    for (let k = 0; k < 600 && await p.evaluate(() => !!window.__m.mini()); k++) { const st = await p.evaluate(() => { const t = (document.querySelector('#padtext') || {}).textContent || ''; const u = +document.querySelector('#bch').getAttribute('width') / 230; return { t, u }; });
      if (/Done through/.test(st.t)) { await wait(p, react()); await p.evaluate(() => { const a = window.__m.act('Take it off'); if (a) a.fn(); }); break; }
      if (st.u > 0.55) { await wait(p, react()); await p.evaluate(() => { const a = window.__m.act('Turn it'); if (a) a.fn(); }); await wait(p, 200); }
      const want = st.u < 0.35; if (want !== inCoals) { await wait(p, react()); await p.evaluate(w => { const a = window.__m.act('Into the coals'); if (a) (w ? a.down() : a.up()); }, want); inCoals = want; }
      await wait(p, 40); } } },
  chop: { start: p => p.evaluate(() => { const W = window.__m.W(); const t = W.trees.find(x => !x.gone && x.kind !== 'log' && x.age === 'mature'); W.player.x = t.x - 30; W.player.y = t.y + 10; window.__m.startChop(t, 'firewood'); }), play: async (p, react, mu0) => { for (let i = 0; i < 12 && await p.evaluate(() => !!window.__m.mini()); i++) { for (let k = 0; k < 300; k++) { if (await p.evaluate(() => { const m = window.__m.mini(); return m && Math.abs(m.pos - 0.5) < 0.04; })) break; await wait(p, 4); } await wait(p, Math.abs(react() - mu0) * 0.6); /* a rhythm, not a reaction: the error is timing, around the beat */ await p.evaluate(() => { const a = window.__m.act('Swing'); if (a) a.fn(); }); await wait(p, 250); } } },
};
(async () => { const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  const KEY = 'last-one-out-v1'; const save = s => JSON.stringify(s, (k, v) => v === Infinity ? 1e9 : v); const rows = [];
  for (const [name, m] of Object.entries(MINIS)) { if (only && !only.includes(name)) continue;
    for (const [who, [mu, sd]] of Object.entries(PLAYERS)) { let good = 0, ok = 0, fail = 0;
      for (let i = 0; i < N; i++) { await pg.goto('file://' + TMP); await pg.evaluate(([k, v]) => localStorage.setItem(k, v), [KEY, save(base())]); await pg.reload(); await pg.waitForTimeout(500); await pg.evaluate(() => { window.__res = []; });
        await m.start(pg); await pg.waitForTimeout(200); await m.play(pg, () => mu + sd * gauss(), mu); await pg.waitForTimeout(800);
        const r = await pg.evaluate(() => (window.__res || []).slice(-1)[0]); if (!r) { fail++; if (process.env.TUNE_DEBUG) console.log('  no result:', await pg.evaluate(() => (document.querySelector('#padtext') || {}).textContent)); continue; } if (process.env.TUNE_DEBUG) console.log('  ', JSON.stringify(r.x)); const x = r.x;
        const hard = x.out || x.scorch || x.flare || (x.heat === 'burnt') || (name === 'knap' && x.faults >= 5); if (hard) fail++; else if (x.good === true || x.heat === 'right') good++; else if (x.heat !== 'under') ok++; }
      rows.push({ name, who, good: good / N, okOrBetter: (good + ok) / N, fail: fail / N }); console.log(`${name.padEnd(6)} ${who.padEnd(8)} good ${Math.round(good / N * 100)}%  ok or better ${Math.round((good + ok) / N * 100)}%  hard fail ${Math.round(fail / N * 100)}%`); } }
  const avg = rows.filter(r => r.who === 'average'); for (const r of avg) { const w = []; if (r.okOrBetter < 0.6) w.push('too hard to finish'); if (r.good > 0.6) w.push('too easy to do well'); if (r.good < 0.15) w.push('too hard to do well'); if (r.fail > 0.15) w.push('fails too often'); if (w.length) console.log(`  check ${r.name}: ${w.join(', ')} for an average player`); }
  if (errs.length) console.log('page errors:', errs.slice(0, 3)); await b.close(); })();
