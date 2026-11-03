// The picture sheet (design/STYLE.md): forces each state of the game, takes a phone-sized picture of it, and builds one
// scrollable page of all of them, so the look can be checked in minutes instead of hours of play.
//   node sheet.js [outDir]      default: ../design/sheet (not kept in git)
const fs = require('fs'); const path = require('path'); const { chromium } = require('playwright');
const { loadGame } = require('./load-game'); const E = loadGame(process.env.GAME_FILE || undefined); const D = E.DATA;
const SRC = process.env.GAME_FILE || path.join(__dirname, '..', 'index.html'); const TMP = '/tmp/last-one-out-sheet.html'; const html = fs.readFileSync(SRC, 'utf8');
const hook = 'window.claude?.hot?.snapshot?.(() => ({ game: S }));';
const names = [...new Set([...html.matchAll(/function ((?:start|open|render)[A-Z]\w*)\(/g)].map(m => m[1]))];
fs.writeFileSync(TMP, html.replace(hook, `window.__t = { S: () => S, W: () => W, call: (n, ...a) => ({ ${names.join(', ')} })[n](...a) };\n` + hook));
const OUT = path.resolve(process.argv[2] || path.join(__dirname, '..', 'design', 'sheet')); fs.mkdirSync(path.join(OUT, 'img'), { recursive: true });
const KEY = 'last-one-out-v1'; const save = s => JSON.stringify(s, (k, v) => v === Infinity ? 1e9 : v);
const GEAR = ['Pot', 'Knife', 'Ferro rod', 'Axe', 'Fishing gear', 'Sleeping bag', 'Paracord', 'Bow and arrows', 'Trapping wire', 'Gillnet'];
function state(place, f) { const s = E.newGame(place, GEAR, { seed: 42, weight: 200 }); s.campChosen = true; E.beginDay(s); s.event = null; s.storm = s.rain = s.fog = false; s.firewood = 6; s.mats.tinder = 3; Object.assign(s.mats, { poles: 8, cordage: 8, boughs: 8, stone: 6 }); s.raw = [{ id: 'trout', por: 2, left: 2 }]; if (f) f(s); return s; }
const shots = [];
const add = (group, name, caption, place, setup, after, vp) => shots.push({ group, name, caption, place, setup, after, vp: vp || [390, 844] });
// every place, as you arrive
for (const se of D.seasons) add('Every place on day 1', 'place-' + se.key.replace(/\W+/g, '-'), `${se.name} · ${se.location}`, se.key);
// one place through a day and its screens
const P = 'US-S6';
const toTree = () => { const W = window.__t.W(); const t = W.trees.find(x => !x.gone && x.kind === 'conifer' && x.age === 'mature'); W.player.x = t.x + 20; W.player.y = t.y + 10; };
const toShore = () => { const W = window.__t.W(); const y = W.camp.y + 40; W.player.y = y; W.player.x = W.shoreX(y) + 18; };
add('Choosing camp', 'landed', 'Just landed: no camp yet', P, s => { s.campChosen = false; });
add('Choosing camp', 'make-camp', 'Make camp here? The spot report', P, s => { s.campChosen = false; }, () => { const W = window.__t.W(); W.player.x += 300; W.player.y += 200; window.__t.call('openMakeCamp'); });
add('The wreck', 'wreck-day', 'The wreck, by day', P, null, () => { const W = window.__t.W(); W.player.x = W.ufo.x + 30; W.player.y = W.ufo.y + 70; });
add('The wreck', 'wreck-dusk', 'The wreck, at dusk', P, s => { s.hours = E.dayHours(s) - 0.6; s.phase = 2; }, () => { const W = window.__t.W(); W.player.x = W.ufo.x + 30; W.player.y = W.ufo.y + 70; });
add('A day at one camp', 'camp', 'At camp, morning: the most likely job is open', P);
add('A day at one camp', 'camp-knife', 'At camp, Knife picked', P, null, () => document.querySelector('.tool[data-tool=knife]').click());
add('A day at one camp', 'tree', 'At a big spruce', P, null, toTree);
add('A day at one camp', 'shore', 'At the shore', P, null, toShore);
add('A day at one camp', 'dusk', 'Dusk', P, s => { s.hours = E.dayHours(s) - 0.6; s.phase = 2; });
add('A day at one camp', 'night', 'Night by the fire', P, s => { s.hours = E.dayHours(s); s.phase = 3; s.fire = true; });
add('A day at one camp', 'inside', 'Inside the cabin', P, s => { s.shelterType = 'cabin'; s.shelterLvl = 3; s.fire = true; s.fireInside = true; }, () => { window.__t.W().inside = true; });
add('A day at one camp', 'snow', 'Deep winter, snow on the ground', P, s => { const sd = E.DATA.seasons.find(x => x.key === P).climate.snow; s.day = sd + 20; });
add('A day at one camp', 'river', 'At the river and the ford', P, null, () => { const W = window.__t.W(); if (W.river) { W.player.x = W.river.ford; W.player.y = W.river.y1 + 40; } });
add('A day at one camp', 'rain', 'Rain, with a full pack', P, s => { s.rain = true; s.pack = { firewood: 4, poles: 3 }; });
add('Choices and mini-games', 'event', 'A choice to make', P, s => { s.event = { id: 'wolves', title: 'Wolves', text: 'Wolves howling close, after dark.', options: [{ label: 'Build the fire up and keep to camp', sub: 'Two hours, two days of wood. Nerves settle.' }, { label: 'Carry on', sub: '' }], optIds: [0, 1], phase: 0 }; });
add('Choices and mini-games', 'mini-fish', 'Fishing: the cast', P, null, () => { window.__t.call('startFish', false); });
add('Choices and mini-games', 'mini-fire', 'Lighting the fire', P, s => { s.fire = false; }, () => { window.__t.call('startFire'); });
add('Choices and mini-games', 'mini-clean', 'Cleaning the catch', P, null, () => { window.__t.call('startClean'); });
add('Panels', 'map', 'The map', P, null, () => { window.__t.call('openMap'); });
add('Panels', 'pack', 'The pack', P, null, () => { window.__t.call('openPack'); });
add('Panels', 'body', 'The body', P, null, () => { window.__t.call('openBody'); });
add('Other sizes', 'small', 'Small phone, 320 wide', P, null, null, [320, 640]);
add('Other sizes', 'desktop', 'Desktop, 1280 wide', P, null, null, [1280, 800]);
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const sh of shots) {
    const ctx = await b.newContext({ viewport: { width: sh.vp[0], height: sh.vp[1] } }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(sh.name + ': ' + e.message));
    await p.goto('file://' + TMP); await p.evaluate(([k, v]) => localStorage.setItem(k, v), [KEY, save(state(sh.place, sh.setup))]); await p.reload(); await p.waitForTimeout(900);
    if (sh.after) { try { await p.evaluate(sh.after); } catch (e) { errs.push(sh.name + ': ' + e.message); } await p.waitForTimeout(600); }
    await p.screenshot({ path: path.join(OUT, 'img', sh.name + '.jpg'), type: 'jpeg', quality: 72 }); await ctx.close();
  }
  await b.close();
  const groups = [...new Set(shots.map(s => s.group))];
  const when = new Date().toISOString().slice(0, 10);
  const page = `<title>Last One Out Picture Sheet</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
/* a contact sheet: small pictures in a grid on dark canvas, captions in the game's own typefaces */
:root { --bg: #1c1a15; --card: #26231c; --ink: #ece4cf; --soft: #b9ae94; --line: #3b3529; --display: Georgia, 'Times New Roman', serif; --ui: 'Arial Narrow', system-ui, sans-serif; color-scheme: dark; }
body { background: var(--bg); color: var(--ink); font: 15px/1.45 var(--ui); }
.wrap { max-width: 1200px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 20px 48px; display: flex; flex-direction: column; gap: 28px; }
h1 { font: 600 30px/1.1 var(--display); margin: 0; text-wrap: balance; } h2 { font: 600 21px var(--display); margin: 0 0 10px; border-bottom: 1px solid var(--line); padding-bottom: 6px; }
.lede { color: var(--soft); margin: 6px 0 0; max-width: 62ch; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 14px; }
.grid.wide { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
figure { margin: 0; background: var(--card); border-radius: 4px; overflow: hidden; display: flex; flex-direction: column; min-width: 0; }
figure a { display: block; } figure img { display: block; width: 100%; height: auto; }
figcaption { padding: 7px 9px 9px; font-size: 13.5px; color: var(--soft); }
a:focus-visible { outline: 2px solid var(--soft); outline-offset: 2px; }
</style>
<div class="wrap">
  <header><h1>Last One Out picture sheet</h1><p class="lede">Every place on its first morning, one camp through a day, the choices and mini-games, the panels and two other screen sizes. Made ${when} from the current game. Tap a picture to see it full size.</p></header>
  ${groups.map(g => `<section><h2>${g}</h2><div class="grid${g === 'Other sizes' ? ' wide' : ''}">${shots.filter(s => s.group === g).map(s => `<figure><a href="img/${s.name}.jpg" target="_blank" rel="noopener"><img src="img/${s.name}.jpg" alt="${s.caption}" loading="lazy" width="${s.vp[0]}" height="${s.vp[1]}"></a><figcaption>${s.caption}</figcaption></figure>`).join('')}</div></section>`).join('\n  ')}
</div>`;
  fs.writeFileSync(path.join(OUT, 'index.html'), page);
  console.log(`${shots.length} pictures in ${OUT}` + (errs.length ? `\nPage errors:\n  ${errs.join('\n  ')}` : '\nNo page errors.'));
  process.exitCode = errs.length ? 1 : 0;
})();
