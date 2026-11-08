// Plants and forage: real species by place, what the season does to them, each root's own look-alike, the yew, mussels after a red tide.  node plants.js
const { loadGame } = require('./load-game'); const E = loadGame(process.env.GAME_FILE || undefined);
let fails = 0, passes = 0; const check = (name, ok, detail) => { if (ok) passes++; else { fails++; console.log('FAIL', name, detail ?? ''); } };
const GEAR = ['Axe', 'Ferro rod', 'Knife', 'Sleeping bag', 'Fishing gear', 'Pot', 'Shovel'];
function camp(place = 'US-S6', seed = 3, gear = GEAR) { const s = E.newGame(place, gear, { seed, weight: 200 }); E.beginDay(s); s.event = null; s.storm = s.rain = s.fog = s.wind = s.snowfall = false; s.stores = []; s.firewood = 20; s.hours = 1; s.phase = 0; return s; }
const at = (s, day) => { s.day = day; s.hours = 1; s.phase = 0; s.event = null; s.storm = s.rain = s.fog = s.wind = s.snowfall = false; s.coldSnap = 0; s.today = { done: [], lines: [] }; return s; };
const rate = (n, f) => { let k = 0; for (let i = 0; i < n; i++) if (f(i)) k++; return k / n; };
const last = s => s.stores[s.stores.length - 1];
const names = (place, id) => (E.speciesList(camp(place), id) || []).map(x => x.n);

{ // each place grows its own species
  check('BC coast berries are salal and huckleberries', names('US-S1', 'berries').includes('Salal') && names('US-S1', 'berries').includes('Red huckleberry'), names('US-S1', 'berries'));
  check('the boreal shield has lingonberries and blueberries', names('US-S6', 'berries').includes('Lingonberries') && names('US-S6', 'berries').includes('Blueberries'));
  check('the arctic delta has cloudberries and crowberries', names('US-S11', 'berries').includes('Cloudberries') && names('US-S11', 'berries').includes('Crowberries'));
  check('the Karoo has sour figs, not blueberries', names('US-S12', 'berries').includes('Sour figs') && !names('US-S12', 'berries').includes('Blueberries'));
  check('Interior BC roots include wild onion and biscuitroot', names('US-S8', 'roots').includes('Nodding onion') && names('US-S8', 'roots').includes('Biscuitroot'));
  check('every place has berries, greens and roots named', ['US-S1', 'US-S2', 'US-S3', 'US-S5', 'US-S6', 'US-S8', 'US-S9', 'US-S11', 'US-S12', 'AU-S1', 'AU-S2', 'AU-S3', 'AU-S4'].every(p => ['berries', 'greens', 'roots'].every(id => names(p, id).length)));
  let found = new Set(); for (let i = 0; i < 40; i++) { const s = camp('US-S8', 10 + i); at(s, 6); E.act(s, 'roots'); const x = s.stores.find(y => y.id === 'roots'); if (x) found.add(x.sp); }
  check('digging roots brings home a named species', found.size >= 2 && [...found].every(n => names('US-S8', 'roots').includes(n)), [...found]);
  const s = camp('US-S8', 4); at(s, 6); const L = E.act(s, 'roots'); check('the log names it, and the field notes take it', L.some(l => /Gathered (nodding onion|biscuitroot|spring beauty)/i.test(l[0])) && Object.keys(s.sys.known || {}).some(k => k.startsWith('plant:')), L.map(l => l[0]));
}
{ // each species has its own nutrition
  const one = (ing, id = 'berries') => { const s = camp(); s.fire = true; s.cook = 'roast'; s.stores = [{ id, por: 2, left: 5, ing }]; return E.eat(s, 999).units; };
  const plain = one(undefined), two = one(['fruit', 'fruit']);
  check('a vitamin-C-rich berry counts for more vitamin C', (two['Vitamin C'] || 0) > (plain['Vitamin C'] || 0) * 1.5, [plain, two]);
  const k = one(['seaweed', 'seaweed'], 'seaweed'), d = one(['seaweed', 'vegetable'], 'seaweed'); check('kelp has more iodine, dulse brings potassium', k.Iodine > d.Iodine && (d.Potassium || 0) > (k.Potassium || 0), [k, d]);
}
{ // berries: ripe, overripe, frozen on the bush
  const s = camp('US-S3', 5); const b = s.berrySeason; const sp = E.speciesList(s, 'berries');
  const ripe = E.plantStage(at(s, Math.round(b.start + b.span * 0.5)), 'berries', 0.5, sp[0]); check('a bush at its peak is ripe', ripe.key === 'ripe', ripe);
  const over = E.plantStage(at(s, Math.round(b.start + b.span * 0.5 + b.hold * 0.8)), 'berries', 0.5, sp[0]); check('weeks later it is overripe and keeps two days', over.key === 'overripe' && over.keep === 2 && over.mult < 1, over);
  const c6 = camp('US-S6', 5); const fz = E.plantStage(at(c6, E.season(c6).climate.snow - 5), 'berries', 0.9, E.speciesList(c6, 'berries').find(x => x.holds)); check('after the first frost they are frozen on the bush', fz.key === 'frozen', fz);
  check('lingonberries and the like hold up frozen and taste sweeter', fz.mult === 1 && fz.morale > 0, fz); const fz2 = E.plantStage(c6, 'berries', 0.9, E.speciesList(c6, 'berries').find(x => !x.holds)); check('soft berries go to mush frozen', fz2.mult < 1, fz2);
}
{ // greens: young, tough, bitter after frost
  const warm = camp('AU-S1'); const t = E.temperature(at(warm, 1)); const g = E.plantStage(warm, 'greens'); check('greens in a warm start are young', t >= 12 ? g.key === 'young' : g.key === 'tough', [t, g]);
  const s = camp('US-S6'); const snow = E.season(s).climate.snow; check('mid-autumn they are tough', E.plantStage(at(s, 4), 'greens').key === 'tough');
  const b = E.plantStage(at(s, snow - 10), 'greens'); check('after frost they are bitter, and you get less', b.key === 'bitter' && b.mult < 1 && b.morale < 0, b);
}
{ // nettle, cattail, rose hips
  const s = camp('US-S6'); const snow = E.season(s).climate.snow;
  check('old nettle: only the tops are worth it', E.plantStage(at(s, snow - 10), 'nettle').key === 'old' && E.plantStage(s, 'nettle').mult === 0.5);
  check('cattail in the cold is dug for the rhizome', E.plantStage(at(s, 20), 'cattail').key === 'rhizome');
  const k = camp('US-S12'); at(k, 1); check('in the Karoo heat the cattail heads are in pollen', E.plantStage(k, 'cattail').key === 'pollen', E.temperature(k));
  k.gear = k.gear.filter(g => g !== 'Shovel'); check('pollen needs no digging tool', E.available(k, 'cattail').ok || !/shovel/i.test(E.available(k, 'cattail').why || ''), E.available(k, 'cattail'));
  const pa = camp('US-S3'); check('rose hips before frost are firm', E.plantStage(at(pa, 14), 'rosehips').key === 'firm');
  const rh = E.plantStage(at(pa, E.season(pa).climate.snow - 5), 'rosehips'); check('after frost they are sweeter', rh.key === 'frosted' && rh.morale > 0, rh);
}
{ // mushrooms: fresh, old or wormy
  const seen = {}; for (let i = 0; i < 300; i++) { const s = camp('US-S6', 100 + i); at(s, 5); const st = E.plantStage(s, 'mushrooms', i / 300); seen[st.key] = (seen[st.key] || 0) + 1; }
  check('mostly fresh, some old, a few wormy', seen.fresh > 150 && seen.old > 20 && seen.wormy > 5, seen);
}
{ // insects by warmth
  const cold = camp('US-S6'); at(cold, 25); const hot = camp('US-S12'); at(hot, 1);
  check('in the cold only grubs', E.speciesList(cold, 'insects').map(x => x.n).join() === 'Beetle grubs', E.speciesList(cold, 'insects'));
  check('in the heat, grasshoppers too', E.speciesList(hot, 'insects').some(x => x.n === 'Grasshoppers'));
}
{ // look-alikes: each root its own, named when it makes you sick
  let got = null; for (let i = 0; i < 4000 && !got; i++) { const s = camp('US-S8', 500 + i); at(s, 6); E.act(s, 'roots'); const x = s.stores.find(y => y.tox); if (x) got = x; }
  check('a wrong root names its look-alike', got && got.alike && /^(Death camas|Water hemlock)/.test(got.look), got);
  const s = camp('US-S8'); s.fire = true; s.stores = [{ id: 'roots', por: 1, left: 5, sp: 'Nodding onion', tox: true, look: 'Death camas: no onion smell when you crushed it', alike: 'Death camas', severe: true }]; s.event = null;
  const L = E.endDay(s); const c = s.conditions.find(c => /look-alike/.test(c.name));
  check('death camas is a severe poisoning', c && c.dmg >= 6, c);
  check('and the log says what it really was', JSON.stringify(L).includes('death camas') || JSON.stringify(s.log || '').includes('death camas'), L);
  const wrong = rate(3000, i => { const t = camp('US-S8', 100 + i); at(t, 6); E.act(t, 'roots'); return t.stores.some(x => x.tox); });
  check('look-alikes still about 3% of rushed digs', wrong > 0.015 && wrong < 0.045, wrong);
}
{ // needle tea: the trees of the place, and the yew in BC
  const brew = (place, seed) => { const s = camp(place, seed); at(s, 4); s.fire = true; s.potWater = 3; s.mats.boughs = 3; s.teaToday = false; E.act(s, 'needle_tea'); return s.stores.find(x => x.id === 'needletea'); };
  const t = brew('US-S5', 1); check('taiga tea comes from Siberian conifers or Scots pine', t && /Scots pine|Siberian/.test(t.sp), t);
  const yewBC = rate(2000, i => !!(brew('US-S1', 1000 + i) || {}).tox); const yewNo = rate(2000, i => !!(brew('US-S6', 1000 + i) || {}).tox);
  check('in BC a yew bough sometimes ends up in the pot', yewBC > 0.01 && yewBC < 0.05, yewBC); check('there is no yew on the shield', yewNo === 0, yewNo);
}
{ // red tide: mussels hold it a few days after the water clears
  const s = camp('US-S2', 7); const w = s.windows.find(x => x.id === 'redtide'); check('the coast has a red tide window', !!w);
  if (w) { let tox = 0, mus = 0, other = 0; for (let i = 0; i < 400; i++) { const t = camp('US-S2', 7); t.day = w.to + 2; t.phase = 0; t.hours = 1 + (i % 40) * 0.25; t.event = null; t.storm = false; t.today = { done: [], lines: [] }; if (t.day % 2) t.day++; if (t.day > w.to + 4) continue; E.act(t, 'shellfish'); const x = t.stores.find(y => y.id === 'shellfish'); if (!x) continue; if (/mussel/i.test(x.sp)) { mus++; if (x.tox) tox++; } else if (x.tox) other++; }
    check('mussels just after a red tide are often still poison', mus > 5 && tox / mus > 0.25, [mus, tox]); check('clams and limpets are not', other === 0, other);
    const t = camp('US-S2', 7); t.day = (w.to + 1) % 2 ? w.to + 2 : w.to + 1; t.hours = 1; t.storm = false; check('the job list warns about mussels', /mussels/.test(E.available(t, 'shellfish').odds || E.available(t, 'shellfish').why || ''), E.available(t, 'shellfish')); }
}
console.log(fails ? `${fails} of ${fails + passes} plant checks FAILED.` : `All ${passes} plant checks passed.`); process.exit(fails ? 1 : 0);
