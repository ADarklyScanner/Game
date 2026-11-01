// A simple, deterministic player: keeps a fire, builds shelter, gathers food. Same seed in, same game out.
function makeBot(E, s, opts = {}) {
  const skip = new Set(opts.skip || []);
  const ok = id => !skip.has(id) && E.available(s, id).ok;
  const policy = () => {
    if (!s.shelterGoal || s.shelterGoal === s.shelterType) { const o = E.shelterOptions(s); if (o.length) E.chooseShelter(s, o[o.length - 1]); }
    const pri = [];
    if (!s.fire) pri.push('light_fire');
    if (s.firewood < 6) pri.push('firewood');
    if (s.shelterLvl < 3) pri.push('shelter', 'cut_poles', 'boughs', 'cut_logs', 'moss', 'bark');
    if (s.carcass) pri.push('dress');
    if (s.raw.length) pri.push('clean', 'cook', 'smoke');
    // build each camp item once when it becomes possible, then use it
    for (const c of ['craft_smoker', 'craft_cache', 'craft_handline', 'craft_hooks', 'craft_fishtrap', 'craft_woodshed', 'craft_net', 'craft_stove', 'craft_snowshoes', 'craft_mittens']) if (s.day > 3) pri.push(c); // the engine says 'Built' once a craft is finished
    if (s.stores.some(x => !x.smoked && ['fish', 'game', 'organ'].includes(E.DATA.foods[x.id].kind))) pri.push('smoke');
    pri.push('craft_pemmican', 'cordage', 'checknet', 'setnet', 'checktraps', 'fish', 'snares', 'setlines', 'berries', 'shellfish', 'roots', 'greens', 'forage', 'cattail', 'hunt', 'boil', 'water');
    for (const p of pri) { if (s.today.done.filter(x => x === p).length >= 2) continue; if (ok(p)) return p; }
    return null;
  };
  policy.event = () => 0;
  return policy;
}
module.exports = { makeBot };
