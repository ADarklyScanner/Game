// every kit of K items (no other gear), run in every place with the same seeds; average days per place, capped at 60
const { loadGame } = require('../load-game'); const { makeBot } = require('../bot');
const E = loadGame(); const D = E.DATA; const K = +process.argv[2], SEEDS = +process.argv[3], part = +process.argv[4], parts = +process.argv[5], CAP = 60;
const ids = D.gear.map(g => g.id).sort(); const seeds = Array.from({ length: SEEDS }, (_, i) => 4001 + i * 7919);
const combos = []; const rec = (start, cur) => { if (cur.length === K) { combos.push(cur.slice()); return; } for (let i = start; i < ids.length; i++) { cur.push(ids[i]); rec(i + 1, cur); cur.pop(); } }; rec(0, []);
const out = {};
for (let c = part; c < combos.length; c += parts) { const kit = combos[c]; const row = [];
  for (const se of D.seasons) { let sum = 0; for (const sd of seeds) { const s = E.newGame(se.key, kit, { seed: sd, weight: 200 }); const bot = makeBot(E, s); let g = 0; while (s.status === 'playing' && s.day < CAP && g++ < 200) E.runDay(s, bot); sum += Math.min(CAP, s.day); } row.push(+(sum / seeds.length).toFixed(2)); }
  out[kit.join('|')] = row; }
require('fs').writeFileSync(`combo/k${K}_p${part}.json`, JSON.stringify({ places: D.seasons.map(s => s.key), seeds: SEEDS, out }));
