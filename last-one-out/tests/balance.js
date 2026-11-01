// Median survival days with the full bot, per place and overall.
//   node balance.js --record   save the reference      node balance.js   compare (overall median must stay within 5%)
const fs = require('fs'); const path = require('path');
const { loadGame } = require('./load-game'); const { makeBot } = require('./bot');
const E = loadGame(process.env.GAME_FILE || undefined); const D = E.DATA; const REF = path.join(__dirname, 'balance.json');
const SEEDS = Array.from({ length: Number(process.env.SEEDS || 30) }, (_, i) => 1000 + i * 7919);
const GEAR = [...D.gear].sort((a, b) => b.rate - a.rate).slice(0, 10).map(g => g.id);
const med = a => { const b = [...a].sort((x, y) => x - y); return b[b.length >> 1]; };
const out = { places: {}, all: [] , preserved: 0, runs: 0 };
for (const se of D.seasons) { const days = [];
  for (const seed of SEEDS) { const s = E.newGame(se.key, GEAR, { seed, weight: 200 }); const bot = makeBot(E, s); let used = false;
    while (s.status === 'playing' && s.day < 200) { E.runDay(s, bot); if (!used && s.stores.some(x => x.smoked || x.dried || x.where)) used = true; }
    days.push(s.day); out.all.push(s.day); out.runs++; if (used) out.preserved++; }
  out.places[se.key] = med(days); }
const summary = { median: med(out.all), places: out.places, preservedShare: Math.round(100 * out.preserved / out.runs) };
if (process.argv.includes('--record')) { fs.writeFileSync(REF, JSON.stringify(summary, null, 1)); console.log('Recorded', JSON.stringify(summary)); process.exit(0); }
const ref = JSON.parse(fs.readFileSync(REF, 'utf8')); const shift = (summary.median - ref.median) / ref.median;
console.log(`Overall median: ${ref.median} -> ${summary.median} days (${(shift * 100).toFixed(1)}%). Runs that preserved food: ${ref.preservedShare}% -> ${summary.preservedShare}%.`);
for (const k in ref.places) { const a = ref.places[k], b = summary.places[k]; const d = (b - a) / a; console.log(`  ${k.padEnd(13)} ${String(a).padStart(3)} -> ${String(b).padStart(3)}${Math.abs(d) > 0.1 ? '   <-- moved ' + Math.round(d * 100) + '%' : ''}`); }
process.exit(Math.abs(shift) <= 0.05 ? 0 : 1);
