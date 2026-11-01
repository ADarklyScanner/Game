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
| 3 later (b) | Glassy stone among gathered stones, knapping a stone blade (shatters on hidden flaws, snaps with use, works as a knife); cabin joints: sloppy notches leave loose joints that wear up to twice as fast | Done |
| 4 | Light and cooking: night work needs a fire or a lamp, fat lamp burning tallow, bone broth simmered overnight | Done |
| 5 | Water, hygiene and waste: tainted salvaged cans (boiling does not help, scrubbing does), hands after butchery (soap vs cold water), gut piles drawing raiders and flies, burying them. Wound dressing was already realistic | Done |
| 6 (early) | Bough bed pulled forward from Phase 6 | Done |
| 6 | Shelters and sleep: snow load on roofs (shallow roofs suffer, a snow blanket insulates), clearing the roof, fire reflector, raised bed frame, cabin logs shrinking after four weeks, snowshoes in deep snow | Done |
| 6 later (a) | Wading the ford: wet to the knees, an occasional slip into the river; a wading staff cuts slips by 80%; the log bridge keeps you dry | Done |
| 6 later (b) | Raft: two sessions, fish deeper water (+30%), can capsize in wind, waterlogs 5% a day in the water and dries on shore | Done |
| 6 later (c) | A latrine: without one the camp slowly fouls the ground and water and raises the giardia risk; dug, it clears; it lasts a month | Done |
| 7 | Pottery: shape with or without grit, dry for days (rain undoes it, fast drying cracks plain clay), pit-fire (damp pots burst); a fired clay pot boils, stews and carries water like a small pot and cracks now and then | Done |
| 8 | Reading the land: catches left in snares lost to scavengers (15% a night), reading the sky for tomorrow's weather (65% to 85% with practice), smoking clothes to mask scent for hunting, thin new ice, looking for game sign so snares on real runs catch 50% more | Done (part) |
| 8 later (a) | Fine sinew leader for handlines (+30% bites in clear water), ice holes freezing over and set lines freezing in, fresh snow and rain covering blood trails, arrows heat-straightened or crooked (up to 30% fewer hits). Downwind hunting was already in the hunting mini-game | Done |
| 8 later (b) | Carve your own bow (two sessions, can come out uneven and lose a quarter of its cast, re-tiller to fix); five named landmarks per map, drawn in the world and on the map once seen; cairns you build; losing your bearings in fog, snow, storm or dark far from camp unless two landmarks or cairns are in sight | Done |
| 8 later (c) | Bear spray in the safety kit in bear country (two blasts, 90%); climbing the rock face for a look-out that fills in the map, with a fall risk under 1% on a rope; noise when stalking (rain, fog and fresh snow quiet, dry leaves and crust loud) | Done |
| 9 | Clothes wear from work and storms and let the cold in; mending with a bone needle restores 90% of the lost warmth and patches sleeping-bag holes (which were permanent); tea by the fire lifts spirits | Done (part) |
| 9 later (a) | Scrape and soften hides into leather: leather patches make clothes as good as new, leather mittens are warmer. Patch regrowth already exists in the game | Done |
| 9 later (b) | Weaving a door mat: a tight weave keeps most of the wind out of the shelter, a loose one less | Done |
| 9 later (c) | Trading and social contact are on hold: the plan gates them behind a review, since they clash with a solo survival game | On hold |

From the plan's architecture: double-tap protection is done (the same job tapped twice within 0.4 s runs once). Not built: a general job scheduler and typed material lots in kilograms. Drying racks, the smoker, pottery and lamps already run as day-by-day jobs on the game's own clock, and portions stay the unit, as agreed.
Each system is built directly on the game's existing rules instead, which keeps saves and balance safe.

## Hands-on crafting

The newer crafts are done by hand, like the original fire-starting and cordage pieces. Done well they come out better; rushed or sloppy, worse:
splitting and tillering a bow, pouring a fat lamp, twisting a sinew leader, trimming a wading staff, straightening arrows, scraping a hide,
chinking walls, coiling a pot, firing pots in a pit, mending, stacking a cairn, setting a hearth, laying a bough bed, lashing a drying rack,
fire reflector, bed frame and raft, knapping a stone blade, weaving a door mat, and notching cabin logs.
The older crafts are hands-on too: bow drill, handline, gorge hooks, digging stick, lure, net, smoker, food cache, fish trap, can stove,
clay chimney, woodshed, log bridge, pemmican, snowshoes and mittens.

## Left out on purpose

Things that only pay off over a longer time than a run lasts: farming and crop growing, bark girdling (it kills a tree over years), and the plan's general job scheduler and kilogram material lots (internal plumbing with nothing to show a player).

## Rules every phase follows

- `tests/run-all.sh` must pass before anything is published.
- Bot survival (median and mean over 1,020 games) must stay within 5% of the original game: median 49, mean 49.9 days.
- Standing after Phase 9: median 48 (-2.0%), mean 48.1 (-3.6%). Later phases need to add realistic advantages as well as hazards to stay inside the limit.
- Saves from older versions must keep loading.
