# Safety checks for Last One Out

Run these before publishing any change. They test the real `../index.html`.

```sh
./run-all.sh
```

| Check | What it does | Time |
|---|---|---|
| `node baseline.js` | Plays 51 fixed games (3 seeds in every place) with a simple bot and compares a fingerprint of each game at days 5, 25, 50 and the end with the recorded references. **Core** games never preserve food and must never change unless the core rules change on purpose. **Full** games use everything. | ~4 s |
| `node food.js` | The food-keeping rules: drying on the rack, the smoker, rain, flies, rendering fat, pemmican, older saves. | <1 s |
| `node cooking.js` | Cooking rules: raw meat and fish, worms in pig and predator meat, what boiling and roasting do. | ~5 s |
| `node fire.js` | Fire and stove rules: damp tinder, the stone hearth, soot in the flue, smoker flare-ups, chinking the walls. | ~5 s |
| `node tools.js` | Tool and material rules: dull axes, sharpening, axe heads working loose, bursting hearth stones, clay chinking. | ~5 s |
| `node light.js` | Light and the night: what needs a fire or a lamp, the fat lamp, overnight broth. | ~3 s |
| `node hygiene.js` | Water, hygiene and waste: salvaged cans, hands after butchery, gut piles. | ~5 s |
| `node shelter.js` | Shelter rules: snow on the roof, the fire reflector, the raised bed frame, cabin logs shrinking, snowshoes. | ~3 s |
| `node pottery.js` | Pottery: shaping, drying, pit firing, and using a clay pot. | ~3 s |
| `node wild.js` | Reading the land: catches left in snares, forecasting from the sky, smoke on your clothes, thin ice, game sign. | ~10 s |
| `node mend.js` | Clothes and spirits: wear, mending, sleeping-bag holes, tea by the fire. | ~2 s |
| `node bowmap.js` | A bow of your own (carving, tillering), cairns, and losing your bearings. | ~3 s |
| `node crafts.js` | Stone blades, woven door mats, cabin joints, rafts. | ~10 s |
| `node finish.js` | Bear spray, climbing the rock, noise when stalking, the latrine. | ~10 s |
| `node conseq.js` | Learning by consequence: the field notebook, look-alike plants, unknown berries, creeping cold, smoke in a shut cabin, shadow stick and moss. | ~15 s |
| `node regress.js` | One check per bug fixed in the bug hunt (see ../BUGS.md). | ~30 s |
| `node balance.js` | Survival over 1,020 bot games, per place and overall, against the original game before the realism update (`reference/original-game.html`). Fails if the overall median or mean moves more than 5%. | ~25 s |
| `node fuzz.js [runs]` | Random play in every place, looking for crashes, broken numbers and days that never end. | ~10 s |
| `node handson.js` | Plays each newer hands-on craft through the real page and checks the result, including deliberately sloppy runs. Uses a temporary copy of the game with a test hook. | ~2 min |
| `node ui-check.js` | Opens the page in a headless browser at phone width: starts a new run, loads saves from older versions, and shows late-game and win, pulled-out and tap-out screens in every place. Fails on any page error. | ~3 min |

## The bug hunt tools (see ../TESTPLAN.md)

| Tool | What it does |
|---|---|
| `node inventory.js` | Lists everything in the game that must be tested, from the code: actions and each of their refusal reasons, events and choices, places, gear, foods, shelters, conditions, mini-games, panels, screens. Writes `inventory.json`. |
| `cover.js` | A test-only copy of the engine that records what ran into `.coverage.json` (the game file is not changed). |
| `node coverage-report.js` | Lists every inventory item no test has touched yet. |
| `node exhaustive.js [n]` | Builds n varied situations; asks every action, runs allowed ones, checks a refusal changes nothing, forces every event that could fire there and takes every choice, then plays the night. Rules are checked after each step. |
| `node styles.js [n]` | Eight kinds of player (random, careless, fisher, hunter, forager, starved of gear, night owl, mover) in every place; rules checked after every action and night; same seed gives the same game; saves round-trip; save size limit. |
| `node screens.js` | Opens every panel in every game phase at five screen sizes (320 px to desktop), presses the safe buttons, starts and abandons every mini-game, and checks every screen function ran. |
| `node upkeep.js` | The upkeep rules from the sibling pass: the fish trap, snares under snow, the rack in a storm, snowshoes and mittens wearing, frozen moss, cooking outcomes, the snare event, the ice hole, and the jobs the rarely-taken items do. |
| `node budget.js` | The gear budget: every item has a cost, the ten most common do not fit, the setup screen refuses what does not fit and drops it when you switch, and a budget run remembers the rule. |
| `node unlocks.js` | Places open a difficulty group at a time: a new player has the forgiving places; 30 days or the top half in one opens the next group; a played place stays open; "Open every place" opens all; the daily challenge is always there. |
| `node golden.js` | The show-independence safety net: every place, 3 seeds, a fixed kit, 30 days; every number must match `golden.json`. Re-record (`--record`) only after an intended rule change. |
| `node oldsave.js` | A real browser save from before the show-independence pass (`fixtures/old-save.json`) still loads: same place, day and kit. |
| `node minis.js` | Mini-game fixes: reel in after a cast (and the cast's time is spent), the net warns before numb hands fail it, a drawn bow can be let down (it costs time and steadiness), a slip in a rhythm craft costs a step, a lash that runs out of time is rushed. |
| `node camping.js` | Camping, the practice valley: kept out of the drop sites, no rivals, every species, sea, lake, snow and ice; nothing ends a run but the button; the start option, the small valley with every feature and the wreck, the lesson chip and list, Show me, lessons ticking off, and no records. |
| `node selfcheck.js` | The in-game self-check: off for players, on with `#selfcheck` on the game's link; a broken state raises a banner and the ✓ button copies a report (state, problems, last days of the log). |
| `node lazy.js` | Lazy players: a bot that only sleeps, with no kit and with a typical kit, in every place. Fails if any place lets it last longer than a real body could without water (about three days). |
| `node campsite.js` | Choosing camp through the real page (a new run starts with no camp, bad spots are refused, older saves keep their camp) and the wreck on the far side of every map. |
| `node sheet.js [dir]` | The picture sheet: forces each place and state, takes a phone-sized picture of each, and builds one page of them in `../design/sheet` (not kept in git). Fails only on page errors. |

## When the baseline changes

If you changed how the game plays **on purpose** (new rules, rebalancing), `baseline.js` will report changed runs. Check that only the runs you expected changed, then record the new reference:

```sh
node baseline.js --record full   # or core, if the core rules changed on purpose
node balance.js --record         # only if the difficulty change is wanted
```

If you did **not** mean to change how the game plays (a new screen, wording, a new optional system), the baseline must still match. A changed run means something broke.

## Testing a different copy

Set `GAME_FILE` to test another file, for example a work-in-progress copy:

```sh
GAME_FILE=/path/to/copy.html node baseline.js
```

## Files

- `load-game.js` pulls the data and engine out of `index.html`.
- `bot.js` is the simple player used by the baseline, balance, screen checks and the gear simulation. It makes do with what it carries: the best roof its tools allow (a quick one first), a bow drill without a ferro rod, a hole in the ice without an axe, and it gathers only what its shelter and camp works still need.
- `baseline-core.json` and `baseline-full.json` are the recorded references; `balance.json` holds the survival medians.
- `fixtures/` holds saves from the version before the rival names changed, and the old names that must never reappear.

## Tuning the mini-games (not part of run-all)

`node minitune.js [runs] [names]` plays the timing mini-games (knapping, coiling, netting, cooking, chopping) as a sharp, an average and a slow player, with reaction or timing errors drawn at random, and reports how often each does well. The brief's targets for the average player: about 70% finish OK or better, 25 to 35% do well, under 10% fail hard. It plays in real time, so it is slow, and with few runs the numbers wobble. Its scripted players are methodical, so jobs that reward care (cooking) read easier than they are for a person.
