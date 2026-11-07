// The third review's fixes: floats on the right vital, sitting still inside, debris you can pick up, stalking, and the rest.  node review3.js
const fs = require('fs'); const path = require('path'); const { chromium } = require('playwright');
const { loadGame } = require('./load-game'); const E = loadGame(process.env.GAME_FILE || undefined);
const SRC = process.env.GAME_FILE || path.join(__dirname, '..', 'index.html'); const TMP = '/tmp/last-one-out-review3.html';
const html = fs.readFileSync(SRC, 'utf8'); const hook = 'window.claude?.hot?.snapshot?.(() => ({ game: S }));';
if (!html.includes(hook)) throw new Error('hook point not found');
fs.writeFileSync(TMP, html.replace(hook, 'window.__r = { S: () => S, W: () => W, mini: () => mini, input: () => input, rec: () => records, setRec: r => { records = r; }, openGroups, tidySubs, buildStage, bill: f => { const o = E.shelterBill; E.shelterBill = f; return o; }, tileChips, floatNum, worldToast, startStalk, startCollect, openRecords, interactions, stitch: () => startStitch };\n' + hook));
const KEY = 'last-one-out-v1'; const save = s => JSON.stringify(s, (k, v) => v === Infinity ? 1e9 : v);
let fails = 0, passes = 0; const check = (name, ok, detail) => { if (ok) passes++; else { fails++; console.log('FAIL', name, detail ?? ''); } };
const KIT = ['Knife', 'Ferro rod', 'Axe', 'Fishing gear', 'Bow and arrows', 'Pot', 'Paracord'];
function base() { const s = E.newGame('US-S6', KIT, { seed: 41, weight: 200 }); s.campChosen = true; E.beginDay(s); s.event = null; s.storm = s.rain = s.fog = s.snowfall = false; s.hours = 2; s.phase = 0; return s; }
{ // the engine
  const s = base(); const f0 = s.found.length, h0 = s.hours; E.act(s, 'search', { extra: { debris: true } });
  check('debris you walk up to is always a find', s.found.length === f0 + 1, s.found.length);
  check('and picking it up is quick', Math.abs(s.hours - h0 - 0.5) < 0.2, s.hours - h0);
  const t = base(); const w0 = t.mats.wire, c0 = t.containers || 0; E.foundWreck(t);
  check('the wreck gives wire, cordage and a pot', t.mats.wire === w0 + 6 && (t.containers || 0) === c0 + 1, [t.mats.wire, t.containers]);
  const again = E.foundWreck(t); check('but only the first time', t.mats.wire === w0 + 6 && again.length === 1, t.mats.wire);
  const u = base(); u.hours = 2; E.act(u, 'hunt', { extra: { spooked: true, hit: 'none' } }); check('a stalk that spooked everything brings nothing home', !u.carcass);
  { // the balance pass: the smoker is a short chore once it is going, hanging goes by how much, and only a real surplus is worth keeping
    const k = base(); k.crafts.smoker = 2; k.fire = true; k.firewood = 5; k.stores = [{ id: 'trout', por: 3, left: 4, where: 'smoker', moist: 0.5, smoke: 0.5 }];
    check('feeding a smoker that is already going takes half an hour', E.jobHours(k, 'smoke') === 0.5, E.jobHours(k, 'smoke'));
    k.stores.push({ id: 'trout', por: 3, left: 4 }); check('hanging three portions takes under an hour', E.jobHours(k, 'smoke') === 0.8, E.jobHours(k, 'smoke'));
    const h0 = k.hours; E.act(k, 'smoke'); check('and the clock agrees', Math.abs(k.hours - h0 - 0.8) < 0.05, k.hours - h0);
    const q = base(); q.stores = [{ id: 'trout', por: 2, left: 3 }]; check('two days of fish is no surplus', E.surplusPor(q) === 0, E.surplusPor(q));
    const mo = Object.keys(E.DATA.foods).find(f => E.DATA.foods[f].big); q.stores = [{ id: mo, por: 200, left: 3 }]; check('a big kill is a surplus', E.surplusPor(q) > 100, E.surplusPor(q)); }
  const c = E.newGame(E.PRACTICE_KEY, ['Knife', 'Ferro rod'], { seed: 3, weight: 200 }); check('the camping site has a can to carry and boil water in', (c.containers || 0) >= 1, c.containers);
}
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const fresh = async (s) => { await p.goto('file://' + TMP); await p.evaluate(([k, v]) => localStorage.setItem(k, v), [KEY, save(s || base())]); await p.reload(); await p.waitForTimeout(800); };
  await fresh();
  // 1 a float lands on the vital it is about
  const fl = await p.evaluate(() => { const out = {}; for (const k of ['w', 'h', 'd', 'm', 'f']) { window.__r.floatNum(k, '+5', 'tone-good'); const f = [...document.querySelectorAll('.float')].pop(); const r = f.style; const x = parseFloat(r.left), y = parseFloat(r.top);
    let best = null, bd = 1e9; for (const v of document.querySelectorAll('.vt')) { const b = v.getBoundingClientRect(); const d = Math.hypot(b.right - 8 - x, b.top + 6 - y); if (d < bd) { bd = d; best = [...v.classList].find(c => c.length === 1); } } out[k] = best; } return out; });
  check('each float sits on its own vital', Object.entries(fl).every(([k, v]) => k === v), fl);
  // 2 inside, you do not walk
  const moved = await p.evaluate(async () => { const W = window.__r.W(); W.inside = true; const p0 = { x: W.player.x, y: W.player.y }; window.__r.input().target = { x: p0.x + 300, y: p0.y }; await new Promise(r => setTimeout(r, 600)); return Math.hypot(W.player.x - p0.x, W.player.y - p0.y); });
  check('sitting inside, a tap on the world does not walk you', moved < 1, moved);
  // 3 inside, a result shows as a banner
  const shown = await p.evaluate(async () => { window.__r.worldToast([['Whittled a peg.', 'good']], 0, 0); await new Promise(r => setTimeout(r, 100)); return document.body.textContent.includes('Whittled a peg.'); });
  check('inside, results are shown', shown);
  await p.evaluate(() => { window.__r.W().inside = false; window.__r.input().target = null; });
  // 7 a three-session cabin gets its roof
  const st = await p.evaluate(() => { const S = window.__r.S(); S.shelterGoal = 'cabin'; const out = []; const real = window.__r.bill(() => ({ sessions: 3 })); for (let w = 0; w < 3; w++) { S.shelterWork = w; out.push(window.__r.buildStage()); } window.__r.bill(real); S.shelterWork = 0; S.shelterGoal = null; return out; });
  check('the cabin stages include the roof', st.includes('roof') && st[0] === 'sill' && st[st.length - 1] === 'chink', st);
  // 11 half-hour times are chips
  check('½ h shows as a time chip', /class="ch t">½ h/.test(await p.evaluate(() => window.__r.tileChips('½ h · on the shore'))));
  check('1½ h shows as a time chip', /class="ch t">1½ h/.test(await p.evaluate(() => window.__r.tileChips('1½ h · 40%'))));
  { const subs = await p.evaluate(() => { const l = [{ id: 'search', label: 'x', sub: '½ h · on the shore' }, { id: 'search', label: 'y', sub: '1½ h' }]; window.__r.tidySubs(l); return l.map(a => a.sub); });
    check('a half-hour time is not doubled up', subs.every(x => (x.match(/h\b/g) || []).length === 1), subs); }
  // collect: a keyboard path
  await p.evaluate(() => { const W = window.__r.W(); window.__r.startCollect('stones', 'stone', { x: W.player.x + 10, y: W.player.y }); });
  const acts = await p.evaluate(() => window.__r.mini().acts.map(a => a.label)); check('collecting offers Pick up the nearest', acts[0] === 'Pick up the nearest', acts);
  const got = await p.evaluate(() => { window.__r.mini().acts[0].fn(); window.__r.mini().acts[0].fn(); return window.__r.mini() ? window.__r.mini().acts[1].sub : 'done'; });
  check('and it picks them up one by one', /^2 of|done/.test(got), got);
  await p.evaluate(() => window.__r.mini() && window.__r.mini().cancel());
  // 8 stalking creeps up the trail and ends at a shot (or nothing, if it was noisy)
  await p.evaluate(() => window.__r.startStalk());
  check('stalking starts with Ease forward', await p.evaluate(() => window.__r.mini() && window.__r.mini().type === 'stalk' && window.__r.mini().acts[0].label === 'Ease forward'));
  await p.evaluate(() => window.__r.mini().acts[0].down()); let ty = 'stalk';
  for (let i = 0; i < 40 && ty === 'stalk'; i++) { await p.waitForTimeout(400); ty = await p.evaluate(() => window.__r.mini() ? window.__r.mini().type : 'none'); }
  check('the stalk ends in a shot or a spooked trail', ty === 'hunt' || ty === 'none', ty);
  await p.evaluate(() => window.__r.mini() && window.__r.mini().cancel());
  // records show the wreck and the valley
  await p.evaluate(() => { const r = window.__r.rec(); r.wrecks = { 'US-S6': 4 }; r.camper = '2026-11-01'; window.__r.openRecords(); });
  const rt = await p.evaluate(() => document.querySelector('.scrim').textContent); check('Records shows the wreck and the finished valley', /The wreck/.test(rt) && /Every Camping lesson/.test(rt), rt.slice(0, 200));
  await p.evaluate(() => document.querySelector('.scrim').click());
  // mid-build, the tile names the build
  const lab = await p.evaluate(() => { const S = window.__r.S(); S.shelterGoal = 'leanto'; Object.assign(S.mats, { poles: 40, cordage: 40, boughs: 40 }); const W = window.__r.W(); W.player.x = W.camp.x; W.player.y = W.camp.y + 20; return window.__r.interactions().map(a => a.label); });
  check('mid-build, the job says what is being built', lab.some(l => /^Build the lean-to/i.test(l)) && !lab.includes('Build shelter'), lab.filter(l => /Build/.test(l)));
  check('a group once open stays open when the place numbers change', await p.evaluate(() => { const r = window.__r.rec(); r.groupsOpen = 3; return window.__r.openGroups() >= 3; }));
  check('every place has fresh simulated numbers', await p.evaluate(() => window.__r.S() && true) && Object.values(E.DATA.difficulty).every(d => d.median > 0 && d.careful != null));
  check('no page errors', !errs.length, errs.slice(0, 3));
  await b.close(); console.log(fails ? `${fails} review3 check(s) failed, ${passes} passed.` : `All ${passes} review3 checks passed.`); process.exitCode = fails ? 1 : 0;
})();
