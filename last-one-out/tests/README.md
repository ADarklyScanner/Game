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
| `node balance.js` | Median survival over 510 bot games, per place and overall. Fails if the overall median moves more than 5% from the reference. | ~12 s |
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
