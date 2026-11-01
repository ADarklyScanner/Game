// Plays fixed seeds in every place and fingerprints the result.
//   node baseline.js --record   save today's behaviour as the reference
//   node baseline.js            compare the current game against the reference
const fs = require('fs'); const path = require('path'); const crypto = require('crypto');
const { loadGame } = require('./load-game'); const { makeBot } = require('./bot');
const E = loadGame(process.env.GAME_FILE || undefined); const D = E.DATA;
const REF = path.join(__dirname, 'baseline.json');
const SEEDS = [11, 222, 3333]; const GEAR = [...D.gear].sort((a, b) => b.rate - a.rate).slice(0, 10).map(g => g.id);
const fp = s => crypto.createHash('sha1').update(JSON.stringify(s, (k, v) => v === Infinity ? 'Inf' : v)).digest('hex').slice(0, 12);
const out = {};
for (const se of D.seasons) for (const seed of SEEDS) {
  const s = E.newGame(se.key, GEAR, { seed, weight: 200 }); const bot = makeBot(E, s); const marks = {};
  while (s.status === 'playing' && s.day < 200) { E.runDay(s, bot); if ([5, 25, 50].includes(s.day)) marks['d' + s.day] = fp(s); }
  out[`${se.key}#${seed}`] = { ...marks, end: fp(s), day: s.day, status: s.status };
}
if (process.argv.includes('--record')) { fs.writeFileSync(REF, JSON.stringify(out, null, 1)); console.log(`Recorded ${Object.keys(out).length} runs.`); process.exit(0); }
const ref = JSON.parse(fs.readFileSync(REF, 'utf8')); let diffs = 0;
for (const k of Object.keys(ref)) {
  const a = ref[k], b = out[k]; if (!b) { console.log('MISSING', k); diffs++; continue; }
  const first = ['d5', 'd25', 'd50', 'end'].find(m => a[m] !== b[m]);
  if (first) { diffs++; console.log(`CHANGED ${k}: first differs at ${first} (was day ${a.day} ${a.status}, now day ${b.day} ${b.status})`); }
}
console.log(diffs ? `${diffs} of ${Object.keys(ref).length} runs changed.` : `All ${Object.keys(ref).length} runs match the reference.`);
process.exit(diffs ? 1 : 0);
