# Safety checks for Last One Out

Run these before publishing any change. They test the real `../index.html`.

```sh
./run-all.sh
```

| Check | What it does | Time |
|---|---|---|
| `node baseline.js` | Plays 51 fixed games (3 seeds in every place) with a simple bot and compares a fingerprint of each game at days 5, 25, 50 and the end with the recorded reference. Any change to how the game plays shows up here. | ~2 s |
| `node fuzz.js [runs]` | Random play in every place, looking for crashes, broken numbers and days that never end. | ~10 s |
| `node ui-check.js` | Opens the page in a headless browser at phone width: starts a new run, loads saves from older versions, and shows late-game and win, pulled-out and tap-out screens in every place. Fails on any page error. | ~3 min |

## When the baseline changes

If you changed how the game plays **on purpose** (new rules, rebalancing), `baseline.js` will report changed runs. Check that only the runs you expected changed, then record the new reference:

```sh
node baseline.js --record
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
- `baseline.json` is the recorded reference.
- `fixtures/` holds saves from the version before the rival names changed, and the old names that must never reappear.
