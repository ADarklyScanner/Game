// The in-game self-check (#selfcheck): off for players, on with the hash; it spots a broken state and builds a report.  node selfcheck.js
const fs = require('fs'); const path = require('path'); const { chromium } = require('playwright');
const SRC = process.env.GAME_FILE || path.join(__dirname, '..', 'index.html'); const TMP = '/tmp/last-one-out-selfcheck.html';
const html = fs.readFileSync(SRC, 'utf8'); const hook = 'window.claude?.hot?.snapshot?.(() => ({ game: S }));';
if (!html.includes(hook)) throw new Error('hook point not found'); fs.writeFileSync(TMP, html.replace(hook, 'window.__sc = { S: () => S, report: () => selfReport() };\n' + hook));
let fails = 0, passes = 0; const check = (name, ok, detail) => { if (ok) passes++; else { fails++; console.log('FAIL', name, detail ?? ''); } };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const play = async (hash) => { await p.goto('file://' + TMP + hash); await p.evaluate(() => localStorage.clear()); await p.goto('file://' + TMP + hash); await p.reload(); await p.waitForTimeout(500); await p.click('#popular'); await p.click('.big-btn'); await p.waitForTimeout(1200); };
  await play(''); check('players do not see it', !(await p.$('#selfrep')));
  await play('#selfcheck'); check('#selfcheck adds the report button', !!(await p.$('#selfrep')));
  const clean = JSON.parse(await p.evaluate(() => window.__sc.report())); check('a fresh game has no problems', clean.problems.length === 0, clean.problems);
  await p.evaluate(() => { window.__sc.S().mats.poles = -5; }); await p.waitForTimeout(3600);
  const shown = await p.evaluate(() => document.querySelector('#banner') ? document.querySelector('#banner').textContent : '');
  check('a broken state raises the banner', /Self-check: negative poles/.test(shown), shown);
  const rep = JSON.parse(await p.evaluate(() => window.__sc.report())); check('the report holds the problem and the state', rep.problems.some(x => /negative poles/.test(x)) && rep.state && rep.state.mats.poles === -5 && rep.first && rep.log.length > 0);
  check('no page errors', !errs.length, errs.slice(0, 3));
  await b.close(); console.log(fails ? `${fails} self-check check(s) failed, ${passes} passed.` : `All ${passes} self-check checks passed.`); process.exitCode = fails ? 1 : 0;
})();
