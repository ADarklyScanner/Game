// Lazy-player tests for Hold Fast. Each test plays a bot that skips something a real person can't skip,
// and checks how long the character lasts against a rough real-world limit.
// Use: node lazy.js (reads the game straight out of ../index.html)
const { loadGame } = require('./load-game'); const E = loadGame(); const D = E.DATA;
const KIT = ['Pot','Fishing gear','Ferro rod','Sleeping bag','Saw','Axe','Knife','Tarp','Paracord','Rations'];
const idle = Object.assign(s => null, { event: s => 0 });
function run(key, kit, pol, seed, maxDays = 90) { const s = E.newGame(key, kit, { seed }); while (s.status === 'playing' && s.day < maxDays) E.runDay(s, pol); return s; }
const TESTS = [
  { name: 'Sleep only, no water, no food, no kit', kit: [], pol: idle, realMax: 4, why: 'about 3 days without water' },
  { name: 'Sleep only, no water, no food, typical kit', kit: KIT, pol: idle, realMax: 4, why: 'about 3 days without water' },
];
let fails = 0;
for (const t of TESTS) { console.log('\n== ' + t.name + ` (real-world limit about ${t.realMax} days: ${t.why})`);
  for (const se of D.seasons) { const days = [1, 2, 3, 4, 5].map(seed => run(se.key, t.kit, t.pol, seed)); const lo = Math.min(...days.map(s => s.day)), hi = Math.max(...days.map(s => s.day));
    const sick = days.some(s => (s.conditions || []).some(c => /Giardia/.test(c.name)) || /giardia/i.test(s.endReason));
    const bad = lo > t.realMax; if (bad) fails++;
    console.log(`${bad ? 'FAIL' : 'ok  '} ${se.key.padEnd(13)} lasted ${lo}-${hi} days${sick ? '  (got giardia without drinking)' : ''}  ${days[0].endReason.slice(0, 60)}`); } }
console.log(`\n${fails} season results last longer than a real body could.`);
process.exitCode = fails ? 1 : 0;
