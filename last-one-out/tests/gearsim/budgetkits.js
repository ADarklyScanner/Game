// random kits that fit the gear budget (up to 10 items, at most BUDGET points), in random places: does each point buy about the same days?
//   PART=0 K=400 node budgetkits.js out0.json
const { loadGame } = require('../load-game'); const { makeBot } = require('../bot');
const E = loadGame(process.env.GAME_FILE || undefined); const D = E.DATA; const K = Number(process.env.K || 400), CAP = 100; const part = Number(process.env.PART || 0);
const ids = D.gear.map(g => g.id); const out = [];
let r = 777 + part * 7777; const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
for (let i = 0; i < K; i++) { const pool = [...ids]; const kit = [];
  while (pool.length && kit.length < 10) { const id = pool.splice(Math.floor(rnd() * pool.length), 1)[0]; if (E.kitCost(kit) + E.gearCost(id) <= E.BUDGET) kit.push(id); }
  const se = D.seasons[Math.floor(rnd() * D.seasons.length)]; const s = E.newGame(se.key, kit, { seed: 5000 + i + part * 100000, weight: 200, budget: true }); const bot = makeBot(E, s); let g = 0;
  while (s.status === 'playing' && s.day < CAP && g++ < 300) E.runDay(s, bot); out.push({ place: se.key, kit, pts: E.kitCost(kit), days: Math.min(CAP, s.day) }); }
require('fs').writeFileSync(process.argv[2], JSON.stringify(out));
