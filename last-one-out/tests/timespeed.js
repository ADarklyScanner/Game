// Does the speed of the world change the game?  node timespeed.js
// The game clock moves only with jobs and with distance walked, so the engine (and every bot simulation) has no speed at all.
// What runs on real seconds is the map: animals grow wary for every second you are near, wander and flee at real-time speeds,
// and extra ones drift in every couple of minutes. This walks a hunter over the map at several walking speeds (SCALE.timeX)
// and counts, per game hour walked: animals seen, shots (got within bow range before it bolted), animals spooked, and
// animals that drifted in; then stands still for ten real minutes to see what waiting is worth.
const fs = require('fs'); const path = require('path'); const { chromium } = require('playwright');
const { loadGame } = require('./load-game'); const E = loadGame(process.env.GAME_FILE || undefined);
const SRC = process.env.GAME_FILE || path.join(__dirname, '..', 'index.html'); const TMP = '/tmp/last-one-out-timespeed.html';
const html = fs.readFileSync(SRC, 'utf8'); const hook = 'window.claude?.hot?.snapshot?.(() => ({ game: S }));';
if (!html.includes(hook)) throw new Error('hook point not found');
fs.writeFileSync(TMP, html.replace(hook, 'window.__x = { update, W: () => W, S: () => S, input, SCALE, dist };\n' + hook));
const SPEEDS = (process.env.SPEEDS || '3,6,11,22,44').split(',').map(Number); const PLACES = (process.env.PLACES || 'US-S6,US-S8,AU-S1').split(','); const SEEDS = [5, 17, 29];
const HOURS = Number(process.env.HOURS || 8);
const KIT = ['Knife', 'Ferro rod', 'Axe', 'Bow and arrows', 'Pot', 'Fishing gear', 'Sleeping bag', 'Tarp', 'Paracord', 'Saw'];
(async () => {
  const b = await chromium.launch(); const rows = [];
  for (const key of PLACES) for (const seed of SEEDS) {
    const s = E.newGame(key, KIT, { seed, weight: 200 }); s.campChosen = true; E.beginDay(s); s.event = null; s.storm = s.rain = s.fog = s.snowfall = false; s.hours = 1; s.phase = 0;
    for (const k of SPEEDS) {
      const p = await b.newPage({ viewport: { width: 390, height: 844 } });
      await p.goto('file://' + TMP); await p.evaluate(v => localStorage.setItem('last-one-out-v1', v), JSON.stringify(s, (kk, v) => v === Infinity ? 1e9 : v)); await p.reload(); await p.waitForTimeout(900);
      const r = await p.evaluate(([k, HOURS, seed]) => {
        window.requestAnimationFrame = () => 0; /* stop the real loop: this drives the world with a fixed step */
        const X = window.__x, W = X.W(), S = X.S(); X.SCALE.timeX = k; X.SCALE.walkPxS = X.SCALE.walkMS * X.SCALE.pxPerM * k; W.player.speed = X.SCALE.walkPxS;
        let rs = seed * 9301 + k * 49297; const R = () => { rs = (rs * 233280 + 49297) % 2147483647; return rs / 2147483647; };
        const dt = 1 / 20; let hrs = 0, real = 0, seen = new Set(), shots = 0, spooked = 0, drift = 0, stuck = 0; const known = new Set(W.animals); let chase = null, wp = null, last = { x: W.player.x, y: W.player.y };
        const keepDay = () => { S.event = null; W.night = false; if (S.hours > 9) { S.hours = 1; W.dusked = false; } };
        while (hrs < HOURS && real < 20000) {
          keepDay(); const h0 = S.hours; const P = W.player;
          for (const a of W.animals) if (!known.has(a)) { known.add(a); if (!a.id) drift++; }
          const live = W.animals.filter(a => !a.dead && !a.fled);
          for (const a of live) if (X.dist(a, P) < 170) seen.add(a);
          if (chase && (chase.fled || chase.gone)) { spooked++; chase = null; }
          if (chase && X.dist(chase, P) < 110) { seen.add(chase); shots++; chase.dead = true; chase = null; }
          if (!chase) { const near = live.filter(a => X.dist(a, P) < 400).sort((a, c) => X.dist(a, P) - X.dist(c, P))[0]; if (near) chase = near; }
          if (chase) X.input.target = { x: chase.x, y: chase.y };
          else { if (!wp || X.dist(wp, P) < 20 || stuck > 40) { wp = { x: P.x + (R() - 0.5) * 1800, y: P.y + (R() - 0.5) * 1800 }; stuck = 0; } X.input.target = wp; }
          X.update(dt); real += dt; if (Math.hypot(P.x - last.x, P.y - last.y) < 0.5) stuck++; else stuck = 0; last = { x: P.x, y: P.y };
          if (S.hours > h0) hrs += S.hours - h0;
        }
        /* then stand still for ten real minutes, out in the open, and count what comes */
        let idleDrift = 0, idleShots = 0; X.input.target = null; const P = W.player; const seenIdle = new Set(W.animals);
        for (let t = 0; t < 600; t += dt) { keepDay(); X.update(dt); for (const a of W.animals) if (!seenIdle.has(a)) { seenIdle.add(a); if (!a.id) idleDrift++; } for (const a of W.animals) if (!a.dead && !a.fled && X.dist(a, P) < 110) { idleShots++; a.dead = true; } }
        return { hrs: Math.round(hrs * 10) / 10, real: Math.round(real), seen: seen.size, shots, spooked, drift, idleDrift, idleShots };
      }, [k, HOURS, seed]);
      rows.push(Object.assign({ key, seed, k }, r)); await p.close();
      process.stderr.write(`${key} seed ${seed} x${k}: ${JSON.stringify(r)}\n`);
    }
  }
  await b.close();
  console.log('speed  real s per game h  seen/h  shots/h  spooked/h  drifted in/h   10 idle minutes: drifted in, free shots');
  for (const k of SPEEDS) { const R = rows.filter(r => r.k === k); const sum = f => R.reduce((a, r) => a + r[f], 0); const h = sum('hrs');
    console.log(`${String(k).padStart(4)}x  ${String(Math.round(sum('real') / h)).padStart(10)}       ${(sum('seen') / h).toFixed(2).padStart(6)}  ${(sum('shots') / h).toFixed(2).padStart(6)}   ${(sum('spooked') / h).toFixed(2).padStart(6)}      ${(sum('drift') / h).toFixed(2).padStart(6)}        ${(sum('idleDrift') / R.length).toFixed(1).padStart(4)}, ${(sum('idleShots') / R.length).toFixed(1)}`); }
  fs.writeFileSync(process.env.OUT || '/tmp/last-one-out-timespeed.json', JSON.stringify(rows, null, 1));
})();
