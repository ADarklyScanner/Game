// Lists everything in the game that must be tested, straight from the code.  node inventory.js  (writes inventory.json)
const fs = require('fs'); const path = require('path'); const { loadGame } = require('./load-game');
const FILE = process.env.GAME_FILE || path.join(__dirname, '..', 'index.html');
const E = loadGame(FILE); const D = E.DATA;
const html = fs.readFileSync(FILE, 'utf8'); const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const eng = scripts.find(s => s.includes('Survival engine')); const ui = scripts.find(s => s.includes('function renderSetup'));
// every refusal reason each action can give, read from the availability rules
const avStart = eng.indexOf('function available(s, id)'); const avEnd = eng.indexOf('\n}\n', avStart); const av = eng.slice(avStart, avEnd);
const why = {}; const caseRe = /case '([a-z_]+)':/g; let m; const cases = []; while ((m = caseRe.exec(av))) cases.push([m[1], m.index]);
for (let i = 0; i < cases.length; i++) { const [id, at] = cases[i]; const body = av.slice(at, i + 1 < cases.length ? cases[i + 1][1] : av.length); const reasons = new Set(); for (const r of body.matchAll(/r\(false, (['`])((?:\\.|(?!\1).)*)\1/g)) reasons.add(r[2].replace(/\$\{[^}]*\}/g, '…')); if (reasons.size) why[id] = [...reasons]; }
const inv = {
  actions: Object.keys(E.ACTIONS),
  why,
  nightActions: E.NIGHT_OK,
  events: Object.fromEntries(Object.entries(E.EVENTS).map(([k, e]) => [k, e.options.map(o => o.label)])),
  places: D.seasons.map(s => s.key),
  gear: D.gear.map(g => g.id),
  foods: Object.keys(D.foods),
  shelters: Object.keys(E.SHELTERS),
  miniGames: [...new Set([...ui.matchAll(/function (start[A-Z]\w*)/g)].map(x => x[1]))].filter(n => n !== 'startGame'),
  panels: [...new Set([...ui.matchAll(/function (open[A-Z]\w*)/g)].map(x => x[1]))],
  screens: [...new Set([...ui.matchAll(/function (render[A-Z]\w*)/g)].map(x => x[1]))],
  conditions: [...new Set([...eng.matchAll(/name: '([A-Z][^']{3,60})', days:/g)].map(x => x[1]))],
};
fs.writeFileSync(path.join(__dirname, 'inventory.json'), JSON.stringify(inv, null, 1));
const n = Object.values(why).reduce((a, x) => a + x.length, 0);
console.log(`Inventory: ${inv.actions.length} actions (${n} refusal reasons), ${Object.keys(inv.events).length} events (${Object.values(inv.events).flat().length} choices), ${inv.miniGames.length} mini-games, ${inv.panels.length} panels, ${inv.screens.length} screens, ${inv.places.length} places, ${inv.gear.length} gear, ${inv.foods.length} foods, ${inv.shelters.length} shelters, ${inv.conditions.length} named conditions.`);
