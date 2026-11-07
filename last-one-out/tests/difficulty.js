// The numbers each place shows (a typical player's days, how often a careful player wins), simulated on the current game.
//   node difficulty.js            run every place (4 at a time), print the table, save difficulty.json
//   node difficulty.js --write    the same, then put the new numbers into the game's place data
// Per place, 60 seeds each of four ways a sensible player goes about it, plus a careless one:
//   the full test bot (keeps a fire, builds, fishes, traps, stalks), with the ten most-picked items or a mixed kit
//   (six of those, four others), and either preserving food or not.
//   typical   all four pooled: the median days is the "a typical player" number on the place card
//   careful   the best of the four for that place: how often it outlasts the last rival, and its median days
//   careless  fishes, hunts and forages in a rush, eats things raw, ignores the camp
const fs = require('fs'); const path = require('path'); const { spawn } = require('child_process');
const { loadGame } = require('./load-game'); const { makeBot, PRESERVE } = require('./bot');
const GAME = process.env.GAME_FILE || path.join(__dirname, '..', 'index.html');
const E = loadGame(process.env.GAME_FILE || undefined); const D = E.DATA;
const N = Number(process.env.SEEDS || 60); const SEEDS = Array.from({ length: N }, (_, i) => 77 + i * 15485863);
const BYRATE = [...D.gear].sort((a, b) => b.rate - a.rate).map(g => g.id); const POP = BYRATE.slice(0, 10);
const med = a => { const b = [...a].sort((x, y) => x - y); return b[b.length >> 1]; };
const rng = seed => { let x = (seed >>> 0) || 1; return () => { x = (Math.imul(x, 1103515245) + 12345) >>> 0; return x / 4294967296; }; };
const mixedKit = seed => { const r = rng(seed ^ 0x5bd1e995); const keep = [...POP].sort(() => r() - 0.5).slice(0, 6); const rest = BYRATE.filter(g => !keep.includes(g)).sort(() => r() - 0.5).slice(0, 4); return [...keep, ...rest]; };
const CARELESS = ['light_fire', 'fish', 'hunt', 'forage', 'roots', 'greens', 'mushrooms', 'berries', 'climb', 'raft_fish', 'firewood', 'rest'];
const KINDS = { popFull: [false, false], popNoPres: [false, true], mixFull: [true, false], mixNoPres: [true, true] };
function play(key, kind, seed) {
  const [mix, nopres] = KINDS[kind] || []; const s = E.newGame(key, mix ? mixedKit(seed) : POP, { seed, weight: 200 });
  let policy;
  if (kind === 'careless') { s.cook = 'raw'; policy = st => CARELESS.find(i => E.available(st, i).ok && st.today.done.filter(x => x === i).length < 2) || null; }
  else policy = makeBot(E, s, nopres ? { skip: PRESERVE } : {});
  while (s.status === 'playing' && s.day < 200) E.runDay(s, policy);
  return { days: s.day, won: s.status === 'won' };
}
function place(key) {
  const sum = r => ({ median: med(r.map(x => x.days)), win: Math.round(100 * r.filter(x => x.won).length / r.length), n: r.length });
  const runs = {}; for (const k of [...Object.keys(KINDS), 'careless']) runs[k] = SEEDS.map(sd => play(key, k, sd));
  const ways = Object.keys(KINDS).map(k => [k, sum(runs[k])]); const best = ways.sort((a, b) => b[1].win - a[1].win || b[1].median - a[1].median)[0];
  return { typical: sum(Object.keys(KINDS).flatMap(k => runs[k])), careful: Object.assign(best[1], { way: best[0] }), careless: sum(runs.careless), ways: Object.fromEntries(ways) };
}
if (process.argv[2] === '--place') { process.stdout.write(JSON.stringify(place(process.argv[3]))); process.exit(0); }

(async () => {
  const keys = D.seasons.map(se => se.key); const res = {}; let next = 0; const t0 = Date.now();
  const worker = () => new Promise(done => { const go = () => { if (next >= keys.length) return done(); const k = keys[next++]; let buf = '';
    const c = spawn(process.execPath, [__filename, '--place', k], { env: process.env }); c.stdout.on('data', d => buf += d); c.stderr.on('data', d => process.stderr.write(d));
    c.on('close', () => { res[k] = JSON.parse(buf); process.stderr.write(`${k} done (${Math.round((Date.now() - t0) / 1000)} s)\n`); go(); }); }; go(); });
  await Promise.all(Array.from({ length: Number(process.env.JOBS || 4) }, worker));
  const old = D.difficulty || {}; const table = {};
  console.log(`place          name                          typical days (was)  careful wins (was)  careful days  careless wins  longest rival  best way`);
  for (const se of D.seasons) { const r = res[se.key], o = old[se.key] || {}; const win = Math.max(...se.rivals.map(x => x.days || 0));
    table[se.key] = { human: r.typical.win, careful: r.careful.win, careless: r.careless.win, median: r.typical.median, carefulMedian: r.careful.median, realMedian: o.realMedian, winner: o.winner ?? win };
    console.log(`${se.key.padEnd(14)} ${se.name.padEnd(29)} ${String(r.typical.median).padStart(4)} (${String(o.median ?? '-').padStart(3)})        ${String(r.careful.win).padStart(3)}% (${String(o.careful ?? '-').padStart(3)}%)        ${String(r.careful.median).padStart(4)}          ${String(r.careless.win).padStart(3)}%          ${String(win).padStart(3)}            ${r.careful.way}`); }
  fs.writeFileSync(path.join(__dirname, 'difficulty.json'), JSON.stringify({ table, runs: res }, null, 1));
  if (process.argv.includes('--write')) {
    let html = fs.readFileSync(GAME, 'utf8'); const at = html.indexOf('"difficulty":{'); if (at < 0) throw new Error('difficulty data not found');
    let i = at + '"difficulty":'.length, depth = 0; const st = i; for (; i < html.length; i++) { if (html[i] === '{') depth++; else if (html[i] === '}' && --depth === 0) { i++; break; } }
    JSON.parse(html.slice(st, i)); html = html.slice(0, st) + JSON.stringify(table) + html.slice(i); fs.writeFileSync(GAME, html); console.log('Written into the game.');
  }
})();
