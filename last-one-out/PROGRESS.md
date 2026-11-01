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
| 3 later (a) | Cordage from frozen dry bark is brittle (35% less) unless soaked; salvage contamination done in Phase 5 | Done |
| 3 later (b) | Bark girdling, carpentry joints, stone grades (no knapping in the game yet) | Not started |
| 4 | Light and cooking: night work needs a fire or a lamp, fat lamp burning tallow, bone broth simmered overnight | Done |
| 5 | Water, hygiene and waste: tainted salvaged cans (boiling does not help, scrubbing does), hands after butchery (soap vs cold water), gut piles drawing raiders and flies, burying them. Wound dressing was already realistic | Done |
| 6 (early) | Bough bed pulled forward from Phase 6 | Done |
| 6 | Shelters and sleep: snow load on roofs (shallow roofs suffer, a snow blanket insulates), clearing the roof, fire reflector, raised bed frame, cabin logs shrinking after four weeks, snowshoes in deep snow | Done |
| 6 later (a) | Wading the ford: wet to the knees, an occasional slip into the river; a wading staff cuts slips by 80%; the log bridge keeps you dry | Done |
| 6 later (b) | Rafts (nothing to raft to), camp layout zones such as a latrine (the game has none) | Not started |
| 7 | Pottery: shape with or without grit, dry for days (rain undoes it, fast drying cracks plain clay), pit-fire (damp pots burst); a fired clay pot boils, stews and carries water like a small pot and cracks now and then | Done |
| 8 | Reading the land: catches left in snares lost to scavengers (15% a night), reading the sky for tomorrow's weather (65% to 85% with practice), smoking clothes to mask scent for hunting, thin new ice, looking for game sign so snares on real runs catch 50% more | Done (part) |
| 8 later (a) | Fine sinew leader for handlines (+30% bites in clear water), ice holes freezing over and set lines freezing in, fresh snow and rain covering blood trails, arrows heat-straightened or crooked (up to 30% fewer hits). Downwind hunting was already in the hunting mini-game | Done |
| 8 later (b) | Navigation and landmarks, climbing, bear spray, noise, cairns. Bow tillering needs a craftable bow | Not started |
| 9 | Clothes wear from work and storms and let the cold in; mending with a bone needle restores 90% of the lost warmth and patches sleeping-bag holes (which were permanent); tea by the fire lifts spirits | Done (part) |
| 9 later (a) | Scrape and soften hides into leather: leather patches make clothes as good as new, leather mittens are warmer. Patch regrowth already exists in the game | Done |
| 9 later (b) | Textiles and weaving, farming. Trading and social contact are on hold: the plan gates them behind a review, since they clash with a solo survival game | Left for later |

Not built from the plan's architecture: a general job scheduler, typed material lots in kilograms, and action receipts.
Each system is built directly on the game's existing rules instead, which keeps saves and balance safe.

## Rules every phase follows

- `tests/run-all.sh` must pass before anything is published.
- Bot survival (median and mean over 1,020 games) must stay within 5% of the original game: median 49, mean 49.9 days.
- Standing after Phase 9: median 48 (-2.0%), mean 48.1 (-3.6%). Later phases need to add realistic advantages as well as hazards to stay inside the limit.
- Saves from older versions must keep loading.
