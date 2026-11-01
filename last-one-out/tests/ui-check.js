// Opens the real page in a headless browser and checks the screens players see.  node ui-check.js
// Needs Playwright (preinstalled in Claude cloud sessions; elsewhere: npm i playwright && npx playwright install chromium).
const path = require('path'); const { chromium } = require('playwright');
const { loadGame } = require('./load-game'); const { makeBot } = require('./bot');
const FILE = process.env.GAME_FILE || path.join(__dirname, '..', 'index.html'); const URL = 'file://' + path.resolve(FILE);
const KEY = 'last-one-out-v1'; const E = loadGame(process.env.GAME_FILE || undefined); const D = E.DATA;
const oldSaves = require('./fixtures/old-saves.json'); const oldNames = require('./fixtures/old-names.json');
const save = s => JSON.stringify(s, (k, v) => v === Infinity ? 1e9 : v);
let failures = 0; const fail = (what, detail) => { failures++; console.log('FAIL', what, detail || ''); };
async function page(b, saveText) {
  const ctx = await b.newContext({ viewport: { width: 375, height: 800 } }); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); await p.goto(URL);
  if (saveText) { await p.evaluate(([k, v]) => localStorage.setItem(k, v), [KEY, saveText]); await p.reload(); }
  await p.waitForTimeout(500); return { p, ctx, errs };
}
const reachable = () => [...document.querySelectorAll('button')].filter(e => { const r = e.getBoundingClientRect(); if (!r.width || e.disabled) return false; const t = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return t && (t === e || e.contains(t)); });
async function tapAround(p, n) { for (let i = 0; i < n; i++) { await p.evaluate(`(${reachable})().filter(e => !/Abandon|Delete|Tap out|press again/i.test(e.textContent))`).catch(() => {}); await p.evaluate(`(() => { const v = (${reachable})().filter(e => !/Abandon|Delete|Tap out|press again/i.test(e.textContent)); const pref = v.filter(e => /^(Rest|Sleep|Wake|Continue|Next)/i.test(e.textContent.trim())); const el = pref.length && Math.random() < 0.5 ? pref[0] : v[Math.floor(Math.random() * v.length)]; if (el) el.click(); })()`); await p.waitForTimeout(40); } }
(async () => {
  const b = await chromium.launch();
  { // 1. a new run starts and plays without errors
    const { p, ctx, errs } = await page(b);
    await p.evaluate(() => [...document.querySelectorAll('button')].find(e => /Drop me off/.test(e.textContent)).click());
    await p.waitForTimeout(600); await tapAround(p, 60);
    if (errs.length) fail('new run', errs.slice(0, 2)); if (await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)) fail('new run', 'wider than a phone screen');
    await ctx.close();
  }
  for (const [k, v] of Object.entries(oldSaves)) for (let t = 0; t < 3; t++) { // 2. saves from older versions load, show no real names, and the map keeps running
    const { p, ctx, errs } = await page(b, v); await tapAround(p, 30);
    const g = await p.evaluate(k => JSON.parse(localStorage.getItem(k)), KEY); const txt = await p.evaluate(() => document.body.innerText);
    if (errs.length) fail('old save ' + k, errs.slice(0, 2));
    if (!g || g.rivalsV !== 1) fail('old save ' + k, 'not migrated');
    const leak = oldNames.filter(n => txt.includes(n) || (g && (g.rivals || []).some(r => r.name === n))); if (leak.length) fail('old save ' + k, 'old names: ' + leak.slice(0, 3));
    await ctx.close();
  }
  for (const se of D.seasons) { // 3. late game and every kind of ending, in every place
    const s = E.newGame(se.key, [...D.gear].sort((a, c) => c.rate - a.rate).slice(0, 10).map(g => g.id), { seed: 77, weight: 200 }); const bot = makeBot(E, s);
    let last = save(s); while (s.status === 'playing' && s.day < 200) { last = save(s); E.runDay(s, bot); }
    for (const end of ['playing', 'won', 'medical', 'tapped']) {
      const g = JSON.parse(last); if (end !== 'playing') { g.status = end; g.endReason = 'Test ending.'; if (end === 'won') g.day = g.winDay; }
      const { p, ctx, errs } = await page(b, JSON.stringify(g)); const shown = await p.evaluate(() => document.body.innerText); await tapAround(p, end === 'playing' ? 40 : 10);
      if (errs.length) fail(`${se.key} ${end} at day ${g.day}`, errs.slice(0, 2));
      if (await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)) fail(`${se.key} ${end}`, 'wider than a phone screen');
      if (end === 'medical' || end === 'tapped') { const m = shown.match(/place (\d+) of (\d+)/); if (!m) fail(`${se.key} ${end}`, 'no placing shown'); }
      await ctx.close();
    }
  }
  await b.close(); console.log(failures ? `${failures} problem(s).` : 'All screen checks passed.'); process.exit(failures ? 1 : 0);
})();
