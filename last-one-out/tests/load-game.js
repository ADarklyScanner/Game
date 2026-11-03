// Loads the game's data and engine straight out of ../index.html, so the tests always run the real file.
const fs = require('fs'); const path = require('path'); const vm = require('vm');
function loadGame(file = path.join(__dirname, '..', 'index.html')) {
  const html = fs.readFileSync(file, 'utf8');
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  const engineSrc = scripts.find(s => s.includes('Survival engine'));
  const dataSrc = scripts.find(s => s.includes('globalThis.DATA'));
  if (!engineSrc || !dataSrc) throw new Error('Could not find the data or engine script in ' + file);
  const ctx = { console, Math, JSON, Object, Array, Number, String, Set, Map, Infinity, NaN, isFinite, parseInt, parseFloat, Date };
  ctx.globalThis = ctx; ctx.window = ctx; vm.createContext(ctx);
  vm.runInContext(dataSrc, ctx); vm.runInContext(engineSrc, ctx);
  /* the rule checks fast-forward days with E.endDay and no jobs at all; the character in them still drinks, as anyone would.
     Whole days played through E.runDay (the bots, and tests/lazy.js) are left alone, so a day lying still is still a day without water. */
  const end = ctx.Engine.endDay; ctx.Engine.endDay = function (s, ...rest) { if (s && s.today) s.today.drank = true; return end.call(this, s, ...rest); };
  return ctx.Engine;
}
module.exports = { loadGame };
