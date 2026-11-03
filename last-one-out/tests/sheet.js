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
// the camp as it grows: every shelter, half built and finished, sound, worn and broken, with the works around the fire
const G = 'The camp, built up';
const kit = (s, o = {}) => { Object.assign(s.mats, { poles: 5, logs: 9, boughs: 12, moss: 10, bark: 2, cordage: 8 }); s.firewood = 18; s.fire = true; Object.assign(s, o); };
const works = s => { s.crafts = Object.assign(s.crafts || {}, { woodshed: 1, smoker: 2, rack: 1, cache: 2 }); s.sys.rackRoof = true; s.stores.push({ id: 'hare', por: 6, left: 9, smoked: false, where: 'rack', moist: 0.4 }, { id: 'hare', por: 2, left: 9, smoked: true, where: 'smoker' }); s.firewood = 27; };
const shel = (s, type, cond = 1) => { s.shelterType = type; s.shelterLvl = E.SHELTERS[type].lvl; s.shelterCond = cond; };
const site = (s, goal, work) => { s.shelterGoal = goal; s.shelterWork = work; s.shelterPaid = true; };
const toCliff = () => { const W = window.__t.W(); W.player.x = W.cliff.x - 10; W.player.y = W.cliff.y + 110; };
const toPile = () => { const S = window.__t.S(), W = window.__t.W(); const x = W.player.x + 40, y = W.player.y + 24; S.piles = [{ x, y, m: { logs: 3, poles: 2 } }, { x: x - 80, y: y + 6, m: { firewood: 3, boughs: 4, stone: 3 } }]; S.sys.cairns = [{ x: x + 10, y: y - 52 }, { x: x - 70, y: y - 50 }]; };
const snowDay = s => { const sd = E.DATA.seasons.find(x => x.key === P).climate.snow; s.day = sd + 20; };
add(G, 'camp-open', 'Sleeping out by the fire, materials piled', P, s => kit(s));
add(G, 'camp-tarp', 'Tarp camp', P, s => { kit(s); s.gear.push('Tarp'); shel(s, 'tarp'); });
add(G, 'camp-tarp-torn', 'Tarp camp, torn', P, s => { kit(s); s.gear.push('Tarp'); shel(s, 'tarp', 0.4); });
add(G, 'camp-leanto', 'Lean-to', P, s => { kit(s); shel(s, 'leanto'); s.crafts.woodshed = 1; });
add(G, 'camp-leanto-worn', 'Lean-to, worn, fish on the stone', P, s => { kit(s); shel(s, 'leanto', 0.7); s.raw = [{ id: 'trout' }, { id: 'trout' }, { id: 'hare' }]; });
add(G, 'camp-hut', 'Debris hut', P, s => { kit(s); shel(s, 'hut'); });
add(G, 'camp-hut-broken', 'Debris hut, broken open', P, s => { kit(s); shel(s, 'hut', 0.4); });
add(G, 'build-hut', 'Debris hut, half built', P, s => { kit(s); site(s, 'hut', 1); });
add(G, 'build-cabin-1', 'Cabin, first courses (beside the lean-to)', P, s => { kit(s); shel(s, 'leanto'); site(s, 'cabin', 1); });
add(G, 'build-cabin-2', 'Cabin, walls half up', P, s => { kit(s); site(s, 'cabin', 2); });
add(G, 'build-cabin-3', 'Cabin, rafters on', P, s => { kit(s); site(s, 'cabin', 3); });
add(G, 'camp-cabin', 'Cabin with chimney, rack, smoker, cache, woodshed', P, s => { kit(s); shel(s, 'cabin'); s.crafts.chimney = 2; works(s); });
add(G, 'camp-cabin-worn', 'Cabin, roof going', P, s => { kit(s); shel(s, 'cabin', 0.45); works(s); s.wet = 0.6; });
add(G, 'camp-cabin-snow', 'Cabin in snow, fire inside, dusk', P, s => { kit(s); snowDay(s); shel(s, 'cabin'); s.crafts.chimney = 2; works(s); s.fire = true; s.fireInside = true; s.hours = E.dayHours(s) - 0.6; s.phase = 2; });
add(G, 'camp-night', 'The fire at night, pot on', P, s => { kit(s); shel(s, 'hut'); s.hours = E.dayHours(s); s.phase = 3; s.boiled = 2; });
add(G, 'camp-raid', 'After a raid in the night', P, s => { kit(s); shel(s, 'leanto', 0.7); }, () => { window.__t.W().raided = window.__t.S().day; });
add(G, 'build-rock-1', 'Rock shelter, first course', P, s => { kit(s); site(s, 'rock', 1); }, toCliff);
add(G, 'build-rock-2', 'Rock shelter, two courses and the lintel', P, s => { kit(s); site(s, 'rock', 2); }, toCliff);
add(G, 'camp-rock', 'Rock shelter, fire inside', P, s => { kit(s); shel(s, 'rock'); s.fireInside = true; }, toCliff);
add(G, 'camp-rock-snow', 'Rock shelter in snow, stones down', P, s => { kit(s); snowDay(s); shel(s, 'rock', 0.4); }, toCliff);
add(G, 'piles', 'Piles left on the land, and cairns', P, s => kit(s), toPile);
// animals, people and signs on the land
const A = 'Animals and signs';
const zooIn = (list, mode) => { const W = window.__t.W(); const P = W.player; W.animals = list.map(([sp, dx, dy, mv]) => ({ sp, x: P.x + dx, y: P.y + dy, tx: P.x + dx + (mv ? 40 : 0), ty: P.y + dy, dir: dx < 0 ? 1 : -1, calm: 1, size: 1, dead: mode === 'dead' })); };
const zoo = (list, mode) => `(${zooIn})(${JSON.stringify(list)}, ${JSON.stringify(mode || '')})`; /* a string, so the list goes into the page with it */
add(A, 'animals-north', 'Moose, caribou, hare, grouse, fox', P, null, zoo([['moose', -80, -60], ['caribou', 70, -80, 1], ['hare', -40, 50], ['grouse', 40, 40], ['fox', 90, 20, 1], ['duck', -110, 10]]));
add(A, 'animals-south', 'Wallaby, warthog, springbok, possum, snake', P, null, zoo([['wallaby', -80, -50], ['warthog', 60, -70], ['springbok', 80, 20, 1], ['possum', -40, 50], ['snake', 40, 45], ['guineafowl', -110, 0]]));
add(A, 'animals-dead', 'A kill, before it is dressed', P, null, zoo([['deer', -50, -40], ['hare', 50, 30]], 'dead'));
add(A, 'bear', 'A bear at the edge of camp', P, null, () => { const W = window.__t.W(); W.actor = { kind: 'bear', x: W.player.x - 70, y: W.player.y - 40, vx: 1 }; });
add(A, 'signs', 'Tracks, a snare, a deadfall, a carcass, wreck debris, landmarks', P, s => { s.carcass = { id: 'deer', dressed: true, big: true }; }, () => { const W = window.__t.W(), P = W.player; W.carcassPos = { x: P.x + 60, y: P.y - 60 }; W.tracks = [{ x: P.x - 90, y: P.y + 50 }, { x: P.x - 20, y: P.y + 70, set: true }, { x: P.x + 60, y: P.y + 60, set: true, deadfall: true }]; W.debris = [0, 1, 2].map(v => ({ x: P.x - 100 + v * 40, y: P.y - 50, look: v })); W.landmarks = [{ kind: 'pine', x: P.x + 120, y: P.y - 10 }, { kind: 'stone', x: P.x - 140, y: P.y + 10 }]; });
// inside every shelter, by time of day and weather
const I = 'Inside';
const inside = () => { window.__t.W().inside = true; };
const room = (type, o = {}) => s => { kit(s); shel(s, type, o.cond ?? 1); if (o.fireIn) { s.fireInside = true; s.fire = true; } else s.fire = !!o.fire; if (o.ph === 'night') { s.hours = E.dayHours(s); s.phase = 3; } if (o.ph === 'dusk') { s.hours = E.dayHours(s) - 0.6; s.phase = 2; } if (o.rain) s.rain = true; if (o.snow) snowDay(s); if (o.chim) s.crafts.chimney = 2; if (o.smoked) s.stores.push({ id: 'hare', por: 3, left: 9, smoked: true }, { id: 'hare', por: 3, left: 9, smoked: true }); if (o.nobag) s.gear = s.gear.filter(g => g !== 'Sleeping bag'); if (o.tarp) s.gear.push('Tarp'); };
add(I, 'in-tarp', 'Under the tarp, morning', P, room('tarp', { tarp: 1 }), inside);
add(I, 'in-tarp-rain', 'Under a torn tarp in the rain', P, room('tarp', { tarp: 1, cond: 0.4, rain: 1 }), inside);
add(I, 'in-leanto', 'In the lean-to, fire outside, dusk', P, room('leanto', { fire: 1, ph: 'dusk' }), inside);
add(I, 'in-leanto-worn', 'Lean-to, worn, no sleeping bag', P, room('leanto', { cond: 0.6, nobag: 1 }), inside);
add(I, 'in-hut', 'In the debris hut, night', P, room('hut', { ph: 'night', fire: 1 }), inside);
add(I, 'in-hut-broken', 'Debris hut, broken open, rain', P, room('hut', { cond: 0.4, rain: 1 }), inside);
add(I, 'in-rock', 'Rock shelter, fire inside, night', P, room('rock', { fireIn: 1, ph: 'night', smoked: 1 }), inside);
add(I, 'in-rock-snow', 'Rock shelter, snow outside', P, room('rock', { snow: 1 }), inside);
add(I, 'in-cabin', 'Cabin, fire inside, chimney, smoked meat', P, room('cabin', { fireIn: 1, chim: 1, smoked: 1 }), inside);
add(I, 'in-cabin-snow', 'Cabin at dusk in snow', P, room('cabin', { snow: 1, ph: 'dusk', fireIn: 1, chim: 1 }), inside);
add(I, 'in-cabin-worn', 'Cabin, roof going, rain', P, room('cabin', { cond: 0.4, rain: 1 }), inside);
add('Choices and mini-games', 'event', 'A choice to make', P, s => { s.event = { id: 'wolves', title: 'Wolves', text: 'Wolves howling close, after dark.', options: [{ label: 'Build the fire up and keep to camp', sub: 'Two hours, two days of wood. Nerves settle.' }, { label: 'Carry on', sub: '' }], optIds: [0, 1], phase: 0 }; });
add('Choices and mini-games', 'mini-fish', 'Fishing: the cast', P, null, () => { window.__t.call('startFish', false); });
add('Choices and mini-games', 'mini-fire', 'Lighting the fire', P, s => { s.fire = false; }, () => { window.__t.call('startFire'); });
add('Choices and mini-games', 'mini-clean', 'Cleaning the catch', P, null, () => { window.__t.call('startClean'); });
// every hands-on close-up
const H = 'Hands-on close-ups';
const craft = id => `window.__t.call('startCraft', '${id}')`;
add(H, 'mini-clean-bird', 'Plucking and opening a grouse', P, null, () => { window.__t.S().raw = [{ id: 'grouse', por: 1 }]; window.__t.call('startClean'); });
add(H, 'mini-dress', 'Opening a deer', P, null, () => { window.__t.call('startDress'); });
add(H, 'mini-cordage', 'Twisting cordage', P, null, () => { window.__t.call('startCordage'); });
add(H, 'mini-build', 'Lashing the hut frame', P, s => { kit(s); site(s, 'hut', 0); }, () => { window.__t.call('startBuild'); });
add(H, 'mini-sharpen', 'Sharpening the knife', P, null, () => { window.__t.call('startSharpen'); });
add(H, 'mini-rack', 'Lashing the drying rack', P, null, craft('craft_rack'));
add(H, 'mini-lure', 'Tying a lure', P, null, craft('craft_lure'));
add(H, 'mini-fishtrap', 'Building a fish trap', P, null, craft('craft_fishtrap'));
add(H, 'mini-blade', 'Knapping a stone blade', P, null, craft('craft_stoneblade'));
add(H, 'mini-hide', 'Scraping a hide', P, null, craft('work_hide'));
add(H, 'mini-pot', 'Coiling a clay pot', P, null, craft('shape_pot'));
add(H, 'mini-firing', 'Firing the pots', P, null, craft('fire_pots'));
add(H, 'mini-lamp', 'Pouring a lamp', P, null, craft('craft_lamp'));
add(H, 'mini-tiller', 'Tillering the bow', P, null, craft('tiller_bow'));
add(H, 'mini-cairn', 'Stacking a cairn', P, null, craft('cairn'));
add(H, 'mini-hearth', 'Laying a hearth', P, null, craft('craft_hearth'));
add(H, 'mini-mend', 'Mending clothes', P, null, craft('mend'));
add(H, 'mini-mat', 'Weaving a mat', P, null, craft('craft_mat'));
add(H, 'mini-splint', 'Splinting', P, null, craft('splint'));
add(H, 'mini-drill', 'Carving a bow-drill set', P, null, craft('craft_bowdrill'));
add('Panels', 'map', 'The map', P, null, () => { window.__t.call('openMap'); });
add('Panels', 'pack', 'The pack', P, null, () => { window.__t.call('openPack'); });
add('Panels', 'body', 'The body', P, null, () => { window.__t.call('openBody'); });
add('Panels', 'journal', 'The journal', P, s => { s.day = 6; }, () => { window.__t.call('openJournal'); });
add('Panels', 'notes', 'Notes', P, null, () => { window.__t.call('openNotes'); });
add('Panels', 'camp-panel', 'The camp panel', P, s => { kit(s); shel(s, 'leanto'); }, () => { window.__t.call('openCamp'); });
add('Panels', 'build', 'What you can build', P, s => kit(s), () => { window.__t.call('openBuild'); });
add('Panels', 'menu', 'The menu', P, null, () => { window.__t.call('openMenu'); });
add('Panels', 'how', 'How to play', P, null, () => { window.__t.call('openHow'); });
add('Panels', 'records', 'Records', P, null, () => { window.__t.call('openRecords'); });
add('Panels', 'setup', 'Choosing where to go and what to take', P, null, () => { window.__t.call('renderSetup'); });
add('Panels', 'end', 'The end of a run', P, s => { s.day = 41; s.status = 'tapped'; s.endReason = 'You tapped out on day 41.'; }, () => { window.__t.call('renderEnd'); });

add('Other sizes', 'small', 'Small phone, 320 wide', P, null, null, [320, 640]);
add('Other sizes', 'desktop', 'Desktop, 1280 wide', P, null, null, [1280, 800]);
(async () => {
  const b = await chromium.launch(); const errs = [];
  const only = process.env.ONLY ? new RegExp(process.env.ONLY) : null; /* ONLY=camp- node sheet.js /tmp/x : just those pictures */
  for (const sh of shots.filter(x => !only || only.test(x.name))) {
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
