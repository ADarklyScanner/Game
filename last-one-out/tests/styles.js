// Step 3: many kinds of player, rules checked after every action and every night.  node styles.js [gamesPerStylePerPlace]
const { loadCovered } = require('./cover'); const { problems, saveText, reload } = require('./invariants');
const E = loadCovered(); const D = E.DATA; const ids = Object.keys(E.ACTIONS); const N = Number(process.argv[2] || 3);
const gearAll = D.gear.map(g => g.id); const POP = [...D.gear].sort((a, b) => b.rate - a.rate).slice(0, 10).map(g => g.id);
const FOOD = ['fish', 'checknet', 'setnet', 'checktraps', 'snares', 'hunt', 'berries', 'greens', 'roots', 'shellfish', 'forage', 'clean', 'dress', 'cook'];
let seed = 1; const R = () => { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; return seed / 4294967296; };
const ok = (s, id) => { try { return E.available(s, id).ok; } catch (e) { return false; } };
const STYLES = {
  random: { gear: () => [...gearAll].sort(() => R() - 0.5).slice(0, 10), pick: s => { const a = ids.filter(i => ok(s, i)); return R() < 0.05 || !a.length ? null : a[Math.floor(R() * a.length)]; }, ev: s => Math.floor(R() * s.event.optIds.length) },
  careless: { gear: () => POP, pick: s => ['light_fire', 'fish', 'hunt', 'forage', 'roots', 'greens', 'mushrooms', 'berries', 'climb', 'raft_fish', 'firewood', 'rest'].find(i => ok(s, i) && s.today.done.filter(x => x === i).length < 2) || null, ev: () => 0, cook: 'raw' },
  fisher: { gear: () => POP, pick: s => ['light_fire', 'firewood', 'tinder', 'fish', 'setlines', 'setnet', 'checknet', 'clean', 'smoke', 'dry_food', 'bait'].find(i => ok(s, i) && s.today.done.filter(x => x === i).length < 2) || null, ev: () => 0 },
  hunter: { gear: () => [...POP, 'Knife'].slice(0, 10), pick: s => ['light_fire', 'firewood', 'tinder', 'scout', 'snares', 'checktraps', 'hunt', 'track', 'dress', 'clean', 'craft_arrows', 'smoke_clothes'].find(i => ok(s, i) && s.today.done.filter(x => x === i).length < 2) || null, ev: () => 0 },
  forager: { gear: () => POP, pick: s => ['light_fire', 'firewood', 'tinder', 'inspect', 'berries', 'greens', 'roots', 'mushrooms', 'nettle', 'cattail', 'rosehips', 'seeds', 'pinenuts', 'shellfish', 'seaweed', 'insects', 'forage'].find(i => ok(s, i) && s.today.done.filter(x => x === i).length < 2) || null, ev: () => 2 },
  starved: { gear: () => [], pick: s => ['tinder', 'craft_bowdrill', 'light_fire', 'cut_poles', 'boughs', 'shelter', 'stones', 'craft_stoneblade', 'dig_clay', 'shape_pot', 'fire_pots', 'bark', 'cordage', 'craft_handline', 'craft_hooks', 'fish', 'forage', 'firewood'].find(i => ok(s, i) && s.today.done.filter(x => x === i).length < 2) || null, ev: () => 1 },
  nightowl: { gear: () => POP, pick: s => ['light_fire', 'firewood', 'tinder', 'fish', 'clean', 'render_fat', 'craft_lamp', 'forage'].find(i => ok(s, i) && s.today.done.filter(x => x === i).length < 2) || null, night: s => ['craft_lamp', 'whittle', 'cordage', 'mend', 'work_hide', 'read_sky', 'render_fat', 'tend_fire', 'talk_camera'].find(i => ok(s, i) && !s.today.done.includes(i)) || null, ev: () => 0 },
  mover: { gear: () => POP, pick: s => { if (s.day % 9 === 0 && s.phase === 0 && !s.today.done.includes('move_camp')) { try { E.moveCamp(s, 300 + Math.floor(R() * 600)); } catch (e) { throw e; } } return ['light_fire', 'firewood', 'tinder', 'shelter', 'cut_poles', 'boughs', 'fish', 'forage', 'craft_rack', 'dry_food', 'craft_hearth', 'stones', 'bed'].find(i => ok(s, i) && s.today.done.filter(x => x === i).length < 2) || null; }, ev: () => 0 },
};
const found = new Map(); const report = (k, ctx) => { if (!found.has(k)) found.set(k, { n: 0, ctx }); found.get(k).n++; };
function play(style, key, gear, sd, record) {
  const st = STYLES[style]; const s = E.newGame(key, gear, { seed: sd, weight: 150 + (sd % 90) }); if (st.cook) s.cook = st.cook; const trail = [];
  const settle = () => { while (s.event && s.status === 'playing') { const i = Math.min(s.event.optIds.length - 1, Math.max(0, st.ev(s))); trail.push(['e', i]); E.choose(s, i); } };
  for (let d = 0; d < 200 && s.status === 'playing'; d++) {
    E.beginDay(s); settle(); let guard = 0;
    while (s.status === 'playing' && s.phase >= 0 && guard++ < 40) {
      const night = s.phase === 3; const id = night ? (st.night ? st.night(s) : null) : st.pick(s); if (!id) break; if (night && !E.nightOk(s, id)) break;
      const extra = [{}, { good: true }, { good: false }][Math.floor(R() * 3)]; trail.push(['a', id, extra]);
      try { E.act(s, id, { extra, inside: night }); } catch (e) { report(`crash in ${id}: ${e.message} | ${(e.stack || '').split('\n')[1]}`, `${style} ${key} day ${s.day}`); return null; }
      for (const p of problems(s, E)) report(`${style}: after ${id}: ${p}`, `${key} day ${s.day}`); settle();
    }
    if (s.status === 'playing') { try { E.endDay(s); } catch (e) { report(`night crash: ${e.message} | ${(e.stack || '').split('\n')[1]}`, `${style} ${key} day ${s.day}`); return null; } for (const p of problems(s, E)) report(`${style}: after the night: ${p}`, `${key} day ${s.day}`); }
    if (record && d === 20) record.snap = saveText(s);
  }
  return { s, trail };
}
for (const style of Object.keys(STYLES)) for (const se of D.seasons) for (let i = 0; i < N; i++) {
  const sd = 1000 + i * 7919 + se.key.length; seed = sd; const gear = STYLES[style].gear();
  const rec = {}; const a = play(style, se.key, gear, sd, rec); if (!a) continue;
  // the same seed and the same choices give the same game
  if (i === 0) { seed = sd; const b = play(style, se.key, STYLES[style].gear(), sd); if (b && saveText(a.s) !== saveText(b.s)) report(`${style}: same seed and choices gave a different game`, se.key); }
  // a save mid-run reloads to exactly the same state
  if (rec.snap) { const g = reload(rec.snap); if (saveText(g) !== rec.snap) report(`${style}: save did not round-trip`, se.key); }
  if (saveText(a.s).length > 500000) report(`${style}: save over 500 KB (${saveText(a.s).length})`, `${se.key} day ${a.s.day}`);
}
const list = [...found.entries()].sort((x, y) => y[1].n - x[1].n);
console.log(list.length ? `${list.length} distinct problem(s):` : `${Object.keys(STYLES).length} player styles x ${D.seasons.length} places x ${N}: no problems.`);
for (const [k, v] of list.slice(0, 50)) console.log(`  [${v.n}x] ${k}   e.g. ${v.ctx}`);
process.exit(list.length ? 1 : 0);
