# Whole-game bug hunt: test plan

Goal: find every bug in Last One Out, and be able to prove nothing was skipped.

The rule that makes it complete: **the list of things to test is generated from the game's own code, not written by hand.** A coverage report then marks each item as tested or not, and the hunt is not finished until every item is marked.

## What the game contains (generated, Nov 1 2026)

| Thing | Count |
|---|---|
| Actions (jobs, crafts, camp work) | 109 |
| Events, each with 2-3 choices | 22 |
| Hands-on mini-games | 26 |
| Panels (camp, map, journal, pack, body, build, menu, records, notes, how to play, shelter choice, cache place, move camp) | 13 |
| Main screens (setup, game, end) | 3 |
| Places | 17 |
| Gear items | 28 |
| Foods | 76 |
| Shelter types | 5 |
| Code | ~1,800 engine lines, ~2,600 screen lines |

## Step 0. The inventory (built first)

`tests/inventory.js` reads the game and writes `tests/inventory.json`: every action id, every event id and choice, every hands-on piece, every panel, every place, gear item, food, shelter, condition name and log message. Every later step reports what it touched into a shared coverage file, and `tests/coverage-report.js` lists anything never touched. A new feature added later appears in the inventory automatically, so it cannot be forgotten.

On top of that, code coverage (Node's built-in coverage for the engine, the browser's coverage for the screens) shows every line and branch that never ran.

## Step 1. Every action, every way it can go

For each of the 109 actions, a generated test runs it:
- **Allowed:** in a state where it should work, it runs, takes the right hours and effort, and changes only what it should.
- **Refused:** every "why not" reason it can give (no fire, no tool, too dark, not enough materials...) is reached at least once, and refusing changes nothing.
- **By day and by night:** night-only and day-only rules hold; a lamp or fire is needed where it should be.
- **Hands-on result:** where it has one, done well, done badly, abandoned, and timed out.

## Step 2. Every event, every choice

Each of the 22 events is forced in every place where it can happen, and each choice is taken. Checked: the choice is offered only when its condition is true (for example bear spray only with spray left), the outcome matches its description, and nothing breaks if the event fires at dusk, at night or during a mini-game.

## Step 3. The mini bots: many players, many ways to play

Scripted players run the engine thousands of times. Each style hunts different bugs:

| Bot | Plays like | Finds |
|---|---|---|
| Random | presses anything allowed | crashes, impossible states |
| Careful | the current test bot: keeps a fire, builds, preserves food | balance, long-run bugs |
| Careless | eats anything, never washes, no latrine, walks in fog | consequence systems, death paths |
| Specialist | only fishes / only hunts / only traps / only forages | single-system exploits and dead ends |
| Gear-starved | no knife, no pot, no axe, no fire-starter, nothing | fallbacks: stone blade, clay pot, bow drill |
| Night owl | works after dark, by fire and lamp | night rules, lamp, tallow |
| Hoarder / mover | stockpiles everything / moves camp often | storage, spoilage, move-camp resets |

Each bot plays all 17 places with many seeds and gear sets. After every action and every night, invariants are checked:
- no broken numbers (NaN, infinity), no negative materials, food or tools
- hours never past the day's light, health and morale within 0-100
- calories conserved where they should be (drying, pemmican, splitting stores)
- the same seed and choices always give the same game
- a save and reload at any point gives an identical game
- every log message reads cleanly (no "undefined", "NaN", "[object")

## Step 4. Saves, old and broken

- A save from every published version (rebuilt from the git history and the artifact's version list) loads in the current game and plays on.
- Saves taken mid-event, mid-night, mid-mini-game and at the end screen.
- Damaged saves: missing fields, a broken extension block, wrong types. The game must recover, never crash or wipe the run.
- Save size stays under 500 KB at day 200.

## Step 5. Every screen, at every size

A browser bot opens the real page at phone (320, 375, 430 px wide), tablet and desktop sizes. In each game phase (morning, midday, dusk, night, inside, in an event, in a mini-game, at the end), it:
- opens all 13 panels and the 3 main screens
- presses every button it can actually reach, including keyboard shortcuts
- checks for page errors, things wider than the screen, overlapping or cut-off text, and buttons that do nothing
- plays each of the 26 mini-games well, badly, abandoned and timed out

The browser's coverage report must show every screen function ran.

## Step 6. Full runs through the real screen

A slower bot plays whole runs through the page itself: walking, gathering, building, sleeping, through to an ending, in several places. This catches bugs that only appear when systems meet over weeks, such as map, saves and animations interacting.

## Step 7. Words and content

- No real cast names, show name or "contestant" anywhere.
- Every place, food, gear item and condition has a readable name and description.
- Help text matches what the game actually does (for example, the how-to-play page mentions drying, not the old instant smoking).

## Step 8. Speed

- Frame rate on a mid-range phone setting stays smooth in the busiest scenes (big camp, rain, many animals).
- No memory or save growth over a 200-day run.

## Using Claude helper agents (the other kind of mini bot)

The hunt splits naturally, so separate helper agents can work at the same time, each with one area:
1. Engine rules: food, cooking and fire
2. Engine rules: tools, crafts and shelter
3. Engine rules: wildlife, navigation, health and consequences
4. Screens and mini-games
5. Saves, old versions and damaged data
6. A fresh-eyes player that plays through screenshots and reports anything confusing or wrong

Each helper **reads, runs and reports**; it does not change the game. Findings go into one list, and fixes are made one at a time in a single place. That way two helpers never edit the same code, and every fix gets its own regression test.

## How bugs are handled

- Every finding goes into `BUGS.md` with how to reproduce it, how bad it is (crash, wrong rule, balance, cosmetic) and where it is.
- Fix in order of how bad. Each fix adds a test that failed before and passes after.
- After each batch of fixes: run everything again, including balance.

## Done means

- Every inventory item marked tested; nothing left on the coverage report.
- Engine line coverage at least 95%, every engine branch either run or explained; every screen function run.
- 50,000 bot runs with no invariant broken.
- Every published version's saves load.
- Every screen clean at every size.
- `BUGS.md` empty of anything above cosmetic, and those listed.

## Rough order and size

1. Inventory and coverage report (small)
2. Action and event tests (medium; mostly generated)
3. Bot styles and invariants (medium)
4. Saves (small)
5. Screens at all sizes, full runs through the page (large)
6. Words and speed (small)
7. Helper agents in parallel across 1-6, then fixing (depends on what is found)
