// Plays fixed seeds in every place and fingerprints the result.
//   node baseline.js --record [core|full]   save today's behaviour as the reference
//   node baseline.js                         compare the current game against the references
// "core" games never touch food preservation (drying, smoking, fat, pemmican); they must never change
// unless the core rules are changed on purpose. "full" games use everything.
const fs = require('fs'); const path = require('path'); const crypto = require('crypto');
const { loadGame } = require('./load-game'); const { makeBot, PRESERVE } = require('./bot');
const E = loadGame(process.env.GAME_FILE || undefined); const D = E.DATA;
const SEEDS = [11, 222, 3333]; const GEAR = [...D.gear].sort((a, b) => b.rate - a.rate).slice(0, 10).map(g => g.id);
const fp = s => crypto.createHash('sha1').update(JSON.stringify(s, (k, v) => v === Infinity ? 'Inf' : v)).digest('hex').slice(0, 12);
function play(mode) {
  const out = {};
  for (const se of D.seasons) for (const seed of SEEDS) {
    const s = E.newGame(se.key, GEAR, { seed, weight: 200 }); const bot = makeBot(E, s, { skip: mode === 'core' ? PRESERVE : [] }); const marks = {};
    // the core fingerprint leaves out the food-system extension, so adding it does not count as a change
    const view = () => mode === 'core' ? Object.assign({}, s, { sys: undefined }) : s;
    while (s.status === 'playing' && s.day < 200) { E.runDay(s, bot); if ([5, 25, 50].includes(s.day)) marks['d' + s.day] = fp(view()); }
    out[`${se.key}#${seed}`] = { ...marks, end: fp(view()), day: s.day, status: s.status };
  }
  return out;
}
const refFile = mode => path.join(__dirname, `baseline-${mode}.json`);
const i = process.argv.indexOf('--record');
if (i >= 0) { const modes = process.argv[i + 1] ? [process.argv[i + 1]] : ['core', 'full']; for (const m of modes) { fs.writeFileSync(refFile(m), JSON.stringify(play(m), null, 1)); console.log(`Recorded ${m}.`); } process.exit(0); }
let bad = 0;
for (const mode of ['core', 'full']) {
  const ref = JSON.parse(fs.readFileSync(refFile(mode), 'utf8')); const out = play(mode); let diffs = 0;
  for (const k of Object.keys(ref)) { const a = ref[k], b = out[k]; const first = ['d5', 'd25', 'd50', 'end'].find(m => a[m] !== b[m]); if (first) { diffs++; if (diffs <= 5) console.log(`  ${mode} CHANGED ${k}: first differs at ${first} (was day ${a.day} ${a.status}, now day ${b.day} ${b.status})`); } }
  console.log(diffs ? `${mode}: ${diffs} of ${Object.keys(ref).length} runs changed.` : `${mode}: all ${Object.keys(ref).length} runs match.`); bad += diffs;
}
process.exit(bad ? 1 : 0);
