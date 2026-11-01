// Compares what the tests touched (.coverage.json) with everything in the game (inventory.json), and lists the gaps.
const fs = require('fs'); const path = require('path'); const inv = require('./inventory.json');
let cov = {}; try { cov = JSON.parse(fs.readFileSync(path.join(__dirname, '.coverage.json'), 'utf8')); } catch (e) {}
const has = (k, id) => !!(cov[k] && cov[k][id]);
const gaps = {}; const add = (k, id) => (gaps[k] = gaps[k] || []).push(id); let total = 0, done = 0; const tick = (ok, k, id) => { total++; if (ok) done++; else add(k, id); };
for (const a of inv.actions) { tick(has('ran', a), 'action never ran', a); }
for (const [a, rs] of Object.entries(inv.why)) for (const r of rs) { const re = new RegExp('^' + r.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/…/g, '.*') + '$'); tick(Object.keys(cov.refused || {}).some(k => { const [ka, kr] = k.split(' | '); return ka === a && re.test(kr); }), 'refusal never seen', `${a}: ${r}`); }
for (const [ev, opts] of Object.entries(inv.events)) { tick(has('event', ev), 'event never fired', ev); opts.forEach((o, i) => tick(has('choice', `${ev} #${i}`), 'choice never taken', `${ev} #${i} (${o})`)); }
for (const p of inv.places) tick(has('place', p), 'place never played', p);
for (const g of inv.gear) tick(has('gear', g), 'gear never carried', g);
for (const f of inv.foods) tick(has('food', f), 'food never stored', f);
for (const s of inv.shelters) tick(has('shelter', s), 'shelter never built', s);
for (const c of inv.conditions) tick(has('condition', c), 'condition never seen', c);
for (const g of inv.miniGames) tick(has('ui-mini', g), 'mini-game never played', g);
for (const g of inv.panels) tick(has('ui-panel', g), 'panel never opened', g);
for (const g of inv.screens) tick(has('ui-screen', g), 'screen never shown', g);
console.log(`Coverage: ${done} of ${total} inventory items touched (${(100 * done / total).toFixed(1)}%).`);
for (const [k, list] of Object.entries(gaps)) console.log(`  ${k} (${list.length}): ${list.slice(0, 40).join('; ')}${list.length > 40 ? ' …' : ''}`);
if (process.argv.includes('--strict') && done < total) process.exit(1);
