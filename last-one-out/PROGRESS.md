# Update progress

Where the realism update stands, phase by phase, following the update plan.
Each phase is committed and published on its own, so stopping between phases never loses work.

| Phase | What | Status |
|---|---|---|
| 0 | Safety checks (baseline, random play, screens, balance) | Done |
| 1 | Food that keeps: drying rack, smoker, fat rendering, pemmican, storage | Done |
| 1+ | Cooking risks (raw meat and fish, worms), drying rack on the map, drop sites ordered by difficulty | Done |
| 2 | Fire and stoves: damp tinder, stone hearth, flue soot and chimney fires, smoker flare-ups, chinking walls | Done |
| 3 | Materials and tools: dull axes cost effort and cause injuries, honing on river stones, axe heads working loose and refitting with rawhide, bursting hearth stones, clay temper | Done (part) |
| 3 later | Fibre and cordage strength, bark girdling, salvage contamination, carpentry joints, stone grades | Left for later |
| 4 | Light and cooking: night work needs a fire or a lamp, fat lamp burning tallow, bone broth simmered overnight | Done |
| 5 | Water, hygiene and waste: tainted salvaged cans (boiling does not help, scrubbing does), hands after butchery (soap vs cold water), gut piles drawing raiders and flies, burying them. Wound dressing was already realistic | Done |
| 6 (early) | Bough bed pulled forward from Phase 6 | Done |
| 6 | Shelters, cabins, camp layout, bridges, rafts, snowshoes, sleep | Next |
| 7 | Pottery and kiln firing | Not started |
| 8 | Weapons, arrows, tackle, traps, fishing, ice fishing, hunting, tracking, weather, navigation, climbing, swimming, ice safety, wildlife, predators, stealth, scent, trail marking | Not started |
| 9 | Textiles, clothing repair, hides, ecology and regrowth, farming, trading, social, mental strain | Not started |

Not built from the plan's architecture: a general job scheduler, typed material lots in kilograms, and action receipts.
Each system is built directly on the game's existing rules instead, which keeps saves and balance safe.

## Rules every phase follows

- `tests/run-all.sh` must pass before anything is published.
- Bot survival (median and mean over 1,020 games) must stay within 5% of the original game: median 49, mean 49.9 days.
- Standing after Phase 5: median 48 (-2.0%), mean 47.8 (-4.2%). Later phases need to add realistic advantages as well as hazards to stay inside the limit.
- Saves from older versions must keep loading.
