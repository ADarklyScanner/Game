# Update progress

Where the realism update stands, phase by phase, following the update plan.
Each phase is committed and published on its own, so stopping between phases never loses work.

| Phase | What | Status |
|---|---|---|
| 0 | Safety checks (baseline, random play, screens, balance) | Done |
| 1 | Food that keeps: drying rack, smoker, fat rendering, pemmican, storage | Done |
| 1+ | Cooking risks (raw meat and fish, worms), drying rack on the map, drop sites ordered by difficulty | Done |
| 2 | Fire and stoves: damp tinder, stone hearth, flue soot and chimney fires, smoker flare-ups, chinking walls | Done |
| 3 | Materials and tools: wood, timber, stone, clay, fibre, bark, salvage, cordage, carpentry, hafting, sharpening | Next |
| 4 | More cooking and camp lighting | Not started |
| 5 | Water safety, medicine, hygiene, sanitation, waste | Not started |
| 6 | Shelters, cabins, camp layout, bridges, rafts, snowshoes, bedding and sleep | Not started |
| 7 | Pottery and kiln firing | Not started |
| 8 | Weapons, arrows, tackle, traps, fishing, ice fishing, hunting, tracking, weather, navigation, climbing, swimming, ice safety, wildlife, predators, stealth, scent, trail marking | Not started |
| 9 | Textiles, clothing repair, hides, ecology and regrowth, farming, trading, social, mental strain | Not started |

Not built from the plan's architecture: a general job scheduler, typed material lots in kilograms, and action receipts.
Each system is built directly on the game's existing rules instead, which keeps saves and balance safe.

## Rules every phase follows

- `tests/run-all.sh` must pass before anything is published.
- Median bot survival must stay within 5% of the original game (49 days).
- Saves from older versions must keep loading.
