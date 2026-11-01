// Coverage for the bug hunt: a test-only copy of the engine that records what ran. The game file is not changed.
// const { loadCovered, mark } = require('./cover');  E = loadCovered();  ... marks are merged into .coverage.json at exit.
const fs = require('fs'); const path = require('path'); const vm = require('vm');
const FILE = path.join(__dirname, '.coverage.json'); let data = null;
function load() { if (!data) { try { data = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch (e) { data = {}; } } return data; }
function mark(kind, id) { const d = load(); (d[kind] = d[kind] || {}); d[kind][id] = (d[kind][id] || 0) + 1; }
process.on('exit', () => { if (data) fs.writeFileSync(FILE, JSON.stringify(data)); });
function patch(src, a, b) { if (!src.includes(a)) throw new Error('cover: hook point missing: ' + a.slice(0, 60)); return src.replace(a, b); }
function loadCovered(file = process.env.GAME_FILE || path.join(__dirname, '..', 'index.html')) {
  const html = fs.readFileSync(file, 'utf8'); const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  let eng = scripts.find(s => s.includes('Survival engine')); const dat = scripts.find(s => s.includes('globalThis.DATA'));
  eng = patch(eng, 'function available(s, id) {', 'function available(s, id) { const __v = _available(s, id); __cov(__v.ok ? "allowed" : "refused", __v.ok ? id : id + " | " + __v.why); return __v; }\nfunction _available(s, id) {');
  eng = patch(eng, "s._at = s.hours - h; try { doAction(", "__cov('ran', id); s._at = s.hours - h; try { doAction(");
  eng = patch(eng, "const e = EVENTS[s.event.id]; const o = e.options[s.event.optIds[i] ?? s.event.optIds[0]];", "const e = EVENTS[s.event.id]; const o = e.options[s.event.optIds[i] ?? s.event.optIds[0]]; __cov('event', s.event.id); __cov('choice', s.event.id + ' #' + (s.event.optIds[i] ?? s.event.optIds[0]));");
  eng = patch(eng, "function newGame(seasonKey, gear, opts = {}) {", "function newGame(seasonKey, gear, opts = {}) { __cov('place', seasonKey); for (const g of gear) __cov('gear', g);");
  eng = patch(eng, "function addFood(s, id, portions, days, keep) {", "function addFood(s, id, portions, days, keep) { __cov('food', id);");
  eng = patch(eng, "s.shelterType = s.shelterGoal;", "__cov('shelter', s.shelterGoal); s.shelterType = s.shelterGoal;");
  eng = patch(eng, "s.today.night = lines; s.phase = -1;", "s.today.night = lines; s.phase = -1; __scan(s);");
  const ctx = { console, Math, JSON, Object, Array, Number, String, Set, Map, Infinity, NaN, isFinite, parseInt, parseFloat, Date };
  ctx.globalThis = ctx; ctx.window = ctx;
  ctx.__cov = mark; ctx.__scan = s => { for (const c of s.conditions) mark('condition', c.name.replace(/ \(infected\)$/, '')); for (const x of s.raw) mark('food', x.id); if (s.status !== 'playing') mark('ending', s.status); if (s.event) mark('event', s.event.id); };
  vm.createContext(ctx); vm.runInContext(dat, ctx);
  new vm.Script(eng, { filename: 'engine-under-test.js' }).runInContext(ctx);
  const E = ctx.Engine; const ch = E.choose; E.choose = (s, i) => { if (s.event) mark('event', s.event.id); return ch(s, i); };
  return E;
}
module.exports = { loadCovered, mark };
