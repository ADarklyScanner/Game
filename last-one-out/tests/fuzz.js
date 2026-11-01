// Random play in every place: looks for crashes, broken numbers and stuck days.  node fuzz.js [runsPerPlace]
const { loadGame } = require('./load-game'); const E = loadGame(process.env.GAME_FILE || undefined); const D = E.DATA;
let seed = 1; const R = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const ids = Object.keys(E.ACTIONS); const gearAll = D.gear.map(g => g.id); const problems = {};
const note = (k, where) => { (problems[k] = problems[k] || { n: 0, where }).n++; };
const scan = (o, p, out) => { if (typeof o === 'number') { if (Number.isNaN(o) || o === -Infinity) out.push(p); } else if (o && typeof o === 'object') for (const k in o) scan(o[k], p + '.' + k, out); };
const per = Number(process.argv[2] || 20); let runs = 0;
for (const se of D.seasons) for (let r = 0; r < per; r++) {
  const gear = [...gearAll].sort(() => R() - 0.5).slice(0, 10);
  const s = E.newGame(se.key, gear, { seed: Math.floor(R() * 2 ** 31), weight: 140 + Math.floor(R() * 100) }); runs++;
  const pick = list => list[Math.floor(R() * list.length)];
  const pol = Object.assign(() => { if (R() < 0.04) return null; const av = ids.filter(i => E.available(s, i).ok); return av.length ? pick(av) : null; },
    { event: x => Math.floor(R() * (x.event.optIds || [0]).length), night: x => { const av = ids.filter(i => E.nightOk(x, i) && E.available(x, i).ok); return R() < 0.5 && av.length ? pick(av) : null; } });
  for (let d = 0; d < 250 && s.status === 'playing'; d++) {
    try { E.runDay(s, pol); E.status(s); E.placing(s); } catch (e) { note('crash: ' + e.message, `${se.key} day ${s.day}`); break; }
    const bad = []; scan(s, 's', bad); if (bad.length) { note('broken number at ' + bad[0].replace(/\.\d+/g, '.N'), `${se.key} day ${s.day}`); break; }
    for (const k in s.mats) if (s.mats[k] < 0) note('negative ' + k, `${se.key} day ${s.day}`);
    if (s.morale < 0 || s.morale > 100) note('morale out of range', `${se.key} day ${s.day}`);
    if (s.status === 'playing' && s.phase !== -1) note('day did not end', `${se.key} day ${s.day}`);
  }
}
const n = Object.keys(problems).length;
console.log(n ? JSON.stringify(problems, null, 1) : `${runs} random runs, no problems.`); process.exit(n ? 1 : 0);
