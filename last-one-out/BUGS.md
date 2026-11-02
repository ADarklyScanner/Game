# Bug list

From the whole-game bug hunt (see TESTPLAN.md). Engine fixes each have a check in `tests/regress.js` or in the rule suite for their area, which failed before the fix and passes after. Screen fixes were checked in a headless phone-sized browser and by `tests/screens.js`.

Severity: **crash**, **wrong rule** (the game does something its own rules say it should not), **balance**, **cosmetic**.

## Fixed

### Found by the rule bots and helper reviews

| # | Bug | Severity | Fix |
|---|---|---|---|
| 1 | Two actions shared the id `moss`. "Check which side the moss grows" gathered 4 moss in 6 minutes, and the moss lesson never reached the notebook | wrong rule | The check is now `moss_check` |
| 2 | Cleaning a catch never added bone or feathers. The code sat inside a comment | wrong rule | Moved out of the comment |
| 3 | Raft fishing never wore out the water, and its bonus shrank below the shore's on a low-floating raft | balance | The raft shares the shore's tiring count; a steady 30% bonus |
| 4 | "Bear on the kill" fired all winter while bears were denned | wrong rule | Same denning rule as the bear-at-camp event |
| 5 | Health could go below 0 during the day and you could survive it | wrong rule | Health is floored at 0 after every job and event; reaching 0 ends the run |
| 6 | Smoked clothes and a quiet stalk did nothing when an animal was in sight | wrong rule | Smoke softens being winded; noise affects the shot |
| 7 | Splinting a nearly healed sprain made it last longer | wrong rule | Never longer than before |
| 8 | A rough night out reset the creeping cold ("one warm night breaks it") | wrong rule | A rough night counts as a bad night |
| 9 | Set lines with no bait caught as well as baited ones, and said "Baited two lines" | wrong rule | Bare hooks catch about a third as often, and the text says so |
| 10 | The engine still gave first place on a tie with the winner | wrong rule | Same rule as the screen: a tie with the winner is second |
| 11 | The same illness could stack: three copies of frostnip or mushroom poisoning at once | balance | Conditions with the same name merge |
| 12 | Event card and log told different stories (two random draws) | cosmetic | One draw |
| 13 | "A wolves is into your stores" | cosmetic | Plurals and "an" handled |
| 14 | Tracking odds on the button ignored fresh snow and rain | cosmetic | Button shows the real odds and why |
| 15 | In snow season a wrong forecast said "Rain by morning", which gave it away | cosmetic | Says snow or storm |
| 16 | The salvaged-can warning repeated while you were already sick from it | cosmetic | Only when newly sick |
| 17 | Needle tea spoiled before it could be drunk | wrong rule | Keeps 2 days |
| 18 | Meat that came in during a cold snap never spoiled; smoked dried meat spoiled in hard frost | wrong rule | Spoilage pauses below −3 °C for everything, then resumes |
| 19 | "Smoke meat and fish" was offered with nothing to smoke | wrong rule | Only with something that can hang |
| 20 | A smoker fire left meat hanging in the wreck | wrong rule | The meat comes down; the text names what was in it |
| 21 | One pot of boiled water covered two nights but said one day | cosmetic | Text says a day or two |
| 22 | The fat lamp burned tallow while you sat at the fire | wrong rule | Only when it is the light you work by |
| 23 | Pemmican and broth counted as fat for mice and raiders | wrong rule | Only real fat |
| 24 | Pemmican made bad meat safe (wet-core and worm-host meat) | wrong rule | Pemmican inherits those risks |
| 25 | A chimney or rock shelter counted as a hearth for a fire outside | wrong rule | Only with the fire inside |
| 26 | A rough chimney stayed rough for ever, even after a careful rebuild | wrong rule | Set on each build |
| 27 | The morning storm check ignored a stone hearth | wrong rule | Hearth fires survive storms better |
| 28 | The clean log understated calories from fat and organs, which were not scaled by knife or size | cosmetic | Scaled and counted |
| 29 | A ferro-rod miss always blamed damp tinder | cosmetic | Depends on the tinder |
| 30 | Later sessions of multi-session builds (smoker, cache, fish trap, chimney, bridge) demanded the whole bill again | wrong rule | Bill checked before the first session only |
| 31 | Crooked arrows were remembered after they were lost | wrong rule | Forgotten when the quiver empties |
| 32 | Cabin joint fit carried over to every later cabin | wrong rule | Reset when a new cabin starts and when moving camp |
| 33 | Dropping a paid shelter plan, moving camp, a collapse or a fire lost every paid material silently | wrong rule | Dropping gives back what is not built in; moving or a collapse saves about half; a fire about a third |
| 34 | Char in the roof followed you to a new camp's fresh roof | wrong rule | Cleared on moving camp and on a new roof |
| 35 | Snow load stayed frozen with no shelter and landed on the next roof | wrong rule | Cleared on collapse, fire, new roof and moving camp |
| 36 | Over-shaving a bow often gave a perfect bow | wrong rule | Leaves it weak; re-tillering evens it at a lighter draw |
| 37 | A homemade bow with no arrows blocked the slingshot | wrong rule | Refused only with no arrows and no stones |
| 38 | Upgrading the shelter in place destroyed the bough bed, raised frame and door mat | wrong rule | They are kept |
| 39 | The rawhide wrap on the axe was permanent | wrong rule | Only as good as the last refit |
| 40 | Leather mittens ignored a sloppy sewing job | balance | Loose stitches let cold in |
| 41 | Text slips: arrow count when the quiver nearly full; "snow" with no snow; pot drying time; "2 pots ... it holds"; "0 portions dry" | cosmetic | Fixed |
| 42 | The move-camp sheet did not say what is left behind | cosmetic | Lists it |
| 43 | The night meal ate meat off the drying rack and out of the smoker first | wrong rule | Hanging meat is eaten last |
| 44 | Move-camp and map panels threw an error if opened after the run ended | crash (minor) | They do nothing once the run is over |

### Found in play

| # | Bug | Severity | Fix |
|---|---|---|---|
| 45 | Doing nothing but rest lasted 36 to 63 days. Every "Rest" added morale and health, so a day of resting cancelled the nightly cost of hunger, no fire and no shelter | balance | A break after work still helps. Resting with nothing done gives a little once a day and nothing after. Rest-only runs now end around day 30 to 35 |
| 46 | Weeks of eating almost nothing did no more harm than one bad day | balance | After a week of near-zero food, the damage builds |
| 47 | A sleeping bag cancelled any night's cold | wrong rule | Only down to its rating |

### Found on the screens and in the fresh-eyes playtest

| # | Bug | Severity | Fix |
|---|---|---|---|
| 48 | Space or 1-6 on a hold button (hold the rod, wade out, blow) threw an error; the keyboard could not cast | crash | Keys press and release hold buttons like a finger |
| 49 | Abandoning a run during a mini-game carried it into the next run | wrong rule | The mini-game is closed; the new setup keeps your last loadout |
| 50 | Distances in "km" were 9.5 times too large (back to camp, pins, bear) | wrong rule | Real metres |
| 51 | The "Move camp here" button priced 9.5 times the real distance | wrong rule | Same cost as the sheet |
| 52 | "Sleep rough out here" was offered 74 m from camp | wrong rule | Only over 250 m away |
| 53 | Reloading during a bear, grouse or carcass event left it unreachable; jobs were refused for the rest of the day | wrong rule (stuck) | The animal comes back after a reload |
| 54 | A missed bite, an early strike or not casting at all still fished at full odds | wrong rule | A fumbled bite costs most of the session's chances |
| 55 | Three ferro strikes then waiting lit the fire without blowing | wrong rule | Waiting out the clock fails |
| 56 | The highlighted mushroom button gave away whether they were safe | wrong rule | Highlighted only when you can tell |
| 57 | Crafting at night by the outdoor fire burned lamp tallow | wrong rule | Knows whether you are inside |
| 58 | Several hands-on jobs ignored a rushed result, and "Stop" finished the job anyway | wrong rule | Rushed bed, roof repair and raft come out worse; the button says "Finish now · a rushed job" |
| 59 | The blood-trail counter never moved | cosmetic | Counts as you go |
| 60 | "Brace the shelter" at dusk ran three hours past dark | wrong rule | Uses only the light left; under an hour and a half is not enough |
| 61 | The food number overflowed its card at 320 px | layout | Fits |
| 62 | No way to back out of hunting, fishing or chopping | cosmetic | "Lower the bow", "Reel in", "Step back" before you commit |
| 63 | Loading a finished run tried to vibrate the phone before any tap | cosmetic | Waits for a tap |
| 64 | Space could end the day with 6 to 9 hours of light left ("Turn in early" was the first button) | wrong rule | Goes last and asks for a second press while there is over an hour of light |
| 65 | "1.9000000000000004h of light wasted" | cosmetic | Rounded |
| 66 | One tree gave limbs for poles over and over | wrong rule | Once a season, as the help says |
| 67 | Cleaning a bird showed a fish | cosmetic | A bird, with its own words |
| 68 | Long messages over the map ran off both edges of a phone | layout | They wrap and stay on screen |
| 69 | Things to pick up were hidden under tree crowns | layout | Drawn on top, with a soft ring |
| 70 | Map labels printed on top of each other | layout | Stepped apart |
| 71 | How to play gave the wrong map size and still said to smoke meat to keep it | wrong text | 1.6 km a side; dry it until it snaps |
| 72 | The Craft menu vanished when nothing could be made, so the "Build a smoker" hint led nowhere | wrong rule | Always there at camp, showing what each thing needs; the hint points at the drying rack |
| 73 | The Craft menu said "Not enough daylight" for things you lacked the materials for | wrong text | Names what is missing first |
| 74 | "Stacked 1 poles", "20 snare wire (snare wire)", "Every one of these can be built", "Get back to camp" said at camp, "Searched around camp" at the old camp | cosmetic | Fixed |
| 75 | Reloading the page put you back at camp | wrong rule | You stay where you stood |

### Test-side problems (not game bugs)

- The shelter suite hung and one wildlife check failed. Their test players sat for weeks with no fire, quit, and the wait loops never ended. Those loops now stop when the run ends and keep the test player's morale up.

## Open (cosmetic)

- Some hands-on crafts still give the same result rushed or careful: hearth, drying rack, reflector, bed frame, lure, staff, cairn, stove, smoker, woodshed, bridge, digging stick, handline, net and the snare loop.
- Messages about wood or poles count what was left in the field when the pack was full.
- The drying-rack lashing shows the lean-to frame.

- Raids and spoilage subtract unrounded portions, so the smoker can show 8.1 of 8.
- Pemmican rounding loses up to about 16 kcal a batch.
- The overnight fire's wood is rounded to a tenth.

## Suspects (not bugs as far as the hunt could tell)

- Rivals are marked out the night after their last day, so the "remaining" count is a day late.
- "Build the fire up" choices read the same with no fire lit and no wood.
- Salvaged-can residue can make you sick even when you also carry a real pot.
- A roped climb's fall chance reaches 1.2% on slick rock with low health; the button says 1%.
- The shadow stick cuts getting lost to a quarter, not to zero.

## Balance after all fixes

The full test bot, 1,020 games, against the original game: median 56 → 56 days (0.0%), mean 56.4 → 54.8 (−2.8%). No place moved more than 10%.
