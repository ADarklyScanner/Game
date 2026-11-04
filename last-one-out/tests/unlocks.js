// Places open a difficulty group at a time; played places stay open; "Open every place" opens all.  node unlocks.js
const { chromium } = require('playwright'); const path = require('path');
let fails = 0, passes = 0; const check = (name, ok, detail) => { if (ok) passes++; else { fails++; console.log('FAIL', name, detail ?? ''); } };
const FILE = 'file://' + path.resolve(__dirname, process.env.GAME_FILE || '../index.html');
async function cards(p, records) {
  await p.goto(FILE); await p.evaluate(r => { localStorage.clear(); if (r) localStorage.setItem('loo-records', JSON.stringify(r)); }, records || null);
  await p.reload(); await p.waitForTimeout(500);
  return p.$$eval('.season', els => els.map(e => ({ name: e.querySelector('b').textContent.split(' · ')[0], diff: e.querySelector('.diff').textContent, open: !e.classList.contains('locked'), pressed: e.getAttribute('aria-pressed') === 'true' })));
}
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  let c = await cards(p);
  check('a new player has only the forgiving places open', c.every(x => x.open === (x.diff === 'Forgiving')), c.filter(x => x.open).map(x => x.diff));
  check('the chosen place is an open one', c.some(x => x.pressed && x.open));
  const locked = await p.$('.season.locked'); await locked.click(); check('a locked place cannot be chosen', !(await locked.getAttribute('aria-pressed') === 'true'));
  check('a locked place says how to open it', /Last 30 days/.test(await locked.textContent()));
  // thirty days in a forgiving place (Subarctic Shore is US-S6) opens the tough places
  c = await cards(p, { seasons: { 'US-S6': { runs: 1, bestDays: 31, bestPlace: 7, wins: 0 } }, badges: {} });
  check('thirty days in a forgiving place opens the tough ones', c.every(x => x.open === ['Forgiving', 'Tough'].includes(x.diff)), c.filter(x => x.open).map(x => x.diff));
  c = await cards(p, { seasons: { 'US-S6': { runs: 1, bestDays: 12, bestPlace: 4, wins: 0 } }, badges: {} });
  check('outlasting half the field also opens them', c.some(x => x.diff === 'Tough' && x.open));
  c = await cards(p, { seasons: { 'US-S6': { runs: 1, bestDays: 12, bestPlace: 8, wins: 0 } }, badges: {} });
  check('a short run does not', !c.some(x => x.diff === 'Tough' && x.open));
  c = await cards(p, { seasons: { 'US-S12': { runs: 1, bestDays: 4, bestPlace: 10, wins: 0 } }, badges: {} });
  check('a place already played stays open', c.find(x => x.name === 'Dry Karoo').open);
  c = await cards(p, { seasons: {}, badges: {}, openAll: true });
  check('"Open every place" opens them all', c.every(x => x.open));
  await cards(p); await p.click('details:has(#openall) summary'); await p.check('#openall'); await p.waitForTimeout(200);
  check('the option works from the screen', (await p.$$('.season.locked')).length === 0);
  check('the daily challenge is always there', !!(await p.$('.daily')));
  check('no page errors', !errs.length, errs);
  await b.close();
  console.log(fails ? `${fails} unlock check(s) failed, ${passes} passed.` : `All ${passes} unlock checks passed.`); process.exitCode = fails ? 1 : 0;
})();
