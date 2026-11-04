// The show-independence safety net: every place, 3 fixed seeds, a fixed kit, 30 days (or the end). Wording passes must not change a number.
//   node golden.js --record    save golden.json        node golden.js    compare
const fs = require('fs'); const path = require('path');
const { loadGame } = require('./load-game'); const { makeBot } = require('./bot');
const E = loadGame(process.env.GAME_FILE || undefined); const OUT = path.join(__dirname, 'golden.json');
const KIT = ['Axe', 'Ferro rod', 'Pot', 'Fishing gear', 'Sleeping bag', 'Paracord', 'Knife', 'Trapping wire', 'Bow and arrows', 'Tarp'];
const res = {};
for (const se of E.DATA.seasons) for (const seed of [11, 222, 3333]) {
  const s = E.newGame(se.key, KIT, { seed, weight: 190 }); const bot = makeBot(E, s); let events = 0; const ev = bot.event; bot.event = x => { events++; return ev(x); };
  while (s.status === 'playing' && s.day < 30) E.runDay(s, bot);
  const out = s.rivals.filter(r => r.out).length;
  res[se.key + '#' + seed] = { status: s.status, day: s.day, rivalsOut: out, kcal: Math.round(s.stats.kcal), weight: s.weight, health: Math.round(s.health), morale: Math.round(s.morale), events, jobs: s.stats.jobs, winDay: s.winDay, bio: E.biomeOf(se.key).id, windows: (s.windows || []).map(w => w.id).join(',') };
}
if (process.argv.includes('--record')) { fs.writeFileSync(OUT, JSON.stringify(res, null, 1)); console.log('Recorded', Object.keys(res).length, 'runs.'); process.exit(0); }
const ref = JSON.parse(fs.readFileSync(OUT, 'utf8')); let diff = 0;
for (const k of Object.keys(ref)) { const a = JSON.stringify(ref[k]), b = JSON.stringify(res[k]); if (a !== b) { diff++; if (diff <= 5) console.log('DIFF', k, '\n  was', a, '\n  now', b); } }
console.log(diff ? `${diff} of ${Object.keys(ref).length} golden runs differ.` : `All ${Object.keys(ref).length} golden runs match.`); process.exitCode = diff ? 1 : 0;
