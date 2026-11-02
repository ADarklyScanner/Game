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
  { // a double tap runs a job once
    const s = E.newGame('US-S2', ['Ferro rod', 'Axe', 'Pot'], { seed: 4, weight: 200 }); E.beginDay(s); s.event = null;
    const { p, ctx, errs } = await page(b, save(s)); await p.waitForTimeout(400);
    const h0 = await p.evaluate(k => JSON.parse(localStorage.getItem(k)).hours, KEY);
    const tapped = await p.evaluate(() => { const btn = [...document.querySelectorAll('button')].find(e => /^rest/i.test(e.textContent.trim())); if (!btn) return false; btn.click(); btn.click(); return true; });
    await p.waitForTimeout(300); const h1 = await p.evaluate(k => JSON.parse(localStorage.getItem(k)).hours, KEY);
    if (!tapped) fail('double tap', 'no rest button to tap'); else if (Math.abs(h1 - h0 - 2) > 0.01) fail('double tap', `hours went ${h0} -> ${h1}, expected one two-hour rest`);
    if (errs.length) fail('double tap', errs.slice(0, 2)); await ctx.close();
  }
  for (const [k, v] of Object.entries(oldSaves)) for (let t = 0; t < 3; t++) { // 2. saves from older versions load, show no real names, and the map keeps running
    const { p, ctx, errs } = await page(b, v); await tapAround(p, 30);
    const g = await p.evaluate(k => JSON.parse(localStorage.getItem(k)), KEY); const txt = await p.evaluate(() => document.body.innerText);
    if (errs.length) fail('old save ' + k, errs.slice(0, 2));
    if (!g || g.rivalsV !== 1) fail('old save ' + k, 'not migrated');
    if (!g || !g.sys || g.sys.schema !== 1) fail('old save ' + k, 'no sys block after loading');
    const leak = oldNames.filter(n => new RegExp('\\b' + n + '\\b').test(txt) || (g && (g.rivals || []).some(r => r.name === n))); if (leak.length) fail('old save ' + k, 'old names: ' + leak.slice(0, 3));
    await ctx.close();
  }
  { // food: meat drying on the rack and in the smoker shows in the camp sheet with its progress
    const s = E.newGame('US-S2', ['Pot', 'Knife', 'Ferro rod', 'Axe', 'Saw', 'Fishing gear', 'Sleeping bag', 'Paracord', 'Tarp', 'Rations'], { seed: 9, weight: 200 });
    E.beginDay(s); s.event = null; s.fire = true; s.firewood = 10; s.mats.poles = 10; s.crafts.smoker = 2;
    E.act(s, 'craft_rack'); s.stores.push({ id: 'hare', por: 6, left: 4, smoked: false }, { id: 'trout', por: 3, left: 3, smoked: false }, { id: 'fat', por: 2, left: 3, smoked: false }, { id: 'grouse', por: 4, left: 120, smoked: false, dried: true, moist: 0.12 });
    E.act(s, 'dry_food'); s.stores.push({ id: 'pike', por: 3, left: 3, smoked: false }); E.act(s, 'smoke');
    const { p, ctx, errs } = await page(b, save(s)); await p.keyboard.press('c'); await p.waitForTimeout(400);
    const txt = await p.evaluate(() => document.body.innerText);
    for (const want of ['on the rack', 'in the smoker', '% water', 'dried']) if (!txt.includes(want)) fail('food sheet', `missing "${want}"`);
    await p.keyboard.press('Escape'); await p.waitForTimeout(800);
    const bar = await p.evaluate(() => document.body.innerText);
    await p.evaluate(() => { const m = [...document.querySelectorAll('button')].find(e => /^More…/.test(e.textContent.trim())); if (m) m.click(); }); await p.waitForTimeout(300);
    const more = await p.evaluate(() => document.body.innerText); if (!/Render fat/i.test(bar + more)) fail('food buttons', 'Render fat not offered at camp. Bar: ' + bar.replace(/\s+/g, ' ').slice(0, 300));
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    await tapAround(p, 40); if (errs.length) fail('food screens', errs.slice(0, 2)); await ctx.close();
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
