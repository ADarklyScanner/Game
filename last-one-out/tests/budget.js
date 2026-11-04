// The gear budget: costs add up, the screen refuses what does not fit, and the run remembers the rule.  node budget.js
const { chromium } = require('playwright'); const path = require('path');
const { loadGame } = require('./load-game'); const E = loadGame(process.env.GAME_FILE || undefined);
let fails = 0, passes = 0; const check = (name, ok, detail) => { if (ok) passes++; else { fails++; console.log('FAIL', name, detail ?? ''); } };
check('every item has a cost', E.DATA.gear.every(g => E.GEAR_COST[g.id] >= 1), E.DATA.gear.filter(g => !E.GEAR_COST[g.id]).map(g => g.id));
const popular = E.DATA.gear.slice(0, 10).map(g => g.id);
check('the ten most common do not fit the budget', E.kitCost(popular) > E.BUDGET, E.kitCost(popular));
check('a budget run remembers it', E.newGame('US-S6', ['Axe'], { seed: 1, budget: true }).opts.budget === E.BUDGET && !E.newGame('US-S6', ['Axe'], { seed: 1 }).opts.budget);
const names = els => els.map(e => e.closest('.item').dataset.id);
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, process.env.GAME_FILE || '../index.html')); await p.waitForTimeout(600);
  await p.click('.rule[data-b="1"]'); await p.click('#popular');
  const picked = await p.$$eval('.item[aria-pressed="true"] span', names);
  check('filling with the most common stays within the budget', picked.length > 0 && E.kitCost(picked) <= E.BUDGET, picked);
  const over = await p.$$('.item.over');
  if (over.length) { await over[0].click(); check('an item that does not fit cannot be added', (await p.$$('.item[aria-pressed="true"]')).length === picked.length); }
  check('the count shows points', /of 20 points/.test(await p.textContent('#count')));
  await p.click('.rule[data-b="0"]'); await p.click('#popular');
  check('any ten still takes all ten', (await p.$$('.item[aria-pressed="true"]')).length === 10);
  await p.click('.rule[data-b="1"]'); const kept = await p.$$eval('.item[aria-pressed="true"] span', names);
  check('switching to the budget drops what does not fit', E.kitCost(kept) <= E.BUDGET, kept);
  check('no page errors', !errs.length, errs);
  await b.close();
  console.log(fails ? `${fails} budget check(s) failed, ${passes} passed.` : `All ${passes} budget checks passed.`); process.exitCode = fails ? 1 : 0;
})();
