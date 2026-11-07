// Camping, the practice valley: its rules in the engine, and the start option, lessons and map in the page.  node camping.js
const fs = require('fs'); const path = require('path'); const { chromium } = require('playwright');
const { loadGame } = require('./load-game'); const E = loadGame(process.env.GAME_FILE || undefined);
const SRC = process.env.GAME_FILE || path.join(__dirname, '..', 'index.html'); const TMP = '/tmp/last-one-out-camping.html';
const html = fs.readFileSync(SRC, 'utf8'); const hook = 'window.claude?.hot?.snapshot?.(() => ({ game: S }));';
fs.writeFileSync(TMP, html.replace(hook, 'window.__t = { S: () => S, W: () => W, MAP: () => MAP, L: () => LESSONS, tgt: w => lessonTarget(w), rec: () => records };\n' + hook));
let fails = 0, passes = 0; const check = (name, ok, detail) => { if (ok) passes++; else { fails++; console.log('FAIL', name, detail ?? ''); } };
const KIT = ['Knife', 'Pot', 'Ferro rod', 'Axe', 'Fishing gear', 'Sleeping bag', 'Tarp', 'Paracord', 'Bow and arrows', 'Saw'];
{ // the engine
  check('Camping is not one of the drop sites', !E.DATA.seasons.some(x => x.key === E.PRACTICE_KEY));
  const s = E.newGame(E.PRACTICE_KEY, KIT, { seed: 3, weight: 200 }); E.beginDay(s); s.event = null; s.campChosen = true;
  check('a practice game, with no rivals and no win day', s.practice === true && s.rivals.length === 0 && s.winDay >= 9999, [s.practice, s.rivals.length, s.winDay]);
  const se = E.season(s); check('every kind of fish, game and plant from the drop sites', se.pools.fish.length >= 15 && se.pools.hunt.length >= 15 && se.pools.forage.length >= 10, [se.pools.fish.length, se.pools.hunt.length, se.pools.forage.length]);
  check('sea, lake, snow and ice', se.climate.coast && se.climate.water === 'lake' && se.climate.snow < 15 && se.climate.freeze < 20, se.climate);
  E.act(s, 'fish'); check('jobs are remembered for the lessons', s.everDone && s.everDone.fish === 1, s.everDone);
  const t = E.newGame(E.PRACTICE_KEY, KIT, { seed: 4, weight: 200 }); E.beginDay(t); t.event = null; t.campChosen = true;
  for (let d = 0; d < 25 && t.status === 'playing'; d++) { E.endDay(t); if (t.event) try { E.choose(t, 0); } catch (e) {} E.beginDay(t); if (t.event) try { E.choose(t, 0); } catch (e) {} }
  check('nothing ends a practice run but the button', t.status === 'playing' && t.health >= 30 && t.morale >= 35, [t.status, t.health, t.morale]);
  const u = E.newGame(E.PRACTICE_KEY, KIT, { seed: 5, weight: 200 }); E.beginDay(u); u.event = null; u.campChosen = true; u.health = -5; u.hours = 1; E.act(u, 'rest');
  check('even a collapse does not end a practice run', u.status === 'playing' && u.health >= 30, [u.status, u.health]);
  const v = E.newGame('US-S6', KIT, { seed: 5, weight: 200 }); E.beginDay(v); v.event = null; v.health = -5; v.hours = 1; E.act(v, 'rest'); check('it still does in a real drop', v.status === 'medical', v.status);
}
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + TMP); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(700);
  check('the start screen offers Camping', await p.evaluate(() => [...document.querySelectorAll('button')].some(e => /Camping/.test(e.textContent))));
  await p.evaluate(() => [...document.querySelectorAll('button')].find(e => /Camping/.test(e.textContent)).click()); await p.waitForTimeout(1800);
  const w = await p.evaluate(() => { const W = window.__t.W(); return { map: window.__t.MAP().w, river: !!W.river, pond: !!W.pond, bog: !!W.bog, cliff: !!W.cliff, ufo: !!W.ufo, bushes: W.bushes.length, kinds: [...new Set(W.bushes.map(b => b.kind))].length }; });
  check('a small valley with river, pond, bog, rock and the wreck', w.map <= 3200 && w.river && w.pond && w.bog && w.cliff && w.ufo, w);
  check('plants of every kind, and plenty of them', w.bushes >= 60 && w.kinds >= 6, w);
  check('the chip shows the next lesson', /Lesson: Make camp/.test(await p.evaluate(() => document.querySelector('#h-goal').textContent)));
  const miss = await p.evaluate(() => window.__t.L().filter(l => l[5] && !window.__t.tgt(l[5])).map(l => l[1])); check('every lesson can show you where', !miss.length, miss);
  await p.click('#h-goal'); await p.waitForTimeout(400); const rows = await p.evaluate(() => document.querySelectorAll('.scrim .row').length); check('the chip opens the lessons', rows >= 40, rows);
  const p0 = await p.evaluate(() => ({ x: window.__t.W().player.x, y: window.__t.W().player.y }));
  await p.evaluate(() => [...document.querySelectorAll('.scrim button')].find(b => /Show me/.test(b.textContent)).click()); await p.waitForTimeout(1500);
  const p1 = await p.evaluate(() => ({ x: window.__t.W().player.x, y: window.__t.W().player.y })); check('Show me walks you there', Math.hypot(p1.x - p0.x, p1.y - p0.y) > 20, [p0, p1]);
  await p.evaluate(() => { const S = window.__t.S(); S.campChosen = true; }); await p.waitForTimeout(800);
  check('a lesson done is announced', await p.evaluate(() => (window.__t.S().lessonsDone || []).includes('camp')));
  await p.evaluate(() => { const S = window.__t.S(); S.status = 'tapped'; S.endReason = 'test'; }); await p.evaluate(() => { try { renderEnd(); } catch (e) { window.__e = e.message; } }).catch(() => {});
  await p.waitForTimeout(300); check('practice runs are not recorded', await p.evaluate(() => !Object.keys(window.__t.rec().seasons || {}).length));
  { const p2 = await b.newPage({ viewport: { width: 390, height: 844 } }); await p2.goto('file://' + TMP); await p2.evaluate(() => localStorage.clear()); await p2.reload(); await p2.waitForTimeout(600);
    await p2.evaluate(() => [...document.querySelectorAll('button')].find(e => /Camping/.test(e.textContent)).click()); await p2.waitForTimeout(1500); await p2.reload(); await p2.waitForTimeout(1500);
    check('a practice run survives a reload', await p2.evaluate(() => !!(window.__t.S() && window.__t.S().practice && window.__t.W())), await p2.evaluate(() => [!!window.__t.S(), localStorage.getItem('last-one-out-v1-unreadable') ? 'marked unreadable' : ''])); await p2.close(); }
  check('no page errors', !errs.length, errs.slice(0, 3));
  await b.close(); console.log(fails ? `${fails} camping check(s) failed, ${passes} passed.` : `All ${passes} camping checks passed.`); process.exitCode = fails ? 1 : 0; })();
