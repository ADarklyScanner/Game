// Camping, simulated: how the lessons go for different players and kits, where the lesson chip points at something that
// cannot be done yet, and what would have ended a real run.  node camping-sim.js   (SEEDS=40 DAYS=30 CHIP=current|staged)
// Players: learner (does what the lesson chip says, first thing each day; otherwise what it can from the list; then keeps
// itself alive like the test bot), survivor (the test bot alone), careless (fishes, hunts and forages in a rush, eats raw).
const fs = require('fs'); const path = require('path');
const { loadGame } = require('./load-game'); const { makeBot } = require('./bot');
const GAME = process.env.GAME_FILE || path.join(__dirname, '..', 'index.html');
const E = loadGame(process.env.GAME_FILE || undefined); const D = E.DATA;
const html = fs.readFileSync(GAME, 'utf8'); const a0 = html.indexOf('const LESSONS = ['); const b0 = html.indexOf('/* end of lesson rules */', a0); if (a0 < 0 || b0 < 0) throw new Error('lesson rules not found');
const RULES = new Function('E', html.slice(a0, b0) + '; return { LESSONS, lessonState, chipLesson, lessonCounts, STAGES, stageEnter, nextStage, stageCount, stageDone };')(E); const { LESSONS } = RULES; const ev = (s, id) => !!(s.everDone && s.everDone[id]); /* the game's own lessons and chip rules */
let N = Number(process.env.SEEDS || 40), DAYS = Number(process.env.DAYS || 30); const SEEDS = Array.from({ length: N }, (_, i) => 101 + i * 7919);
const POP = [...D.gear].sort((a, b) => b.rate - a.rate).slice(0, 10).map(g => g.id);
const KITS = { full: ['Knife', 'Pot', 'Ferro rod', 'Axe', 'Fishing gear', 'Sleeping bag', 'Tarp', 'Paracord', 'Bow and arrows', 'Saw'], popular: POP, light: ['Knife', 'Ferro rod', 'Pot'], bare: [] };
const CARELESS = ['light_fire', 'fish', 'hunt', 'forage', 'roots', 'greens', 'mushrooms', 'berries', 'climb', 'raft_fish', 'firewood', 'rest'];
const MAP_ONLY = { drink_edge: s => { s.everDone.drink_edge = 1; E.drinkUp && E.drinkUp(s); E.travel(s, 300); }, ford: s => { s.stats.ford = (s.stats.ford || 0) + 1; E.travel(s, 900); }, wreck: s => { E.travel(s, 1600); E.foundWreck(s); } };
const done = (s, l) => { try { return !!l[4](s); } catch (e) { return false; } };
// why a lesson cannot be done now ('' if it can)
function blockOf(s, l) {
  const id = l[1]; if (id === 'eat') return ''; if (MAP_ONLY[id]) return E.hoursLeft(s) < 1.5 ? 'late in the day' : '';
  if (id === 'camp') return ''; if (id === 'better') { const o = E.shelterOptions(s).filter(k => (E.SHELTER_NAMES ? true : true) && E.shelterLevel && E.shelterLevel(k) >= 2); return o.length ? (E.available(s, 'shelter').ok || !s.shelterGoal ? '' : E.available(s, 'shelter').why) : 'no better design possible yet'; }
  if (id === 'shelter' && !s.shelterGoal) return E.shelterOptions(s).length ? '' : 'no design possible';
  const r = E.available(s, id); return r.ok ? '' : (r.why || 'not offered');
}
function kind(why) {
  if (!why) return '';
  if (/late in the day|light|dark|Too late/i.test(why)) return 'time of day';
  if (/snow|frozen|freeze|ice|tide|season|ripe|No rain|not raining|first light|morning|after dark|night/i.test(why)) return 'weather or season';
  if (/^No (knife|axe|saw|bow|rod|pot|net|fishing|gear|container)|Nothing to (boil|carry)|Needs (a knife|an axe|a saw|a pot|an axe or saw)|No ferro|No tackle|kit/i.test(why)) return 'kit';
  if (/carcass|kill|raw fat|hide|catch|Nothing (fresh|to clean)|No fish|first|Build|needs a fire|Needs a (burning )?fire|No water at camp/i.test(why)) return 'an earlier step';
  if (/^Needs \d|poles|cordage|boughs|logs|stone|clay|bark|tinder|portions/i.test(why)) return 'materials';
  if (/Already|Enough|Made|Built|done today|full|going well/i.test(why)) return 'already done for now';
  return 'other';
}
// the lesson chip: CHIP=game is the game's rules; CHIP=old is the first lesson not done, as it was before them
const CHIP = process.env.CHIP || 'game';
function chipLesson(s) {
  if (CHIP === 'old') { const l = LESSONS.find(m => !done(s, m)); return l ? { l, step: null } : null; }
  const c = RULES.chipLesson(s); return c ? { l: c[0], step: c[1].st === 'step' ? c[1].step : null } : null;
}
const chipBlock = (s, c) => c.step ? (E.available(s, c.step).ok ? '' : E.available(s, c.step).why || 'no') : blockOf(s, c.l);
function lessonAct(s, l) { const id = l[1];
  if (MAP_ONLY[id]) { MAP_ONLY[id](s); return null; }
  if (id === 'camp') { s.campChosen = true; return null; }
  if (id === 'shelter' && !s.shelterGoal) { const o = E.shelterOptions(s); if (o.length) E.chooseShelter(s, o[0]); }
  if (id === 'better') { const o = E.shelterOptions(s).filter(k => E.shelterLevel && E.shelterLevel(k) >= 2); if (o.length && (!s.shelterGoal || s.shelterGoal === s.shelterType)) E.chooseShelter(s, o[0]); return E.available(s, 'shelter').ok ? 'shelter' : null; }
  return E.available(s, id).ok ? id : null; }
function play(kit, who, seed) {
  const s = E.newGame(E.PRACTICE_KEY, KITS[kit], { seed, weight: 200 }); if (who !== 'learner') s.campChosen = true;
  const bot = makeBot(E, s); const rec = { stageDay: {}, lessonDay: {}, chipStuck: 0, chipDays: 0, stuckWhy: {}, ended: {}, low: { health: 0, will: 0, water: 0, food: 0 }, curve: [] };
  let chipChecked = -1;
  const learner = st => {
    if (CHIP !== 'old' && !RULES.chipLesson(st)) { const k = st.stage; if (rec.stageDay[k] == null) rec.stageDay[k] = st.day; const nk = RULES.nextStage(st); if (nk != null) RULES.stageEnter(st, nk); }
    if (st.day !== chipChecked) { chipChecked = st.day; const c = chipLesson(st); if (c) { rec.chipDays++; const why = chipBlock(st, c); if (why) { rec.chipStuck++; const k = c.l[1] + ': ' + kind(why) + ' (' + String(why).slice(0, 40) + ')'; rec.stuckWhy[k] = (rec.stuckWhy[k] || 0) + 1; } } }
    for (let guard = 0; guard < 4; guard++) { const c = chipLesson(st); if (!c || chipBlock(st, c)) break; if (c.step) return c.step; if (c.l[1] === 'eat') return bot(st); const id = lessonAct(st, c.l); if (id) return id; if (done(st, c.l)) continue; break; }
    if (CHIP === 'old') for (const l of LESSONS) { if (done(st, l) || blockOf(st, l)) continue; const id = lessonAct(st, l); if (id) return id; } /* with stages, a learner sticks to the stage */
    return bot(st); };
  learner.event = bot.event; learner.night = st => (!ev(st, 'tend_fire') && E.available(st, 'tend_fire').ok ? 'tend_fire' : bot.night ? bot.night(st) : null);
  const careless = st => CARELESS.find(i => E.available(st, i).ok && st.today.done.filter(x => x === i).length < 2) || null;
  const policy = who === 'learner' ? learner : who === 'survivor' ? bot : careless; if (who === 'careless') s.cook = 'raw';
  for (let d = 0; d < DAYS && s.status === 'playing'; d++) {
    E.runDay(s, policy);
    for (const l of LESSONS) if (rec.lessonDay[l[1]] == null && done(s, l)) rec.lessonDay[l[1]] = s.day;
    const st = E.status(s); if (s.health <= 45) rec.low.health++; if (s.morale <= 45) rec.low.will++; if (E.hydOf(s) < 30) rec.low.water++; if (s.weight < s.weight0 * 0.93) rec.low.food++;
    if (who === 'learner' && CHIP !== 'old') for (let k = 0; k < RULES.STAGES.length; k++) if (rec.stageDay[k] == null && RULES.stageDone(s, k)) rec.stageDay[k] = s.day;
    rec.curve.push([s.day, Math.round(s.health), Math.round(s.morale), Math.round(E.hydOf(s)), Math.round(100 * s.weight / s.weight0), Object.keys(rec.lessonDay).length]);
  }
  for (const l of s.log) for (const [t] of l.lines) { const m = /would have ended it \(([^)]*)\)/.exec(t); if (m) { const k = m[1].replace(/\d+/g, 'N').slice(0, 60); rec.ended[k] = (rec.ended[k] || 0) + 1; } }
  for (let k = 0; k < RULES.STAGES.length; k++) if (rec.stageDay[k] == null && RULES.stageDone(s, k)) rec.stageDay[k] = s.day;
  rec.finalWhy = {}; for (const l of LESSONS) if (!done(s, l)) { const x = RULES.lessonState(s, l); rec.finalWhy[l[1]] = x.st + (x.why ? ': ' + x.why : ''); } rec.counts = RULES.lessonCounts(s);
  rec.days = s.day; return rec;
}
module.exports = { play, E, RULES };
if (require.main === module) {
const out = {}; const t0 = Date.now();
for (const who of ['learner', 'survivor', 'careless']) for (const kit of Object.keys(KITS)) { if (who !== 'learner' && kit !== 'full' && kit !== 'bare') continue; out[who + '/' + kit] = SEEDS.map(sd => play(kit, who, sd)); process.stderr.write(`${who}/${kit} (${Math.round((Date.now() - t0) / 1000)} s)\n`); }
fs.writeFileSync(process.env.OUT || '/tmp/camping-sim.json', JSON.stringify({ chip: CHIP, lessons: LESSONS.map(l => [l[0], l[1], l[2]]), out }));
// summary
const pct = (a, b) => Math.round(100 * a / Math.max(1, b));
for (const [k, runs] of Object.entries(out)) {
  const n = runs.length; const at = d => runs.reduce((a, r) => a + Object.values(r.lessonDay).filter(x => x <= d).length, 0) / n;
  const stuck = runs.reduce((a, r) => a + r.chipStuck, 0), cd = runs.reduce((a, r) => a + r.chipDays, 0);
  const ends = {}; for (const r of runs) for (const [w, c] of Object.entries(r.ended)) ends[w] = (ends[w] || 0) + c;
  const low = f => pct(runs.reduce((a, r) => a + r.low[f], 0), runs.reduce((a, r) => a + r.curve.length, 0));
  const tot = runs.reduce((a, r) => a + r.counts.total, 0) / n; console.log(`\n${k} (${tot.toFixed(1)} lessons possible with this kit): lessons by day 3 ${at(3).toFixed(1)}, day 7 ${at(7).toFixed(1)}, day 14 ${at(14).toFixed(1)}, day 30 ${at(30).toFixed(1)} of ${LESSONS.length}` + (k.startsWith('learner') ? `; chip pointed at something not doable on ${pct(stuck, cd)}% of days` : ''));
  console.log(`  days low on health ${low('health')}%, will ${low('will')}%, water ${low('water')}%, down 7%+ in weight ${low('food')}%; would-have-ended per run ${(Object.values(ends).reduce((a, b) => a + b, 0) / n).toFixed(2)}: ${Object.entries(ends).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([w, c]) => `${w} ${(c / n).toFixed(2)}`).join('; ')}`);
}
}
