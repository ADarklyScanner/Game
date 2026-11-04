// A real browser save from before the show-independence pass must keep loading: same place, same day, same kit.
//   node oldsave.js --record   play a day in the browser and keep the save as fixtures/old-save.json      node oldsave.js   load it back
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const FILE = 'file://' + path.resolve(__dirname, process.env.GAME_FILE || '../index.html'); const OUT = path.join(__dirname, 'fixtures', 'old-save.json');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(FILE); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(500);
  if (process.argv.includes('--record')) {
    await p.click('#popular'); await p.click('.big-btn'); await p.waitForTimeout(1500);
    const save = await p.evaluate(() => { const k = Object.keys(localStorage).find(k => /last-one-out/.test(k)); return { key: k, value: localStorage.getItem(k), records: localStorage.getItem('loo-records') }; });
    fs.mkdirSync(path.dirname(OUT), { recursive: true }); fs.writeFileSync(OUT, JSON.stringify(save)); console.log('Recorded a save:', save.key, save.value.length, 'bytes'); await b.close(); return;
  }
  const save = JSON.parse(fs.readFileSync(OUT, 'utf8')); const want = JSON.parse(save.value);
  await p.evaluate(s => { localStorage.setItem(s.key, s.value); if (s.records) localStorage.setItem('loo-records', s.records); }, save); await p.reload(); await p.waitForTimeout(1500);
  const got = await p.evaluate(k => JSON.parse(localStorage.getItem(k)), save.key);
  const ok = got && got.seasonKey === want.seasonKey && got.day === want.day && JSON.stringify(got.gear) === JSON.stringify(want.gear) && got.status === want.status;
  const inGame = await p.$('canvas') !== null;
  console.log(ok && inGame && !errs.length ? 'The old save loads: same place, day and kit.' : 'FAIL old save: ' + JSON.stringify({ ok, inGame, errs, place: got && got.seasonKey, day: got && got.day }));
  process.exitCode = ok && inGame && !errs.length ? 0 : 1; await b.close();
})();
