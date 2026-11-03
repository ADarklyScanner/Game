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

### Found by the saves review

Old saves from all 24 earlier versions load and play on, and save, reload and continue gives exactly the same game. These were fixed:

| # | Bug | Severity | Fix |
|---|---|---|---|
| 76 | A save that could not be read dropped silently to the setup screen, and the next new run overwrote it | data loss | It is kept aside, a notice says so, and a new run does not overwrite it |
| 77 | Loading only filled missing fields; a damaged one (null, a word where a number belongs, an unknown food or shelter) crashed the game screen | crash | Damaged fields are rebuilt. Of 3,428 single-field damages, none crash or break a number; the 40 that remove the version or the place are kept aside |
| 78 | A broken number in health, weight or morale was saved as empty and came back as 0 | data loss | Never saved; a sane value is used instead |

### Found by the lazy-player test (Nov 3, tests/lazy.js)

| # | What was wrong | Kind | Fix |
|---|---|---|---|
| 85 | Where water is all around, the game drank for you even if you never got up: a player who only slept lasted 20 to 32 days with no water and no food, where a real body lasts about three | realism | You drink on any day you are up and doing something, from boiled or hauled water kept at camp, or (in the browser game) by reaching the water's edge. A day lying still with none to hand is a day without water |
| 86 | Going without water cost the same each day, so in the dry places it took 10 days to kill you | realism | Thirsty on the first day, dizzy on the second, collapse on the third |
| 87 | Giardia from untreated water was rolled every day, even on days you drank nothing | wrong rule | Only on days you drank untreated water |

### Thin next to their siblings (Nov 3, built)

| # | Part | Was | Now |
|---|---|---|---|
| 88 | Fish trap | Built once, caught forever | Clogs in rain, torn by high water, heaved by ice, washes away; the trapline clears and mends it |
| 89 | Cooking | Always worked | Can char (lose some of the meal, sometimes burnt fingers) or come out just right; better with practice |
| 90 | Camp works | Never wore or broke | Storms lay the rack flat, tear up the smoker; snow brings the woodshed down; high water damages the bridge |
| 91 | Snares | One event in the game | Something alive in a snare (a real choice); snow buries snares until the line is walked |
| 92 | Snowshoes, mittens | Never wore | Lacing and fingertips wear through; mending fixes them |
| 93 | Moss, stones, clay | Always the same | Frost halves moss, a stone on the foot, good and gritty clay |
| 94 | Lamp | Only the spill | Smokes without a flue, gutters when tallow runs low |
| 95 | Raft | Capsize only | The wind pushes it down the lake |
| 96 | Snowshoe wear (found by tests/upkeep.js) | Would have crashed walking in deep snow once the lacing wore through | Fixed before release |

### Found by the gear simulation (Nov 3, tests/gearsim)

| # | Bug | Fix |
|---|---|---|
| 97 | A frozen lake with no axe or saw meant no water at all: every such run died of thirst two or three days after freeze-up, whatever else it carried (US-S6 always on day 47, US-S11 on day 37) | **Break a hole in the ice** with a heavy stone or a sharpened pole: an hour of hard work (more in deep cold), and the hole gives water and fishing for the day |
| 98 | The gill net cost more than it caught: two wades a day, soaked each time, and the same lake stock the rod uses | It fishes a little better (60% of nights in an average place, up to four in it), and lifting it by its shore line wets your arms, not your waist. A net knotted from salvage still fishes less than a real one |
| 99 | A carved gorge hook on bark cord caught 80% as well as steel hooks and line | 65% (55% if rushed) |

### Test-side problems (not game bugs)

- The test bot could not make do without gear. With no axe or saw it still aimed for a log cabin and never built anything; with no ferro rod it never made a bow drill; it gathered every material forever instead of what the shelter still needed, and stopped gathering once the shelter was up (so no drying rack or smoker). It now builds the best roof it has the tools for (a quick one first), makes a bow drill (and a stone blade for it), gathers what its shelter and camp works lack, breaks ice for water, and lifts the gill net once a day when the floats show a catch. The no-gear average went from 22 to 39 days. Because the bot changed, the balance reference was re-recorded with the new bot on the original game (median 62, mean 61.7); the current game is at 62 and 60.8 (−1.5%).

- The test bot never hauled water in the dry places and lived off its starting supply. It now hauls water when it runs low, as the game tells a player to. Its median in the dry desert site went from 13 days (dying of thirst) to 35; the old number came from the bot, not the rules.
- The rule checks skip through days without doing any jobs. The test loader now gives the character in them a drink each day; whole days played by the bots and the lazy test are left alone.

- The shelter suite hung and one wildlife check failed. Their test players sat for weeks with no fire, quit, and the wait loops never ended. Those loops now stop when the run ends and keep the test player's morale up.

## Open

Nothing.

### Fixed from the open list (Nov 2)

| # | Bug | Fix |
|---|---|---|
| 79 | Fifteen hands-on crafts gave the same result rushed or careful | A rushed job is remembered and works less well: a leaning reflector, a sagging bed frame, loose hearth stones and drying rack, a leaky smoker and stove, a thin woodshed roof, a bridge that tears loose sooner, an uneven net, a crooked staff, a lure that spins, a kinking handline, a soft digging stick that splits, a cairn that falls in a storm, and snare loops the wrong size. A careful rebuild clears it |
| 80 | Messages about wood or poles counted what was left in the field | The count says what reached your pack or camp, and what was left out |
| 81 | The drying-rack lashing showed the lean-to frame | Its own drawing |
| 82 | Raids and spoilage took unrounded portions, so the smoker could show 8.1 of 8 | Rounded; the rack and smoker never overfill |
| 83 | Pemmican rounding lost up to 16 kcal a batch | Kept to a hundredth of a cake |
| 84 | The overnight fire's wood was rounded to a tenth | Kept to a hundredth |

## Suspects (not bugs as far as the hunt could tell)

- A test hook (`window.__g`) ships in the game file. It only helps the test scripts; anyone could also use it from the browser console.
- If phone storage were ever full, saving would stop without a message. Real saves are 95 to 166 KB at day 200, far below any limit.

- Rivals are marked out the night after their last day, so the "remaining" count is a day late.
- "Build the fire up" choices read the same with no fire lit and no wood.
- Salvaged-can residue can make you sick even when you also carry a real pot.
- A roped climb's fall chance reaches 1.2% on slick rock with low health; the button says 1%.
- The shadow stick cuts getting lost to a quarter, not to zero.

## Balance after all fixes

The full test bot, 1,020 games, against the original game: median 56 → 56 days (0.0%), mean 56.4 → 54.9 (−2.7%). No place moved more than 10%.

After the water fixes (Nov 3): median 56 → 56 days (0.0%), mean 56.4 → 56.1 (−0.5%).

After the gear-simulation fixes (Nov 3), with the better test bot on both: median 62 → 62 days (0.0%), mean 61.7 → 60.8 (−1.5%). The dry desert site moved because the bot now hauls water (see above); the two lake sites that moved about 11% (US-S10, AU-S3) had moved before the water fixes.
