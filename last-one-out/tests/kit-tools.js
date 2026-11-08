// Kit variants for tools and hunting: each one's trade-off, proved with the engine.  node kit-tools.js
const { loadGame } = require('./load-game'); const E = loadGame(process.env.GAME_FILE || undefined);
let fails = 0, passes = 0; const check = (name, ok, detail) => { if (ok) passes++; else { fails++; console.log('FAIL', name, detail ?? ''); } };
const VARIANTS = { 'Bow and arrows': ['Recurve bow', 'Fibreglass bow'], 'Knife': ['Folding knife', 'Machete'], 'Axe': ['Hatchet', 'Splitting maul'], 'Saw': ['Folding saw'], 'Fishing gear': ['Tenkara rod', 'Heavy handline'] };
function base(kit, seed = 41, key = 'US-S6') { const s = E.newGame(key, kit, { seed, weight: 200 }); s.campChosen = true; E.beginDay(s); s.event = null; s.storm = s.rain = s.fog = s.snowfall = s.wind = s.heat = false; s.hours = 2; s.phase = 0; return s; }
const conifer = { kind: 'conifer', age: 'mature' }, sapling = { kind: 'deciduous', age: 'sapling' }, fallen = { kind: 'log', age: 'dead' };

{ // the list itself
  for (const [b, list] of Object.entries(VARIANTS)) for (const id of list) {
    const g = E.DATA.gear.find(x => x.id === id), v = E.VARIANT[id];
    check(`${id} can be brought`, g && v && v.base === b && (E.GEAR_FAMILY[b] || []).includes(id), id);
    check(`${id} costs 1 to 4 points`, E.gearCost(id) >= 1 && E.gearCost(id) <= 4, E.gearCost(id));
    check(`${id} reads as one plain sentence`, g && /^[A-Z][^—–]*\.$/.test(g.effect) && (g.effect.match(/\. /g) || []).length === 0 && g.effect.length < 120, g && g.effect);
    check(`${id} counts as its item`, E.newGame('US-S6', [id], { seed: 1 }).gear.includes(id) && E.kindsOf(E.newGame('US-S6', [id], { seed: 1 }), b).includes(id));
  }
  check('variants sit after the ten most common items', E.DATA.gear.slice(0, 10).every(g => !E.VARIANT[g.id]));
}
{ // bows: a recurve hits harder until the weather gets to it; a fibreglass bow never minds
  const p = kit => { const s = base([kit]); return E.bowPower(s); };
  check('every bow starts with a full quiver', ['Bow and arrows', 'Recurve bow', 'Fibreglass bow'].every(k => base([k]).arrows === E.C.arrows));
  check('the recurve casts harder in fair weather', p('Recurve bow') > p('Bow and arrows') * 1.15, p('Recurve bow'));
  check('the fibreglass bow is a little weaker', p('Fibreglass bow') < p('Bow and arrows') && p('Fibreglass bow') > 0.85, p('Fibreglass bow'));
  const wet = kit => { const s = base([kit]); s.rain = true; return E.bowPower(s); };
  const cold = kit => { const s = base([kit]); s.day = 80; s.coldSnap = 1; return [E.temperature(s), E.bowPower(s)]; };
  check('rain softens the recurve below the standard bow', wet('Recurve bow') < wet('Bow and arrows'), wet('Recurve bow'));
  check('hard frost does too', cold('Recurve bow')[0] < -15 && cold('Recurve bow')[1] < 1, cold('Recurve bow'));
  check('the fibreglass bow is the same in rain and frost', wet('Fibreglass bow') === p('Fibreglass bow') && cold('Fibreglass bow')[1] === p('Fibreglass bow'));
  check('the standard bow is untouched by weather', wet('Bow and arrows') === 1 && cold('Bow and arrows')[1] === 1);
  const h = (kit, rain) => { const s = base([kit]); s.rain = rain; return E.huntOdds(s); };
  check('so the recurve finds more game on a dry day and less on a wet one', h('Recurve bow', false) > h('Bow and arrows', false) && h('Recurve bow', true) < h('Bow and arrows', true));
  const s = base(['Recurve bow']); s.rain = true; const L = E.act(s, 'hunt'); check('and the hunt says so', L.some(l => /recurve/.test(l[0])), L.map(l => l[0]));
}
{ // arrow points, an opt-in choice when you make arrows
  const make = point => { const s = base(['Bow and arrows', 'Knife']); s.arrows = 2; s.fire = true; s.mats.feathers = 2; s.mats.poles = 2; s.mats.bone = 1; E.act(s, 'craft_arrows', { extra: point ? { point } : {} }); return s; };
  const d = make(), w = make('wood'), b = make('bone');
  check('without a choice, arrows come out as before', d.arrows === 4 && !(d.sys && (d.sys.woodPts || d.sys.bonePts)) && d.mats.bone === 1 && E.pointBig(d) === 1, [d.arrows, d.sys, E.pointBig(d)]);
  check('fire-hardened wooden points are quicker: three arrows, no bone', w.arrows === 5 && w.sys.woodPts === 3 && w.mats.bone === 1, [w.arrows, w.sys.woodPts]);
  check('but they are weak against big game', E.pointBig(w) < 0.9, E.pointBig(w));
  check('bone points cost a bone', b.arrows === 4 && b.sys.bonePts === 2 && b.mats.bone === 0, [b.arrows, b.sys.bonePts, b.mats.bone]);
  check('and bite deeper into big game', E.pointBig(b) > 1, E.pointBig(b));
  const nb = (() => { const s = base(['Bow and arrows', 'Knife']); s.arrows = 2; s.fire = true; s.mats.feathers = 1; s.mats.poles = 1; s.mats.bone = 0; E.act(s, 'craft_arrows', { extra: { point: 'bone' } }); return s; })();
  check('with no bone, a bone point falls back to a plain arrow', nb.arrows === 4 && !nb.sys.bonePts, nb.sys);
  const kills = (pts) => { let n = 0; for (let sd = 1; sd <= 400; sd++) { const s = base(['Bow and arrows'], sd); s.arrows = 6; if (pts) Object.assign(E.sysOf(s), pts); E.act(s, 'hunt', { extra: { target: 'moose', hit: 'good' } }); if (s.carcass && s.carcass.big) n++; } return n; };
  const kw = kills({ woodPts: 6 }), kb = kills({ bonePts: 6 }), kd = kills(null);
  check('a quiver of wooden points brings down fewer moose than bone', kw < kd && kd < kb, [kw, kd, kb]);
  const small = (pts) => { const s = base(['Bow and arrows']); s.arrows = 6; if (pts) Object.assign(E.sysOf(s), pts); return E.huntOdds(s); };
  check('small game does not care about the point', small({ woodPts: 6 }) === small(null));
}
{ // knives
  const dress = kit => { const s = base(kit); const f = E.DATA.foods.moose; s.carcass = { hour: s.hours, id: 'moose', por: 100, big: true, dressed: false, day: s.day, fat: f.fat, organ: f.organ, size: 1 }; const h0 = s.hours; E.act(s, 'dress', { extra: {} }); return { por: s.carcass.por, h: s.hours - h0 }; };
  const k = dress(['Knife']), f = dress(['Folding knife']), m = dress(['Machete']);
  check('a folding knife is a blade', E.blade(base(['Folding knife'])) && E.blade(base(['Machete'])));
  check('a folding knife leaves meat on a big carcass', f.por < k.por, [f.por, k.por]);
  check('and takes longer at the joints', f.h > k.h + 0.5, [f.h, k.h]);
  check('a machete wastes more still', m.por < f.por, [m.por, f.por]);
  const slips = kit => { let n = 0; for (let sd = 1; sd <= 1500; sd++) { const s = base(kit, sd); s.carcass = { hour: s.hours, id: 'hare', por: 2, big: false, dressed: false, day: s.day, fat: 0, organ: 0, size: 1 }; E.act(s, 'dress', { extra: {} }); if (s.conditions.some(c => /knife/.test(c.name)) || s.status !== 'playing') n++; } return n; };
  const sk = slips(['Knife']), sf = slips(['Folding knife']);
  check('a folding knife slips more often', sf > sk, [sf, sk]);
  const clean = kit => { const s = base(kit); s.raw = [{ id: 'trout', por: 4 }]; const h0 = s.hours; E.act(s, 'clean', { extra: {} }); return { kcal: s.stores.reduce((a, x) => a + x.por * E.DATA.foods[x.id].kcal, 0), h: s.hours - h0 }; };
  const ck = clean(['Knife']), cm = clean(['Machete']), cf = clean(['Folding knife']);
  check('a folding knife cleans fish as well as a sheath knife', cf.kcal === ck.kcal && cf.h === ck.h, [cf, ck]);
  check('a machete is clumsy cleaning fish', cm.kcal < ck.kcal && cm.h > ck.h, [cm, ck]);
  const mk = base(['Machete']), kn = base(['Knife']);
  check('a machete gets more boughs off a tree', E.treeYield(mk, 'boughs', conifer).n > E.treeYield(kn, 'boughs', conifer).n, [E.treeYield(mk, 'boughs', conifer).n, E.treeYield(kn, 'boughs', conifer).n]);
  const b0 = mk.mats.boughs; E.act(mk, 'boughs'); const b1 = kn.mats.boughs; E.act(kn, 'boughs');
  check('and more in a session', mk.mats.boughs - b0 > kn.mats.boughs - b1, [mk.mats.boughs - b0, kn.mats.boughs - b1]);
  check('faster too', E.jobHours(mk, 'boughs') < E.jobHours(kn, 'boughs') && E.jobHours(mk, 'cut_poles') < E.jobHours(kn, 'cut_poles'));
  check('it cuts saplings clean where a knife only snaps them', E.treeYield(base(['Machete']), 'cut_poles', sapling).n > E.treeYield(base(['Knife']), 'cut_poles', sapling).n);
  check('but it does not fell a tree', !E.available(base(['Machete']), 'cut_logs').ok);
}
{ // axes
  const hat = base(['Hatchet']), axe = base(['Axe']), maul = base(['Splitting maul']);
  const why = E.available(hat, 'cut_logs');
  check('a hatchet cannot fell a tree for logs', !why.ok && /hatchet/i.test(why.why), why);
  check('nor can a maul', !E.available(maul, 'cut_logs').ok);
  check('and a tree offers them no logs', E.treeYield(hat, 'cut_logs', conifer).n === 0 && E.treeYield(maul, 'cut_logs', fallen).n === 0);
  check('the axe still fells', E.available(axe, 'cut_logs').ok && E.treeYield(axe, 'cut_logs', conifer).n === 4);
  check('a hatchet makes firewood faster', E.jobHours(hat, 'firewood') < E.jobHours(axe, 'firewood'), [E.jobHours(hat, 'firewood'), E.jobHours(axe, 'firewood')]);
  check('but gets less from a big log', E.treeYield(hat, 'firewood', fallen).n < E.treeYield(axe, 'firewood', fallen).n);
  check('a hatchet trims poles, quickly', E.treeYield(hat, 'cut_poles', sapling).n === E.treeYield(axe, 'cut_poles', sapling).n && E.jobHours(hat, 'cut_poles') < E.jobHours(axe, 'cut_poles'));
  const wood = s => { const f0 = s.firewood; E.act(s, 'firewood'); return s.firewood - f0; };
  const wm = wood(base(['Splitting maul'])), wa = wood(base(['Axe']));
  check('a maul splits more firewood in a session', wm > wa, [wm, wa]);
  check('in the same time', E.jobHours(maul, 'firewood') === E.jobHours(axe, 'firewood'));
  check('a maul cannot trim poles', E.treeYield(maul, 'cut_poles', sapling).n < E.treeYield(axe, 'cut_poles', sapling).n);
  check('every axe wears its edge and handle', (() => { const s = base(['Hatchet']); E.act(s, 'firewood'); return s.axeEdge < 1 && E.haftOf(s) < 1; })());
  check('the lost-axe tide does not take an axe you did not bring', !E.EVENTS.axetide.cond(Object.assign(base(['Hatchet']), { lastAction: 'stones' })));
  check('a hatchet and a saw still make logs', E.available(base(['Hatchet', 'Saw']), 'cut_logs').ok);
}
{ // saws
  const fs = base(['Folding saw']), saw = base(['Saw']);
  check('a folding saw bucks logs', E.available(fs, 'cut_logs').ok);
  check('slowly', E.jobHours(fs, 'cut_logs') > E.jobHours(saw, 'cut_logs') * 1.4, [E.jobHours(fs, 'cut_logs'), E.jobHours(saw, 'cut_logs')]);
  check('and fewer of them', E.treeYield(fs, 'cut_logs', conifer).n < E.treeYield(saw, 'cut_logs', conifer).n);
  const l0 = fs.mats.logs; E.act(fs, 'cut_logs'); const l1 = saw.mats.logs; E.act(saw, 'cut_logs');
  check('in a session too', fs.mats.logs - l0 < saw.mats.logs - l1, [fs.mats.logs - l0, saw.mats.logs - l1]);
  check('poles and firewood come as fast as with a saw', E.treeYield(fs, 'cut_poles', sapling).n === E.treeYield(saw, 'cut_poles', sapling).n && E.jobHours(fs, 'firewood') === E.jobHours(saw, 'firewood') && E.treeYield(fs, 'firewood', fallen).n === E.treeYield(saw, 'firewood', fallen).n);
}
{ // fishing
  const odds = (kit, water, day = 0) => { const s = base([kit]); s.day = day; s.mats.bait = 2; return E.fishOdds(s, water); };
  check('a tenkara rod fishes a river better', odds('Tenkara rod', 'river') > odds('Fishing gear', 'river'));
  check('and a pond', odds('Tenkara rod', 'pond') > odds('Fishing gear', 'pond'));
  const ds = base(['Tenkara rod']); ds.day = 60;
  check('but it cannot reach deep lake water', E.fishDepth(ds) === 'deep' && odds('Tenkara rod', 'lake', 60) < odds('Fishing gear', 'lake', 60) * 0.6);
  check('it casts short in the fishing game', E.castReach(base(['Tenkara rod'])) < 0.5 && E.castReach(base(['Fishing gear'])) === 1);
  check('it comes with a short line', base(['Tenkara rod']).line < E.C.line && base(['Tenkara rod']).hooks > 0 && E.hasRod(base(['Tenkara rod'])));
  check('a heavy handline gets down to deep fish', odds('Heavy handline', 'lake', 60) > odds('Fishing gear', 'lake', 60));
  check('but is clumsy in a stream', odds('Heavy handline', 'river') < odds('Fishing gear', 'river'));
  check('and comes with fewer hooks', base(['Heavy handline']).hooks < E.C.hooks && base(['Heavy handline']).line === E.C.line);
  check('bringing two kinds, you use the better one', odds('Fishing gear', 'river') <= (() => { const s = base(['Fishing gear', 'Heavy handline']); s.mats.bait = 2; return E.fishOdds(s, 'river'); })());
  const brk = kit => { let n = 0; for (let sd = 1; sd <= 300; sd++) { const s = base([kit], sd); s.hooks = 25; E.act(s, 'fish', { extra: { landed: 1.5, water: 'lake' } }); if (s.hooks < 25) n++; } return n; };
  const bt = brk('Tenkara rod'), bf = brk('Fishing gear'), bh = brk('Heavy handline');
  check('big fish break a tenkara line more often, and a heavy line less', bt > bf && bh < bf, [bt, bf, bh]);
}
{ // old saves and plain kits
  const s = base(['Bow and arrows', 'Knife', 'Axe', 'Saw', 'Fishing gear']); delete s.sys.woodPts; delete s.sys.bonePts;
  check('a save with no arrow points reads as plain arrows', E.pointBig(s) === 1);
  check('the plain kit is the plain kit', E.bowPower(s) === 1 && E.fineBlade(s) === 'knife' && E.castReach(s) === 1 && E.cutsFor(s, 'cut_logs') && E.jobHours(s, 'firewood') === E.ACTIONS.firewood.hours);
}
console.log(fails ? `${fails} kit tool check(s) failed, ${passes} passed.` : `All ${passes} kit tool checks passed.`); process.exitCode = fails ? 1 : 0;
