// Things checked for that can never be true, or counted and never shown: the Sunglasses pattern.  node deadrefs.js
// Every kit item the code checks for must be one you can bring; every predator an event names must live somewhere;
// every food must come from somewhere; every s.stats / s.sys value the game counts must be read back somewhere.
const fs = require('fs'); const path = require('path'); const { loadGame } = require('./load-game');
const SRC = process.env.GAME_FILE || path.join(__dirname, '..', 'index.html'); const h = fs.readFileSync(SRC, 'utf8'); const E = loadGame(process.env.GAME_FILE || undefined); const D = E.DATA;
let fails = 0, passes = 0; const check = (name, ok, detail) => { if (ok) passes++; else { fails++; console.log('FAIL', name, detail ?? ''); } };
const code = h.replace(/globalThis\.DATA = .*\n/, '');
const gear = new Set(D.gear.map(g => g.id)); const issued = /personal: \[([^\]]*)\]/.exec(h)[1];
const checked = new Set([...code.matchAll(/has\((?:s|S), '([^']+)'\)|gear\.includes\('([^']+)'\)/g)].map(m => m[1] || m[2]));
check('every kit item the game checks for can be brought', [...checked].every(x => gear.has(x)), [...checked].filter(x => !gear.has(x)));
const pools = new Set(); for (const se of D.seasons) { for (const k in se.pools || {}) for (const [id] of se.pools[k]) pools.add(id); for (const id of se.big || []) pools.add(id); }
const orphan = Object.keys(D.foods).filter(id => !pools.has(id) && !new RegExp(`'${id}'`).test(code)); check('every food comes from somewhere', !orphan.length, orphan);
const spLine = h.split('\n').find(l => l.startsWith('const SPECIES = {')); const species = [...spLine.matchAll(/([a-z_]+): \{/g)].map(m => m[1]);
check('every animal drawn lives somewhere', species.every(k => pools.has(k)), species.filter(k => !pools.has(k)));
// counted but never read back
const reads = (name) => (code.match(new RegExp(`\\b${name}\\b(?!\\s*(?:=(?!=)|\\+=|-=|\\+\\+|--))`, 'g')) || []).length;
const statsW = new Set([...code.matchAll(/stats\.([a-zA-Z_]+)\s*(?:=(?!=)|\+=|\+\+)/g)].map(m => m[1]));
const writeOnly = [...statsW].filter(k => { const all = (code.match(new RegExp(`\\.${k}\\b`, 'g')) || []).length; const w = (code.match(new RegExp(`\\.${k}\\s*(?:=(?!=)|\\+=|\\+\\+)`, 'g')) || []).length; const self = (code.match(new RegExp(`=\\s*\\(s\\.stats\\.${k} \\|\\|`, 'g')) || []).length; return all - w - self <= 0; });
check('every stat counted is shown or used', !writeOnly.length, writeOnly);
check('the forecast you read is shown', /S\.sys\.forecast/.test(code));
console.log(fails ? `${fails} dead-reference check(s) failed, ${passes} passed.` : `All ${passes} dead-reference checks passed.`); process.exitCode = fails ? 1 : 0;
