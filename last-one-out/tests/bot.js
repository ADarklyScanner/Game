// A simple, deterministic player: keeps a fire, builds shelter, gathers food. Same seed in, same game out.
function makeBot(E, s, opts = {}) {
  const skip = new Set(opts.skip || []);
  const ok = id => !skip.has(id) && E.available(s, id).ok;
  const policy = () => {
    if (!s.shelterGoal || s.shelterGoal === s.shelterType) { const o = E.shelterOptions(s); if (o.length) E.chooseShelter(s, o[o.length - 1]); }
    const pri = [];
    if (E.season(s).climate.water === 'scarce' && (s.water || 0) < 2) pri.push('water'); /* out where water is scarce: haul more before it runs out, as the game warns you to */
    if ((s.sys && s.sys.axeOff) || (E.haftOf ? E.haftOf(s) : 1) < 0.35) pri.push('fix_axe');
    if (s.axeEdge < 0.5) pri.push('sharpen');
    if (((s.bagHoles || 0) > 0 || (E.clothesOf ? E.clothesOf(s) : 1) < 0.6) && s.phase >= 2) pri.push('mend');
    if (s.mats.tinder < 2) pri.push('tinder'); // keep something to light a fire with
    if (!s.fire) pri.push('light_fire');
    if (s.firewood < 6) pri.push('firewood');
    if (s.shelterLvl < 3) pri.push('shelter', 'cut_poles', 'boughs', 'cut_logs', 'moss', 'bark');
    if (s.carcass) pri.push('dress');
    if (s.raw.length) pri.push('clean', 'cook', 'smoke');
    if (s.sys && s.sys.offal >= 1) pri.push('bury');
    if (s.sys && s.sys.taint > 0) pri.push('scrub');
    // build each camp item once when it becomes possible, then use it
    for (const c of ['craft_reflector', 'craft_platform', 'craft_hearth', ...(s.crafts.smoker >= 2 ? [] : ['craft_rack']), 'craft_smoker', 'craft_cache', 'craft_handline', 'craft_hooks', 'craft_fishtrap', 'craft_woodshed', 'craft_net', 'craft_stove', 'craft_snowshoes', 'craft_mittens']) if (s.day > 3) pri.push(c); // the engine says 'Built' once a craft is finished
    // preserve only a real surplus: a few portions of fresh meat beyond what spoils first
    const fresh = s.stores.filter(x => !x.smoked && !x.dried && !x.where && ['fish', 'game', 'organ'].includes(E.DATA.foods[x.id].kind)).reduce((a, x) => a + x.por, 0);
    if (fresh >= 3) pri.push(s.crafts.smoker >= 2 ? 'smoke' : 'dry_food'); // one station at a time: the smoker once it is built, the rack until then
    if (s.stores.filter(x => x.where === 'smoker').reduce((a, x) => a + x.por, 0) >= 2) pri.push('smoke'); // tend it
    if (s.stores.some(x => x.id === 'fat' && !x.rendered)) pri.push('render_fat');
    if ((s.sys && s.sys.snowLoad) > 1.5) pri.unshift('clear_roof');
    if (s.sys && s.sys.gaps) pri.push('caulk');
    if (s.shelterLvl >= 1 && (E.bedOf ? E.bedOf(s) : 1) < 0.3) pri.push('bed', 'boughs');
    if (s.shelterLvl >= 2 && (E.sealOf ? E.sealOf(s) : 1) < 0.4) pri.push('caulk'); // re-chink when the seal is poor, not at every crack
    if (s.sys && s.sys.soot > 0.5) pri.push('check_roof');
    if (s.crafts.hearth !== 1 && s.mats.stone < 6 && s.day > 3) pri.push('stones');
    pri.push('craft_pemmican', 'cordage', 'checknet', 'setnet', 'checktraps', 'fish', ...(E.available(s, 'snares').ok && E.ACTIONS.scout && !(s.sys && s.sys.scoutDay === s.day) ? ['scout'] : []), 'snares', 'setlines', 'berries', 'shellfish', ...(E.ACTIONS.inspect && !(s.sys && s.sys.inspectDay === s.day) && (E.available(s, 'roots').ok || E.available(s, 'greens').ok) ? ['inspect'] : []), 'roots', 'greens', 'forage', 'cattail', 'hunt', 'boil', 'water');
    for (const p of pri) { if (s.today.done.filter(x => x === p).length >= 2) continue; if (ok(p)) return p; }
    return null;
  };
  policy.event = x => x.event && x.event.id === 'strangeberries' ? Math.max(0, x.event.optIds.indexOf(2)) : 0; // a sensible player leaves berries they do not know
  return policy;
}
// the food-preservation actions; 'core' baseline games never use them
const PRESERVE = ['smoke', 'craft_smoker', 'craft_pemmican', 'dry_food', 'craft_rack', 'render_fat'];
module.exports = { makeBot, PRESERVE };
