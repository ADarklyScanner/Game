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

### Items that did nearly nothing (Nov 4, built)

Real contestants rarely take these, so they stay modest, but each now has a job and a place where it helps.

| # | Item | Was | Now |
|---|---|---|---|
| 100 | Scotch eyed auger | One session off a cabin or hut | Pegged joints: the bed frame, drying rack, cache and every shelter need no cordage, and pegged camp works stand up to storms and snow better |
| 101 | Ground sheet | A small warmth bonus | A dry layer under the bed (counts as bedding), catches rain to drink, keeps stores dry, and keeps you out of the worst of an open-air night |
| 102 | Shovel | The same as a free digging stick | Roots and cattails come out half again as fast, and in snow it banks the shelter walls (a fifth less cold at night) |
| 103 | Salt | Sodium only, which matters after a month | Salt on the food is one of the things that keeps you going, every day it lasts |
| 104 | Hammock | No mice or spiders | The best sleep on a mild night (better recovery, and it keeps you going), and the hip bones do not grind once you are thin |

### Found teaching the test bot to stalk (Nov 4)

| # | Bug | Fix |
|---|---|---|
| 105 | A shot at an animal you had walked up to on the map cost the full three and a half hours of a blind hunt, on top of the walking | About an hour and a quarter: the last of the stalk and the shot |
| 106 | A slingshot could bring down a moose | It stings big game; it almost never drops it |

### Found in the mini-game review (Nov 4, from the user's code read)

| # | Bug | Fix |
|---|---|---|
| 107 | After a cast you could not reel in; only a bite, a miss or the 40 s deadline ended it | Reel in at any time while waiting; the cast's time is spent |
| 108 | The net's cold bar filled with no warning | "Your hands are going numb. Get out." past 70%, and the bar turns red |
| 109 | A drawn bow could only be released or timed out | Let it down and draw again; it costs 2 s and the next draw shakes more |
| 110 | A slip in a rhythm craft cost nothing | A slip costs a step |
| 111 | A lash or tap craft that ran out of time counted as done well if every point was tapped | Running out of time is a rushed job; with nothing done, nothing is built and no time is spent |
| 112 | Walking away from sharpening, cordage, the tap, step and stroke crafts still did the whole job | Nothing done: nothing happens. Part done: half a result (half the edge, one length of cord, a rushed build) |
| 113 | Six hands-on jobs had no way to back out | "Not now" before you start, at no cost |
| 114 | A deadfall whose stone kept falling still set three | It sets one |
| 115 | A bear at camp blocked every job everywhere | Away from camp you carry on; the bear has the food while you are gone |
| 116 | A fish fought perfectly to the bank was rolled again at the base odds, and the float bit on every cast whatever the odds | The game's odds decide the bite at the cast (nothing biting is said); a fish fought in is landed about nine times in ten |
| 117 | A kill was detected by reading the last log lines; the carcass and the blood trail were placed by the player, not the animal | Read from the state; both start where the animal stood, and the trail runs away from you |
| 118 | Cutting firewood from a living tree felled it | It takes the lower limbs; the tree stays. Snags, logs and saplings are still used up, and "cut logs" fells |
| 119 | The snare drew a timing frame with no marker | Only the bow and the axe show the sweep |
| 120 | A broken painting could black out the frame | It falls back to the plain drawing |
| 121 | Every tide change repainted the whole ground | Only the tiles along the shore |
| 122 | The +/- numbers by the vitals vanished when the HUD refreshed | They sit on the page, not inside the vital |
| 123 | The end-screen stinger replayed on every reload | Once per run |
| 124 | The save check guarded bagHoles in the wrong place | Guarded where it lives |
| 125 | Standing at the pond near the shore fished the lake | Fishes the pond |
| 126 | A berry bush picked clean in its ripe spell never came back | A smaller second flush five days on, while still in season |
| 127 | Leftovers of a tree part used up through a shared part (birch tinder takes its bark) stayed on the ground, unpickable | Cleared |

Checked and left as they are: a wrong-sized snare is still set (it catches less, by design since Nov 2); an unreadable save is only kept when one exists, so no false banner; the body-state filter is only set when it changes. Still open: the fish trap is not on the map, so the trapline walk cannot include it yet; fishing and hunting still use the text pad rather than a painted one; the inside view is unpainted.

### Found while building the UI and hands-on work (Nov 6)

| # | Bug | Fix |
|---|---|---|
| 128 | The +/- numbers by the vitals never showed: they looked for the old `.vital` class after the HUD was redesigned to `.vt` | They look for `.vt` (and sit on the page, so a refresh does not wipe them) |
| 129 | "Pick through the ruin" passed 2.2x odds that the search rule never used | Applied |
| 130 | Thread crafts could be drummed as fast as you can tap | Rushing the next move tangles the thread and costs a step |
| 131 | The page-play test pressed Build shelter through the open design picker hundreds of times, stacking pickers until the page froze (a player cannot, the picker covers the button) | The test answers an open picker as a player would, or closes it |
| 132 | Every shelter session was the same lashing tap, so a rushed build had no lasting cost except in a cabin | Each session is its own stage (frame, shingle, dig, vent, stack, chink); a rushed stage leaves a weaker shelter and, under a roof of boughs or poles, a leak that wets you on rainy nights until patched |
| 133 | Snare and deadfall sets on the map were forgotten at the start of each day, so after the first day checking the trapline skipped the walk | Sets are saved with the game and stay on the map while the snares are out |
| 134 | The raft's careful-lashing bonus (fewer capsizes) was never reachable: fishing from the raft had no hands-on part, so it always used the rushed odds | Poling out and crouching for gusts decides it |
| 135 | Pressing a shelter plan that still needs materials reopened the design picker, a loop with no word on where poles or boughs come from | It opens what the plan still needs, where each comes from, and a Walk there to the nearest source |
| 136 | Several mini-game tests searched the whole page text, which includes the game's own script, so checks like "it came out charred" passed whatever happened | Tests read the day's messages instead; all re-run honestly |
| 137 | Coiling a pot: the thickness bar showed the last coil's value for a moment when the next roll began | The bar resets when a roll starts and ends |
| 138 | Tile labels cut mid-phrase ("Chink the", "Cook a", "Smoke your", "Scrape and") | Short labels skip filler words, and the jobs that need it have their own short names |
| 139 | Skinning: the first touch movement could read as a jerk and tear the hide, because speed was measured over one event | Speed is measured over the last tenth of a second |
| 140 | Cooking: once the middle was done, the turn-it warning hid the take-it-off message, so following the prompts burned the food | Done-through comes first; just right needs it taken off promptly and browned evenly |
| 141 | A tree beside camp offered no jobs (camp jobs took over) | Its pop-up lists what the tree offers |
| 142 | Resting and sleeping every day, doing nothing else, lasted 30 to 35 days in most places (day 16 with 80 health) | Neglect now costs will in full from the start (still no fire, still no roof, days of doing nothing, worse each day in a row); only loneliness and sameness creep in slowly. Long stretches with almost nothing to eat wear health down. A do-nothing run now taps out around day 9 to 11; a working player is unaffected (median 63 to 63 days, mean -3.2%) |
| 143 | A Camping game was marked unreadable on reload (the save check only knew the drop sites) | The practice valley is a known place to the save check |
| 144 | A bad accident, a serious fall, a snakebite or a collapse ended a Camping run, though practice is meant never to end but by the button | In practice these become a heavy condition, and the game says it would have ended a real drop |
| 145 | The morning after a run had ended could still run (a 2 s timer) | It checks the run is still going |
| 146 | Hands-on jobs rolled their chances with the browser's own random numbers, so the daily challenge was not the same for everyone once you played by hand | Each job draws from the run's seed, the day, the hour and the job count; visual-only randomness is left alone |
| 147 | The first session of the food cache skipped the lashing | Both sessions are lashed by hand |
| 148 | At a river the float was dropped toward the lake shore | It lands in the river |
| 149 | Camp sounds only started after the first job | They start with the first touch or key |
| 150 | The layout grid let the latrine go on the kitchen's square, removing the kitchen | The other zone's square is not offered |
| 151 | Older browsers without canvas roundRect could not draw the world | A small fallback |
| 152 | In fog the cairns you built for finding your way vanished under the fog | Nearby cairns loom through it |
| 153 | A loose raft cover was recorded and never mattered | It drips in the rain |
| 154 | A food portion saved as text was thrown away on repair | It is read as the number it is |
| 155 | Low shelter scores often showed no reason | Every low score says why |
| 156 | The mushroom check was text only | The mushroom is drawn from its description, and cut open |
| 157 | The hand mini-games could not be played without a pointer | Arrows move a cursor over the drawing, E presses (hold to drag) |
| 158 | "Hands remember" gave no head start on knapping, coiling, netting, pemmican, scraping or shingling | It does now |
| 159 | The cabin's first three sessions were the same job | Sill logs, notched walls, the roof, then chinking |
| 160 | Dead code: an empty block on a never-set field, an unread counter, an unread view variable, checks for gear that does not exist | Removed |
| 161 | Floating +/- numbers went over the wrong vitals (food on will, will on water) since water was added | Each float finds its vital by name; water gets its own float |
| 162 | Sitting inside, a tap on the world still walked you about | No walking while inside; going in drops any walk target |
| 163 | Inside, a job's result never showed (the toast drew into the hidden world) | Shown as a banner when inside |
| 164 | Beach debris you walked up to was never taken, and "Pick it up" rolled the normal shore odds | Picking it up is a sure find in half an hour, and that piece is gone |
| 165 | Turning in early from the More... sheet skipped the "are you sure" | The sheet asks for a second tap |
| 166 | The weight chart's limit line was always at 70%, not the site's real medical limit | Drawn at the real limit |
| 167 | A three-session cabin skipped the roof | Stages spread over the sessions: sill, roof, chink |
| 168 | Stalking the trail drew the bow at nothing | A creep up the trail first: dry patches to step over, wind shown; a quiet stalk turns up an animal and a better shot, a noisy one spooks everything |
| 169 | Camping lessons asked for jobs your kit could not do | An old billy can at the site; a lesson says what is missing |
| 170 | The job buttons were worked out every frame | A few times a second |
| 171 | "½ h" was not shown as a time chip | It is |
| 172 | Stitching with no pad on screen could throw; painted rooms piled up in memory | Guarded; only the latest few rooms are kept |
| 173 | The wreck gave nothing; Records did not show it or a finished Camping; mid-build the job still said "Build shelter"; picking things up had no keyboard path | Wire, cable and a pot from the wreck; both in Records; the job names the build; Pick up the nearest, or walk over them |
| 174 | A job whose time read "½ h" got the time added a second time | Half hours are read as times |
| 175 | Feeding a smoker that was already going took a flat hour and a half, the same as cutting and hanging a full load | Half an hour to feed it; hanging takes about six minutes a portion |
| 176 | The animals on the map ran on real seconds while the game clock runs on distance walked, so the world's speed changed hunting: at 4x half of all approaches spooked the animal, at 44x none did and shots per game hour more than doubled | Wariness, wandering, fleeing, drift-ins and the bear all run on game time; at the tuned 11x nothing changes, and 11x and 44x now match (tests/timespeed.js) |
| 177 | In Camping, greens and nettles were out of season from day 2 (frost came eight days before the day-9 snow), so that lesson could never be done | The valley's frost comes two days before its snow |
| 178 | "Make a bow" counted as done once the stave was cut, so bare-kit players never got a bow, arrows or a hunt | It counts when the bow is made |
| 179 | The lesson chip pointed at the first lesson not done, which on 93% of days was one you could not do: the bow drill when you brought a ferro rod, tending the fire in daylight | Lessons have a state (done, covered by your kit, out of reach, later, a step away, ready); the chip points at what you can do now or its first step |
| 180 | In Camping, weight lost while learning never came back: meals were capped at the day's burn | In the valley a full ration can be up to 1.3x the burn when you are underweight and have the food |
| 181 | Starting Camping overwrote the run in progress: both used the same save | Camping has its own save; going into the valley from a run saves the run, and leaving puts you back in it |
| 182 | In Camping, the gift food for a lesson could be eaten before it was used; "nothing to clean" sent the player hunting instead of fishing | Lesson food is set aside until used; the first-step chain is clean, fish, make a handline, twist cord |
| 183 | Snow blindness checked for "Sunglasses", which was not on the kit list, so nothing could ever prevent it | Sunglasses can be brought; snow goggles can be carved from a pole or bone and cord |
| 184 | Elk were fully defined and drawn but lived in no place, so you could never meet one | Elk are big game on the Rainforest Coast (northern Vancouver Island has Roosevelt elk) |
| 185 | A hint in the fire mini-game looked for a canteen where the game never records one, so it never said "from the canteen" | It checks the kit |
| 186 | One function was never used (nearestTree) | Removed |
| 187 | "Letter from home" was checked for but is not a kit item; everyone gets the letter anyway | The check is gone and the letter is on the issued list on the setup screen |
| 188 | The forecast from reading the sky was stored and never shown again | It stays on the top bar until the day it is about |
| 189 | Failed fires were counted and never used | After three in a row, a hint says what usually fixes it; a lit fire resets the count |
| 190 | Jobs done, camp moves, hooks lost, times lost, fires put out in the shelter and chimney fires were counted and never shown | On the end screen, with distance walked |
| 191 | "Something alive in a snare" could never happen on the Rainforest Coast, Salmon Inlets, in Tasmania or Fiordland: their predator lists name no small hunter | Martens, quolls and stoats live there; the event can happen, a quarter as often as where the list names one (keeps balance within 5%) |
| 192 | Fiordland's podocarps grew but needle tea said "No conifers here" | Podocarp sprigs make tea |
| 193 | Bears in Sápmi and the taiga were called black bears | Brown bears there; grizzlies where listed; black bears elsewhere |

### Test-side problems (not game bugs)

- The test bot could not make do without gear. With no axe or saw it still aimed for a log cabin and never built anything; with no ferro rod it never made a bow drill; it gathered every material forever instead of what the shelter still needed, and stopped gathering once the shelter was up (so no drying rack or smoker). It now builds the best roof it has the tools for (a quick one first), makes a bow drill (and a stone blade for it), gathers what its shelter and camp works lack, breaks ice for water, and lifts the gill net once a day when the floats show a catch. The no-gear average went from 22 to 39 days. Because the bot changed, the balance reference was re-recorded with the new bot on the original game (median 62, mean 61.7); the current game is at 62 and 60.8 (−1.5%).
- With a ferro rod the bot never knapped a stone blade or twisted a handline early (it only did that on the way to a bow drill), so a ferro rod looked like it cost days. It now makes both early whatever it carries.
- The bot kept no cordage unless a build called for it, so with an auger it had no cord for set lines; it now keeps a few lengths. It also never did handwork by the fire unless it needed cordage (the game counts that toward keeping your will), so it now whittles; and it keeps a stone or pole to break the ice with. Balance reference re-recorded with this bot on the original game (median 63, mean 63.4); the current game is at 60 and 61.0 (−4.8%, −3.8%). Most runs end at a weekly medical check, so the median moves in whole weeks.
- The bot could not judge the bow or slingshot: it could only hunt blind. It now stalks once a day after the trapline (the map's own odds of seeing something, a typical player's aim) and carries a big kill home five loads a day. Balance reference re-recorded with this bot on the original game (median 63, mean 62.7); the current game is at 63 and 61.4 (0.0%, −2.1%).

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

Preserving pass (Nov 7): the test bot smoked nearly everything it caught and tended the smoker daily, about an hour a day, which cost it 210 kcal a day of fishing and hunting to save 40 kcal a day of spoilage. With the shorter smoker chore and a bot that keeps only what it cannot eat before it turns (and builds a rack or smoker only then), preserving is worth about 1% more days overall instead of 5% fewer. Reference re-recorded with this bot on the original game: median 67 → 65 days (−3.0%), mean 65.5 → 63.7 (−2.7%).

Not bugs, from the same review: the cache is never marked poorly built (only the smoker, woodshed, bridge, stove and net are); an open event such as the carcass is settled when you sleep, so it cannot stay stuck; the raft's materials are paid in the first session, like every two-part build; leather mittens are made from leather (the code is roundabout but right). tests/deadrefs.js now checks the whole file for this pattern on every run.
