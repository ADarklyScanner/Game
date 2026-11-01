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
| `node balance.js` | Survival over 1,020 bot games, per place and overall, against the original game before the realism update (`reference/original-game.html`). Fails if the overall median or mean moves more than 5%. | ~25 s |
| `node fuzz.js [runs]` | Random play in every place, looking for crashes, broken numbers and days that never end. | ~10 s |
| `node ui-check.js` | Opens the page in a headless browser at phone width: starts a new run, loads saves from older versions, and shows late-game and win, pulled-out and tap-out screens in every place. Fails on any page error. | ~3 min |

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
- `bot.js` is the simple player used by the baseline and screen checks.
- `baseline-core.json` and `baseline-full.json` are the recorded references; `balance.json` holds the survival medians.
- `fixtures/` holds saves from the version before the rival names changed, and the old names that must never reappear.
