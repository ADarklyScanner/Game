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

From the plan's architecture: double-tap protection is done (the same job tapped twice within 0.4 s runs once). Not built: a general job scheduler and typed material lots in kilograms. Drying racks, the smoker, pottery and lamps already run as day-by-day jobs on the game's own clock, and portions stay the unit, as agreed.
Each system is built directly on the game's existing rules instead, which keeps saves and balance safe.

## Hands-on crafting

The newer crafts are done by hand, like the original fire-starting and cordage pieces. Done well they come out better; rushed or sloppy, worse:
splitting and tillering a bow, pouring a fat lamp, twisting a sinew leader, trimming a wading staff, straightening arrows, scraping a hide,
chinking walls, coiling a pot, firing pots in a pit, mending, stacking a cairn, setting a hearth, laying a bough bed, lashing a drying rack,
fire reflector, bed frame and raft, knapping a stone blade, weaving a door mat, and notching cabin logs.
The older crafts are hands-on too: bow drill, handline, gorge hooks, digging stick, lure, net, smoker, food cache, fish trap, can stove,
clay chimney, woodshed, log bridge, pemmican, snowshoes and mittens.

## Smaller details

Hot and cold smoking, bridges torn loose by floods and slick when wet, and splints for sprains and broken bones: done.

## Learning by consequence

Field notebook, look-alike plants and looking closely, unknown berries (eat, test for a day, or leave), cold that creeps up in stages, smoke in a shut cabin, shadow stick vs the moss rule: done.

## Whole-game bug hunt

Steps 0 to 3 of TESTPLAN.md (inventory, coverage, every action and event, eight player styles) plus helper reviews of the engine, the screens, saves from every old version and a fresh-eyes playtest: done, 84 bugs fixed, listed in BUGS.md. Engine fixes each have a regression check (tests/regress.js); screen fixes were checked in the browser.

## New look: grown-up watercolour (design/STYLE.md)

- Phase 0, foundation: done. Typefaces bundled in the file (no internet needed), place palettes, painting helpers, paper grain, and the picture sheet (`tests/sheet.js`).
- Phase 1, top bar and tool roll: done. Quiet numbers along the top, jobs grouped by tool on a canvas roll with a paper card, big paper buttons for mini-games and choices.
- Phase 2, the land: done. Ground, water, river, paths, stones and bedrock painted in washes in each place's palette, a seamless paper texture, muted colours, and light tints from the palette. Drawing is about as fast as before.
- Phase 3, trees and plants: done. Every tree look in every place painted in watercolour (by age, season and variant), painted berry and rose-hip bushes, muted small plants, logs and stumps. About as fast as before.
- Phase 4, camp and shelters: done. The fire, every shelter (sleeping out, tarp, lean-to, debris hut, rock shelter, cabin) sound, worn, broken and in snow, the hut, rock shelter and cabin half built, and the rack, smoker, cache, woodshed, firewood, materials, catch, clothes line, raids, piles and cairns, all painted. 21 new pictures on the sheet. Drawing speed unchanged.
- Phase 5, animals, people and tracks: done. All 36 animals painted in three poses and dead, the bear, the player, carcasses, tracks, snares and deadfalls, wreck debris, landmarks and boulders. 5 new pictures on the sheet. Drawing speed unchanged.
- Phase 6, interiors: done. Inside the tarp, lean-to, debris hut, rock shelter and cabin, sound, worn and broken, with the land, sky and weather through the doorway, daylight and firelight, and you sitting by the fire. The room sits above the job list on phones. 11 new pictures on the sheet.
- Phase 7, mini-games: done. Every hands-on close-up has a painted setting and watercolour art; the trout, grouse, hare, deer, fire-lighting, whetstone, snare, cairn, hearth, cordage and pot-firing have their own paintings, and lashing frames are real poles. Fixed poles vanishing from the camp art. 20 close-ups on the sheet.
- Phase 8, panels: done. Paper panels, a notebook for the journal, body and notes, a canvas pack, an ink-and-wash map that starts blank and fills in, the setup and end screens on warm canvas with paper cards, and the slashed-zero face removed. 9 more panels on the sheet.
- Phase 8b, the rest of the graphics: done. Pickups, small plants, moss, tree ferns, the skyline, event paintings for all 22 events, badge stamps, the end painting, crafted things inside, painted icons, and the moving bits muted. Drawing speed unchanged.
- Phase 9: not started.

## Ideas for later (not started)

- **Look:** a grown-up watercolour style that fits among Steam survival games but has its own character (mock-ups in progress, nothing changed in the game yet).
- **Easy and hard modes:** hard mode hides the numbers; the body tells you through notes in the margin, frost at the screen edges and the watch and journal.
- **Clothing and layers** (design/CLOTHING.md): what you wear changes through the day (jacket off on a mild day, layers on at rest, a dry set for sleeping), every issued piece does something, wear and drying per piece, and a one-tap "Dress for the weather".
- **Wreck achievement:** finding the crash site in each place is already recorded (`records.wrecks`); the achievement itself comes with the unlocking system.
- **Set levels and unlocking:** built Nov 4 (see below). Still to come: the wreck achievement on top of it.

## Gear budget (Nov 4)

An optional rule on the setup screen: **Any ten** (as before) or **Budget · 20 points**. Each item costs about a point for every 0.65 days it adds in a full kit, from the gear simulation (`tests/gearsim/budgetkits.js` fitted with the 10-item kits): the gill net 12 (it would be worth 15), fishing gear, the axe and the sleeping bag 4, down to 1 for the small things. The bow and the ferro rod are costed by hand. The ten most common items come to 26 points, so a budget kit means giving something up. The run remembers the rule (`opts.budget`) and the end screen shows the kit's points.

## Unlocking places (Nov 4)

The 17 places sit in five difficulty groups (Forgiving, Tough, Hard, Very hard, Brutal). A new player has the forgiving three. Last 30 days, or outlast half the field, in any place of a group and the next group opens; the end screen says so. Places you have played (including through the daily challenge) stay open, so nobody with old records loses a place, and **Open every place** in More options turns unlocking off. The daily challenge is always open.

The bow (Nov 4): a shot at an animal you can see now takes about an hour, not the 3.5 hours of a blind hunt, and a slingshot almost never drops big game. The test bot stalks once a day with a bow or slingshot (after the trapline, before fishing), with the map's own odds of seeing something and a typical player's aim, and carries a big kill home five loads a day. With that, the bow is about even over 60 days; runs with a big kill in game-rich places last 7 to 16 days longer.

## Nov 6: the specs, built

- **Show-independence pass** (all 4 steps): per-place special cases are data, difficulty calibration is frozen into each place, found-item text is generic, the auger is shown as "Hand auger". Golden runs (tests/golden.js) and an old save (tests/oldsave.js) guard it.
- **Skills backlog** (design/SKILLS-BACKLOG.md): all 14 Builds in: dew, ice vs snow, rain catchment, star fire, char cloth, fire-hardened stakes, crooked arrows without fire, snow cave, door orientation, scout reports, the kill clock, named greens and mushrooms with field notes, tree species.
- **UI spec**: tile grid with line icons and chips (4.2), HUD icons (4.7), build picker with quality pips and have/need chips (4.3), drop-site chips (4.6), the menu as a tabbed notebook (4.5). Not done: anchored popovers on world objects and ghost placement (the tiles already group by tool), the camp-site popover.
- **Mini-game brief**: reel in, numb-hands warning, let down the bow, slips cost, nothing done is nothing built, Not now everywhere, hands remember (head start) and the usual way (quick mode), forage and shore search by hand, fish that fight three ways, thread crafts paced, wet crafts darken as you work them, lashings show their binding. Everything in the three specs is in.
- **In-game self-check** with #selfcheck.
- **Camp-site report** (UI spec 4.1): water, wood, wind, ground and hazards as chips, with the reasons under "Why".
- **Tracking forks** (brief 4.2): partway along a blood trail it splits; read the sign (fresh blood low on the leaves, or old crumbled prints) and choose. A wrong turn costs half an hour and the trail goes colder.
- **Trapline** (brief 4.2): each set has its own state when you reach it: a catch, robbed by a fox, loops knocked flat, buried by snow, or empty with fresh or old sign. Wind knocks some empty loops flat overnight and a flat loop catches nothing until someone walks out and resets it; head back early and the sets you skipped stay flat and keep what is in them. Balance after: median 63 to 63 days, mean 62.7 to 61.1 (-2.6%).
- **Cooking** (brief 4.6): hold the food into the coals to cook fast or leave it at the edge, slow and even; turn it before the underside chars and take it off when the middle is done. Charred, just right or cold in the middle comes from your hands, not the dice.
- **Water after rain** (brief 4.6): the water runs brown, and boiling offers a filter to build first (gravel, charcoal, sand, grass, bottom up). Boiled is safe either way; a good filter makes it clear.
- **Camp layout** (brief 5.7): a grid around the shelter with the fire, woodpile, cache and racks where they stand, the storm wind and the water marked. You place the kitchen and the latrine. A kitchen by the bed draws bears and raiders half again as often; one out and downwind keeps them off. A latrine that drains to the water fouls it, one too close smells, one upwind blows in on stormy days, and one well out cleans up faster. Storms now come mostly from one quarter, the same all run. Both show in the camp painting.
- **Raft** (brief 5.8): pick the logs (standing dead trunks take an hour more but soak up slower; green ones are at hand), then cross-lash the deck. On the water, drag to pole against the wind drift out to the dark water over the drop-off and hold there; when a line of wind comes across the water, hold Crouch or the gust rolls you. Missing the drop-off fishes the shallows.
- **Crafts by hand** (brief 4.8): knapping (pick a spot, strike at a glancing slant; too square crushes the edge, too flat glances off and can split the core), stitching mittens, mending and lacing snowshoes (draw the thread hole to hole; rushing leaves slack stitches), scraping hides (slow strokes bite deep; keep working a clean spot and it thins and tears), coiling pots (each coil to the same thickness and smoothed in before the next), straightening arrows over the coals (bent cold springs back, held too long scorches), netting (each loop snug to the gauge), pemmican (pound to powder, then about half and half tallow).
- **Butchery by animal** (brief 4.7): the knife's speed is its depth (drag it slowly and it sinks into the gut). Birds are plucked toward the tail first (against the grain tears the skin); small game is opened then skinned with steady pulls (a jerk tears the hide); big game is opened, the guts eased out without letting the tension build (or the bladder bursts over the meat), skinned, and quartered at the joints (cutting bone costs time).
- **Slicing for the rack**: draw each cut; even finger-wide strips dry through, fat ones stay wet in the middle.
- **Bedding and damage** (brief 5.5, 5.6): bedding soaks up leaks, wet clothes and thaws, and damp bedding holds little warmth until you air it on a dry day. A storm that does real damage names the part (frame lashings, wall chinking, roof), and the repair job is for that part. The camp page shows how the shelter holds up: warmth, dry, wind, strength, air, bedding, fire safety, pests, each with what is wrong. Balance after: median 63 to 63, mean -2.9%; the wettest coast (US-S1) is 11% harder, which is right.
- **Felling** (brief 4.4): read the lean (and wind), pick where it falls, cut it, and step clear when it cracks. Against the lean it may go its own way; into another tree it hangs up; toward camp it can smash the shelter; standing at the stump, the butt kicks back.
- **Snares and deadfalls**: choose the spot (the pinch between two bushes catches more; beside the trail nothing walks), size the loop, then cover it or leave it bare (scent and outline make it a poor set). Deadfalls start with a figure-4 trigger built in order.
- **Moving camp by raft** (brief 5.8): from a shore camp to a shore site, the raft carries what four backs would; load the deck so it rides level, or the water comes over one side and takes food with it.
- **Best camp** (brief 5.9): each run remembers its best camp (the shelter and what was built round it), and Records keeps the best of all.
- **By the fire and the water** (brief 4.1, 4.5, 4.6, 4.7): set lines (read the water and choose each line's depth: deep in heat and cold, shallow on a spawning run), checking the net (back each fish out tail first; pull forward and the gills catch, tangle, and tear the mesh), tending the fire (softwood flares, hardwood holds coals, green wood smokes; let it die and it is out, let it roar and it throws sparks on the roof), the smoker (keep a thin blue smoke; a flare case-hardens the strips), rendering (simmer and skim, or it scorches), melting snow (a splash of water first and handfuls as it melts, or the pot scorches).
- **More to read in a camp site** (brief 5.2): low, damp ground is a cold-air hollow (colder on clear, still nights); open to the east, the morning sun dries you and your bedding; still water nearby breeds insects that cost you will on warm nights unless the fire is smoking; a berry patch draws bears and raiders. Each shows in the site chips and under "Why".
- **Review fixes**: the hint chip now names damage to fix and damp bedding to air; How to play has a "Your hands" section; tile labels no longer end on filler words; the end screen and Records show your best camp.
- **Pop-ups on the map** (UI spec 3.5, 4.1, 4.4): tap a tree, bush or game trail anywhere for a pop-up with its jobs and yields; choose one and you walk there and start it. Before camp, tapping open ground drops a ring with a site report and "Camp here".
- **A roof on the raft** (brief 5.8): fish and move camp dry in the rain; it catches the wind, so gusts hit harder.
- **Tuning harness** (brief 3.5): tests/minitune.js plays the timing mini-games as three kinds of player. It found that cooking hid "take it off" behind "turn it" (fixed), that knapping was too tight for an average player (widened), and that chopping was too easy (tightened).
- **Hydration**: a water meter on the HUD. It drains with the hours, faster in heat and hard work and in dry country; drinking fills it (at the water's edge, working at a camp near water, from the pot, boiling, tea, melting snow). Below 30 you are warned; at 0, every hour of work costs health and will. A drink from the pot is a job at camp, and the hint line says when you are thirsty. The night still asks whether you had water at all that day.
- **Camping** (a third way to play, beside the daily challenge and the drop sites): a small valley (about 340 by 230 m) by the sea, with a lake, a river and ford, a pond, a bog, the rock face, the old ruin and the wreck across from where you land. Every fish, animal and plant from the drop sites, big portions and high odds, everything regrows overnight (felled trees too), snow about day 9 and ice about day 13 so the winter jobs come round. No rivals; health and will cannot fall low enough to end it; it is not recorded. 51 lessons in eight groups (camp and water, fire, shelter, food from the water, food from the land, keeping food, tools, further afield): the chip at the top shows the next one and opens the list, each lesson says how and Show me walks you to the place, and each one ticks off when you do it.
- **Review fixes (Nov 7)**: Camping reloads and cannot end but by the button; hands-on chances come from the run's seed; keyboard play for every hand mini-game; head starts on the newer crafts; a varied cabin build; drawn mushrooms; field notes dated; leaves fall in autumn and the trees lean with the wind; you are seen asleep; finishing every Camping lesson points you at a real drop. Not changed, on purpose: rivals stay scripted (the show's format), the difficulty labels stay bot-measured (they rank places right; absolute days for a person depend on their hands), the map's walk-to point is not pathfound (you walk round trees and the river turns you back at the bank).
- **Second review (Nov 7)**: floats over the right vitals (and one for water); no walking while inside, and results shown there; beach debris picked up for sure; turn-in confirmation kept in the More sheet; the weight chart's real limit; a short cabin keeps its roof; stalking the trail is its own creep (step over dry patches, mind the wind) before the shot; the Camping site has a billy can and lessons say what is missing; the wreck gives wire, cable and a pot; Records shows the wreck and a finished Camping; the build job names the build; picking up by keyboard. See BUGS.md 161-173.
- **Place numbers re-simulated (Nov 7)**: the per-place numbers (a typical player's days, how often a careful player wins) were still the ones baked into the original data. tests/difficulty.js now plays 300 games a place on the current game and writes them in; 13 of 17 places changed difficulty group. A group once open stays open, and beating a place opens the group after it, so a reshuffle never locks anyone out. Seen while doing it: the test bot does better without preserving food, and with a mixed kit than with the ten most-picked items.
- **Preserving balance pass (Nov 7)**: feeding a smoker that is already going is half an hour, and hanging meat takes about six minutes a portion (it was a flat 1.5 hours). The test bot now dries or smokes only a real surplus, and builds the rack or smoker only when there is one. Preserving went from costing about 5% of days to adding about 1%; it is now the best way to play in 9 of 17 places (was 1). The hint to hang meat waits for a real surplus too. Place numbers re-simulated after it: three places moved one group easier.
- **Shelter stages** (brief 5.4): each session of a build is its own job. Debris hut: lash the frame, then shingle the roof bottom-up. Rock shelter: stack the wall, lash the frame, chink the gaps. Snow cave: dig it out, open an air hole. Cabin: notch the logs, then chink. A rushed or out-of-order stage leaves a weaker shelter and a leak in the roof that wets you on rainy nights; a proper patch closes it. The action shows the next stage, the camp page shows the leak, and the hint line warns when rain is coming.

## Left out on purpose

Trading and social contact: dropped, the game stays solo.

Things that only pay off over a longer time than a run lasts: farming and crop growing, bark girdling (it kills a tree over years), and the plan's general job scheduler and kilogram material lots (internal plumbing with nothing to show a player).

## Rules every phase follows

- `tests/run-all.sh` must pass before anything is published.
- Bot survival (median and mean over 1,020 games) must stay within 5% of the original game played by the same bot. The bot was improved on Nov 3 and 4 (it makes do without gear), so the reference was re-recorded with it on the original game: median 63, mean 62.7 days (re-recorded after the bot learned to stalk).
- Standing now (Nov 7, reference re-recorded with the surplus-preserving bot): median 65 vs 67 (-3.0%), mean 63.7 vs 65.5 (-2.7%).
- Saves from older versions must keep loading.
