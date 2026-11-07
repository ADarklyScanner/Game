// Every picture the game draws, on one numbered sheet, like an emoji keyboard.  node picture-sheet.js [out.png]
// Writes the image and design/sheet-index.json (number -> what it is), so "change #26" always means the same thing.
const fs = require('fs'); const path = require('path'); const { chromium } = require('playwright');
const SRC = process.env.GAME_FILE || path.join(__dirname, '..', 'index.html'); const TMP = '/tmp/last-one-out-sheet.html';
const html = fs.readFileSync(SRC, 'utf8'); const hook = 'window.claude?.hot?.snapshot?.(() => ({ game: S }));';
if (!html.includes(hook)) throw new Error('hook point not found');
const FNS = ['AI', 'ICON', 'TOOL_ICON', 'HI', 'PAINT', 'SPECIES', 'BADGES', 'MUSH_LOOKS', 'itemArt', 'animalArt', 'bearArt', 'playerArt', 'carcassArt', 'treeArt', 'bushArt', 'plantArt', 'mossArt', 'fernArt', 'matArt', 'landmarkArt', 'debrisArt', 'mushArt', 'badgeArt', 'tarpArt', 'leantoArt', 'hutArt', 'rockArt', 'cabinArt', 'snowcaveArt', 'bedArt', 'ringArt', 'ringBigArt', 'flameArt', 'potArt', 'woodArt', 'shedArt', 'smokerArt', 'rackArt', 'cacheArt', 'rawArt', 'quarterArt', 'kitchenArt', 'latrineArt', 'clothesArt', 'cairnArt', 'boulderArt', 'trackArt', 'hungArt', 'sitArt', 'raidArt'];
fs.writeFileSync(TMP, html.replace(hook, `window.__a = { W: () => W, S: () => S, ${FNS.map(f => `${f}: typeof ${f} !== 'undefined' ? ${f} : null`).join(', ')} };\n` + hook));
const OUT = process.argv[2] || path.join(__dirname, '..', 'design', 'sheet.png');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 430, height: 900 }, deviceScaleFactor: 2 });
  await p.goto('file://' + TMP); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(700);
  await p.evaluate(() => [...document.querySelectorAll('button')].find(e => /Camping/.test(e.textContent)).click()); await p.waitForTimeout(2000);
  const index = await p.evaluate(() => {
    const A = window.__a, W = A.W(); const items = []; const defs = (A.PAINT && A.PAINT.defs) || '';
    const add = (group, name, make) => { try { const v = make(); if (!v) return; let svg;
      if (typeof v === 'string') svg = /^\s*<svg/.test(v) ? v : `<svg viewBox="-20 -20 40 40">${v}</svg>`;
      else if (v.svg != null) svg = `<svg viewBox="0 0 ${v.w} ${v.h}"><defs>${defs}</defs>${v.svg}</svg>`;
      if (svg && !items.some(x => x.svg === svg)) items.push({ group, name, svg }); } catch (e) { /* a picture that needs more of the world than the sheet has */ } };
    for (const [k, d] of Object.entries(A.AI || {})) add('Job icons', k, () => `<svg viewBox="0 0 24 24" class="line"><path d="${d}"/></svg>`);
    for (const [k, v] of Object.entries(A.ICON || {})) add('Top buttons', k, () => v);
    for (const [k, v] of Object.entries(A.TOOL_ICON || {})) add('Tool belt', k, () => v);
    for (const [k, v] of Object.entries(A.HI || {})) add('Top bar', k, () => /<svg/.test(v) ? v : null);
    for (const k of ['bark', 'berry', 'bough', 'grub', 'leaf', 'moss', 'root', 'shell', 'stone', 'tinder', 'weed', 'worm']) add('Things you pick up', k, () => A.itemArt(k));
    for (const k of ['poles', 'logs', 'boughs', 'moss', 'bark', 'cord']) add('Materials at camp', k, () => A.matArt(k, 3));
    for (const k of Object.keys(A.SPECIES || {})) add('Animals', k, () => A.animalArt(k, 0, false));
    add('Animals', 'bear', () => A.bearArt(0));
    add('Animals', 'carcass (small)', () => A.carcassArt('hare', false, false)); add('Animals', 'carcass (big)', () => A.carcassArt('moose', false, true)); add('Animals', 'carcass, dressed', () => A.carcassArt('moose', true, true));
    add('People', 'you', () => A.playerArt(false)); add('People', 'you, wet', () => A.playerArt(true)); add('People', 'sitting', () => A.sitArt(false));
    const looks = new Set((W.trees || []).map(t => t.look).filter(Boolean)); for (const l of ['alder', 'aspen', 'beech', 'birch', 'dwarfbirch', 'lenga', 'mtnbirch', 'myrtle', 'willow']) looks.add(l);
    for (const l of looks) add('Trees', l, () => A.treeArt(l, false, 'summer', 1)); for (const l of [...looks].slice(0, 4)) { add('Trees', l + ', young', () => A.treeArt(l, true, 'summer', 2)); add('Trees', l + ', autumn', () => A.treeArt(l, false, 'fall', 3)); add('Trees', l + ', snow', () => A.treeArt(l, false, 'snow', 4)); }
    for (const st of ['green', 'ripe', 'over', 'used', 'snow']) add('Bushes', 'berries, ' + st, () => A.bushArt('berries', st, '#7a2e3a')); add('Bushes', 'rosehips', () => A.bushArt('rosehips', 'ripe'));
    for (const k of ['greens', 'nettle', 'roots', 'cattail', 'seeds', 'mushrooms']) add('Plants', k, () => A.plantArt(k, false, false, 0)); add('Plants', 'moss', () => A.mossArt(false, false)); add('Plants', 'fern', () => A.fernArt(false));
    (A.MUSH_LOOKS || []).forEach(([desc], i) => add('Mushrooms', desc, () => A.plantArt('mushrooms', false, false, i)));
    add('Shelters', 'tarp', () => A.tarpArt(0, false, 1)); add('Shelters', 'lean-to', () => A.leantoArt(0, false, 1)); add('Shelters', 'debris hut', () => A.hutArt(0, false)); add('Shelters', 'rock shelter', () => A.rockArt(0, false)); add('Shelters', 'cabin', () => A.cabinArt(0, false, true)); add('Shelters', 'snow cave', () => A.snowcaveArt(0)); add('Shelters', 'bough bed', () => A.bedArt(1, false));
    add('Camp', 'fire ring', () => A.ringArt(true, false)); add('Camp', 'fire ring, big', () => A.ringBigArt()); add('Camp', 'flame', () => A.flameArt(0)); add('Camp', 'pot', () => A.potArt()); add('Camp', 'woodpile', () => A.woodArt(4)); add('Camp', 'woodshed', () => A.shedArt(false));
    add('Camp', 'smoker', () => A.smokerArt(true, false)); add('Camp', 'drying rack', () => A.rackArt(true, 3, 0)); add('Camp', 'food cache', () => A.cacheArt(false)); add('Camp', 'raw catch', () => A.rawArt('f')); add('Camp', 'quarter of meat', () => A.quarterArt()); add('Camp', 'hung meat', () => A.hungArt(3));
    add('Camp', 'kitchen', () => A.kitchenArt(false)); add('Camp', 'latrine', () => A.latrineArt(false)); add('Camp', 'clothes drying', () => A.clothesArt()); add('Camp', 'raided camp', () => A.raidArt()); add('Camp', 'cairn', () => A.cairnArt(0, false));
    for (const k of ['pine', 'boulder', 'knoll', 'stone', 'blaze']) add('Landmarks', k, () => A.landmarkArt(k, false)); add('Landmarks', 'boulder (small)', () => A.boulderArt(false, 0));
    for (let v = 0; v < 4; v++) add('Beach debris', 'debris ' + (v + 1), () => A.debrisArt(v));
    for (const [id, name] of A.BADGES || []) add('Badges', name, () => A.badgeArt(id, true));
    window.__items = items;
    // the sheet: dark like a keyboard tray, square keys, a number on each
    document.body.innerHTML = ''; document.body.style.cssText = 'margin:0;background:#1d1f1c;font-family:system-ui,sans-serif;color:#e8e4d8';
    const st = document.createElement('style'); st.textContent = `.sh{padding:10px 8px 24px}.gt{font:600 12px system-ui;letter-spacing:.08em;text-transform:uppercase;color:#a9b39a;margin:14px 4px 6px}.gr{display:grid;grid-template-columns:repeat(6,1fr);gap:6px}.k{position:relative;color:#ece6d2;background:#2c2f2a;border-radius:10px;aspect-ratio:1;display:flex;align-items:center;justify-content:center;overflow:hidden}.k{align-items:flex-start;padding-top:14%}.k svg{width:70%;height:62%}.k svg.line,.k svg.hi{fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}.n{position:absolute;top:3px;left:5px;font:700 11px ui-monospace,monospace;color:#f2d58a}.t{position:absolute;bottom:2px;left:3px;right:3px;font:9px system-ui;color:#c9c4b4;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}h1{font:600 18px system-ui;margin:6px 4px 2px}.sub{font:12px system-ui;color:#a8a596;margin:0 4px}`; document.head.append(st);
    window.__page = (from, to, page, pages) => { document.querySelectorAll('.sh').forEach(x => x.remove());
    const sh = document.createElement('div'); sh.className = 'sh'; sh.innerHTML = `<h1>Last One Out · every picture <span style="font-size:13px;color:#a8a596">page ${page} of ${pages}</span></h1><div class="sub">${items.length} pictures, ${from + 1}–${to} here. Say the number to change one.</div>`; document.body.append(sh);
    let g = null, grid = null; items.slice(from, to).forEach((it, j) => { const i = from + j; if (it.group !== g) { g = it.group; const t = document.createElement('div'); t.className = 'gt'; t.textContent = g; grid = document.createElement('div'); grid.className = 'gr'; sh.append(t, grid); }
      const k = document.createElement('div'); k.className = 'k'; k.innerHTML = `${it.svg}<span class="n">${i + 1}</span><span class="t">${it.name.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span>`; grid.append(k); });
    for (const svg of document.querySelectorAll('.k > svg')) { try { const bb = svg.getBBox(); if (bb.width > 0 && bb.height > 0) { const pad = Math.max(bb.width, bb.height) * 0.06; svg.setAttribute('viewBox', `${bb.x - pad} ${bb.y - pad} ${bb.width + pad * 2} ${bb.height + pad * 2}`); } } catch (e) {} } /* each picture fills its key */ };
    return items.map((it, i) => ({ n: i + 1, group: it.group, name: it.name }));
  });
  /* pages a phone screen tall: whole groups where they fit, about seven rows of six */
  const per = 42, pages = Math.ceil(index.length / per); const dir = path.dirname(OUT); fs.mkdirSync(dir, { recursive: true });
  for (const f of fs.readdirSync(dir)) if (/^sheet(-\d+)?\.png$/.test(f)) fs.unlinkSync(path.join(dir, f));
  for (let i = 0; i < pages; i++) { await p.evaluate(([a, b, n, N]) => window.__page(a, b, n, N), [i * per, Math.min(index.length, (i + 1) * per), i + 1, pages]); await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(dir, `sheet-${i + 1}.png`), fullPage: true }); }
  fs.writeFileSync(path.join(__dirname, '..', 'design', 'sheet-index.json'), JSON.stringify(index, null, 1));
  console.log(`${index.length} pictures on ${pages} pages in ${dir}`); await b.close();
})();
