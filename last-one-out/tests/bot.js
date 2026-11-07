// A simple, deterministic player: keeps a fire, builds shelter, gathers food. Same seed in, same game out.
function makeBot(E, s, opts = {}) {
  const skip = new Set(opts.skip || []);
  const ok = id => !skip.has(id) && E.available(s, id).ok;
  /* the browser game puts animals on the map (about 1.4 small ones per square, more in good weather and good habitat) and the player shoots
     at one they can see. The bot copies that once a day: walk about 1.5 km; see something with the same odds the map would give; shoot
     with a typical player's aim. Its own dice, so the game's luck is not disturbed. */
  let bdice = (s.seed * 2654435761) >>> 0; const brnd = () => { bdice = (bdice * 1103515245 + 12345) >>> 0; return bdice / 4294967296; };
  const stalk = () => {
    if (opts.noStalk || s.today.done.includes('hunt') || s.today.stalked === s.day || !ok('hunt') || s.phase > 2) return null;
    s.today.stalked = s.day; const se = E.season(s); if (!se.pools.hunt.length) return null;
    const win = k => !!(E.windowOn && E.windowOn(s, k)); const dayF = Math.min(2.2, se.mult.hunt) * (E.stockOf ? E.stockOf(s, 'game') : 1) * (s.storm ? 0.3 : s.fog ? 0.7 : 1) * (E.status(s).snowy ? 0.8 : 1) * (E.timeMult ? E.timeMult(s, 'game') : 1) * (win('rut') || win('migration') ? 1.5 : 1);
    const cells = 1.5; const big = se.big.length && (E.hasBow ? E.hasBow(s) : s.gear.includes('Bow and arrows')) && brnd() < 1 - Math.exp(-0.05 * Math.min(2, se.mult.hunt) * (win('rut') ? 4 : 1) * cells * 0.5);
    const seen = big || brnd() < 1 - Math.exp(-1.4 * dayF * cells * 0.5); /* about half of what the map holds shows itself to someone walking through */
    if (!seen) { E.travel(s, 1500); return null; } /* walked the ridges and saw nothing: the walk is the cost */
    const pool = big ? se.big.map(id => [id, 1]) : se.pools.hunt; const tot = pool.reduce((a, [, w]) => a + w, 0); let r = brnd() * tot, target = pool[0][0]; for (const [id, w] of pool) { r -= w; if (r <= 0) { target = id; break; } }
    const q = brnd(); const hit = q < 0.35 ? 'good' : q < 0.75 ? 'poor' : 'miss'; const sc = brnd(); const scent = sc < 0.25 ? 'down' : sc < 0.5 ? 'up' : 'cross';
    return { id: 'hunt', metres: 1500, extra: { target, hit, scent, size: 0.8 + brnd() * 0.5 } };
  };
  const policy = () => {
    /* a big animal dressed out there: walk the meat home a load at a time while there is light */
    while (E.carryLoad && s.carcass && s.carcass.dressed && s.phase >= 0 && s.phase < 2 && (s.today.loads || 0) < 5) { E.travel(s, 3000); if (s.phase >= 2 || s.status !== 'playing') break; E.carryLoad(s); s.today.loads = (s.today.loads || 0) + 1; } /* about five loads is a day's packing */
    /* aim for the best shelter the tools on hand can build: a cabin needs an axe or saw; without one, a debris hut or a lean-to */
    /* first a roof that needs no tools (a quick one, then the best), and only then a cabin, which needs an axe or saw and weeks of logs */
    { const can = k => E.SHELTERS[k].bill.tool !== 'cutter' || E.cutter(s); const o = E.shelterOptions(s).filter(can); const noTool = o.filter(k => E.SHELTERS[k].bill.tool !== 'cutter');
      const want = !s.shelterType && noTool.length ? noTool[noTool.length - 1] : o[o.length - 1];
      if (want && (!s.shelterGoal || s.shelterGoal === s.shelterType || !can(s.shelterGoal) || (!s.shelterType && s.shelterGoal !== want && !(s.shelterWork > 0)))) E.chooseShelter(s, want); }
    const pri = [];
    if (E.season(s).climate.water === 'scarce' && (s.water || 0) < 3) pri.push('dew'); /* first light in dry country: wring the dew out of the grass */
    if (E.season(s).climate.water === 'scarce' && (s.water || 0) < 2) pri.push('water');
    pri.push('catch_rain'); /* rain and a tarp: fill the pots while it falls (offered only then) */ /* out where water is scarce: haul more before it runs out, as the game warns you to */
    if ((s.sys && s.sys.axeOff) || (E.haftOf ? E.haftOf(s) : 1) < 0.35) pri.push('fix_axe');
    if (s.axeEdge < 0.5) pri.push('sharpen');
    if (((s.bagHoles || 0) > 0 || (E.clothesOf ? E.clothesOf(s) : 1) < 0.6) && s.phase >= 2) pri.push('mend');
    pri.push('ice_hole'); if (/stone or a stout pole/.test(E.available(s, 'ice_hole').why || '')) pri.push('stones', 'cut_poles'); /* frozen water and no axe or saw: break a hole by hand to drink (offered only then) */
    if (s.mats.tinder < 2) pri.push('tinder'); // keep something to light a fire with
    /* no ferro rod: make a bow drill, and a stone blade to make it with if there is no knife or axe */
    if (!s.gear.includes('Ferro rod') && !(s.crafts.bowdrill >= 1)) { pri.push('craft_bowdrill'); if (!E.blade(s) && !E.chopper(s)) pri.push('craft_stoneblade', 'stones'); if (s.mats.cordage < 1) pri.push('cordage', 'bark'); }
    else if (!E.blade(s) && s.day > 1) pri.push('craft_stoneblade', ...(s.day < 15 ? ['stones'] : [])); /* a knife of some kind carves hooks, cleans fish and makes a handline: knap one from flint when it turns up */
    if (!s.fire) pri.push('light_fire');
    if (!E.hasRod(s) && !(s.crafts.handline >= 1) && s.day > 1) { pri.push('craft_handline'); if (s.mats.cordage < 3) pri.push('cordage', 'bark'); } /* no tackle: twist a handline early, food comes first */
    if (s.firewood < 6) pri.push('firewood');
    if (s.shelterLvl < 3) { pri.push('shelter'); const miss = (E.shelterMissing(s) || []).join(' '); const need = { stone: ['stones'], cordage: ['cordage', 'bark'], pole: ['cut_poles'], bough: ['boughs'], log: ['cut_logs'], moss: ['moss'], bark: ['bark'] }; for (const [w, acts] of Object.entries(need)) if (miss.includes(w)) pri.push(...acts); } /* gather what the chosen shelter still needs */
    if (s.carcass) pri.push('dress');
    if (s.raw.length) pri.push('clean', 'cook');
    if (s.sys && s.sys.offal >= 1) pri.push('bury');
    if (s.sys && s.sys.taint > 0) pri.push('scrub');
    // preserve only a real surplus: fresh meat and fish that will turn before it can be eaten (worked out here, so the bot plays the same on any version)
    const kc = id => E.DATA.foods[id].kcal; const freshList = s.stores.filter(x => !x.smoked && !x.dried && !x.where && ['fish', 'game', 'organ'].includes(E.DATA.foods[x.id].kind)).sort((a, b) => a.left - b.left);
    let eaten = s.stores.filter(x => !freshList.includes(x) && !x.where && x.left < 6).reduce((a, x) => a + x.por * kc(x.id), 0), spare = 0; const perDay = 2600 * ({ full: 1, moderate: 0.7, lean: 0.4 }[s.ration] || 1);
    for (const x of freshList) { const k = x.por * kc(x.id); const keep = Math.min(k, Math.max(0, (x.left + 0.5) * perDay - eaten)); eaten += keep; spare += (k - keep) / kc(x.id); }
    const keepWant = spare >= 2 || !!(s.carcass && s.carcass.big) || s.stores.some(x => x.where); /* a rack or smoker is worth its poles once there is meat to spare */
    // build each camp item once when it becomes possible, then use it
    for (const c of ['craft_reflector', 'craft_platform', 'craft_hearth', ...(keepWant ? [...(s.crafts.smoker >= 2 ? [] : ['craft_rack']), 'craft_smoker'] : []), 'craft_cache', 'craft_handline', 'craft_hooks', 'craft_fishtrap', 'craft_woodshed', 'craft_net', 'craft_stove', 'craft_snowshoes', 'craft_mittens']) if (s.day > 3) pri.push(c); // the engine says 'Built' once a craft is finished
    /* gather what the camp items still lack (poles for the rack and smoker, boughs for the woodshed...) */
    if (s.day > 3) { const want = new Set(); for (const c of ['craft_platform', ...(keepWant ? ['craft_rack', 'craft_smoker'] : []), 'craft_fishtrap', 'craft_woodshed']) { const w = E.available(s, c).why || ''; if (/^Needs/.test(w)) for (const [k, acts] of [['pole', ['cut_poles']], ['bough', ['boughs']], ['log', ['cut_logs']], ['moss', ['moss']], ['cordage', ['cordage', 'bark']], ['stone', ['stones']], ['bark', ['bark']]]) if (w.includes(k)) acts.forEach(x => want.add(x)); } pri.push(...want); }
    if (spare >= 2) pri.push(s.crafts.smoker >= 2 ? 'smoke' : 'dry_food'); // one station at a time: the smoker once it is built, the rack until then
    if (s.stores.filter(x => x.where === 'smoker').reduce((a, x) => a + x.por, 0) >= 2) pri.push('smoke'); // tend it
    if (s.stores.some(x => x.id === 'fat' && !x.rendered)) pri.push('render_fat');
    if ((s.sys && s.sys.snowLoad) > 1.5) pri.unshift('clear_roof');
    if (s.sys && s.sys.gaps) pri.push('caulk');
    if (s.shelterLvl >= 1 && (E.bedOf ? E.bedOf(s) : 1) < 0.3) pri.push('bed', 'boughs');
    if (E.ACTIONS.air_bed && E.available(s, 'air_bed').ok && E.bedDampOf(s) >= 0.35) pri.push('air_bed'); /* damp bedding is no bedding */
    if (s.shelterLvl >= 2 && (E.sealOf ? E.sealOf(s) : 1) < 0.4) pri.push('caulk'); // re-chink when the seal is poor, not at every crack
    if (s.sys && s.sys.soot > 0.5) pri.push('check_roof');
    if (s.crafts.hearth !== 1 && s.mats.stone < 6 && s.day > 3) pri.push('stones');
    const handsBusy = s.today.done.some(x => ['whittle', 'cook', 'tend_fire', 'needle_tea', 'bone_broth', 'cordage'].includes(x));
    pri.push('craft_pemmican', 'cordage', ...(s.day > 3 && s.mats.cordage < 4 && s.mats.bark < 3 ? ['bark'] : []), /* keep a few lengths of cord for set lines and mending */ ...(handsBusy ? [] : ['whittle']), /* an hour by the fire with the hands busy keeps the doubts away */ ...(s.net && s.net.catch.length && !s.today.done.includes('checknet') ? ['checknet'] : []), 'setnet', /* lift the net once, when the floats show something in it */ 'checktraps', 'stalk', 'fish', /* with a bow or slingshot, after the trapline and the fishing: walk out looking for something to shoot, as a player does on the map */ ...(E.available(s, 'snares').ok && E.ACTIONS.scout && !(s.sys && s.sys.scoutDay === s.day) ? ['scout'] : []), 'snares', 'setlines', 'berries', 'shellfish', ...(E.ACTIONS.inspect && !(s.sys && s.sys.inspectDay === s.day) && (E.available(s, 'roots').ok || E.available(s, 'greens').ok) ? ['inspect'] : []), 'roots', 'greens', 'forage', 'cattail', 'hunt', 'boil', 'water');
    for (const p of pri) {
      if (p === 'stalk') { const st = stalk(); if (st) return st; continue; }
      if (s.today.done.filter(x => x === p).length >= 2) continue; if (ok(p)) return p; }
    return null;
  };
  policy.event = x => x.event && x.event.id === 'strangeberries' ? Math.max(0, x.event.optIds.indexOf(2)) : 0; // a sensible player leaves berries they do not know
  return policy;
}
// the food-preservation actions; 'core' baseline games never use them
const PRESERVE = ['smoke', 'craft_smoker', 'craft_pemmican', 'dry_food', 'craft_rack', 'render_fat'];
module.exports = { makeBot, PRESERVE };
