// random 10-item kits in random places, played by the test bot; for working out what each item adds
const { loadGame } = require('../load-game'); const { makeBot } = require('../bot');
const E = loadGame(process.env.GAME_FILE || undefined); const D = E.DATA; const K = Number(process.env.K || 2000), CAP = 100; const part = Number(process.env.PART || 0), parts = Number(process.env.PARTS || 1);
const ids = D.gear.map(g => g.id); const out = [];
let r = 12345 + part * 7777; const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
for (let i = 0; i < K; i++) { const pool = [...ids]; const kit = []; while (kit.length < 10) kit.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  const se = D.seasons[Math.floor(rnd() * D.seasons.length)]; const s = E.newGame(se.key, kit, { seed: 1000 + i + part * 100000, weight: 200 }); const bot = makeBot(E, s); let g = 0;
  while (s.status === 'playing' && s.day < CAP && g++ < 300) E.runDay(s, bot); out.push({ place: se.key, kit, days: Math.min(CAP, s.day) }); }
require('fs').writeFileSync(process.argv[2], JSON.stringify(out));
