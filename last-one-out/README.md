# Last One Out

A single-file survival game: pick a place and ten items, then outlast the other survivors.

Open `index.html` in a browser to play. Everything (game data, engine, UI) is in that one file.

Live version: https://claude.ai/artifact/9zr7wjnNT3b8se9xjqKGbp

## Fixes made before the bravery update (Nov 1, 2026)

- **Map freeze on rainy days.** The first animation frame could get a negative time step, which pushed the world clock below zero. The rain ripples then got a negative size, the browser threw an error, and the map stopped animating. The time step is now never below zero.
- **"Place 1" without winning.** Going home on the same day the winning rival finished showed "place 1 of 10". A tie with the winner now puts you second. Ties with anyone else still go to you.

## Food update: keeping food (Nov 1, 2026)

Keeping food now takes real time and can go wrong in real ways.

- **Drying rack** (new, Craft): 3 poles and 2 cordage. A tarp or 4 boughs roofs it. Holds 12 portions.
- **Hang meat and fish to dry** (new, at camp): fresh meat is about 72-75% water and keeps once it is under 15%. A few dry days on the rack; faster in sun and wind or near the fire, slower in cold, much slower in thick pieces cut without a knife. Rain on an open rack wets it again. Flies get into wet meat in warm weather. Days of wet air grow mould even under a roof. Dried meat keeps about four months while it stays dry.
- **Smoker** (changed): smoking no longer makes meat keep for a month in 90 minutes. Meat hangs in the smoker for two or three days over a fire that has to be fed (half a day of firewood a night). Hot smoke cooks the outside, so the meat is safe for a few days at once, and it keeps the flies off, but only drying makes it keep. Holds 8 portions.
- **Render fat** (new, at camp or by firelight): turns raw fat into tallow that keeps for months. A pot or pan keeps 85%; a flat stone by the fire only 65%.
- **Pemmican** (changed): needs 4 portions of dried meat and 2 of rendered fat. Meat that is still too wet is turned away with its water content shown, and nothing is used up. Calories are kept, not created, and the cakes keep for years.
- **Older saves**: smoked meat from before counts as dried, so it still makes pemmican. Raw fat has to be rendered first.
- **Balance**: over 510 bot games the median survival is unchanged (49 days before and after).

## Cooking update (Nov 1, 2026)

- **Bug fixed:** choosing "Raw" with a fire going carried no risk. Raw meat is now risky whether or not there is a fire.
- **Worms in pig and predator meat:** boar, warthog, fox, wolverine, marten, weasel and otter can carry trichinella. Eaten raw it is about a 15% chance; roasted, thick pieces can stay pink inside (about 3%); a stew in a pot is safe. Drying does not kill them. Symptoms arrive 7 to 12 days later, and the log names the meal and the day.
- **Raw fish** now carries a small risk of food poisoning (it had none).
- **The drying rack shows on the map**, with strips that darken as they dry and its roof if it has one.
- Balance: median survival over 510 bot games unchanged at 49 days.

## Fire and stoves update (Nov 1, 2026)

- **Damp tinder:** tinder picked in rain or fog is damp (birch bark stays dry, punk wood mostly dry), and tinder left out in the rain with no roof or tarp soaks up water. It dries by the fire or under a roof. Damp tinder makes a ferro rod less reliable, and a bow-drill ember will not take in tinder over 20% damp.
- **Stone hearth** (new, 6 stones): the fire uses 15% less wood, storms and wind put it out less often, it throws more heat, and the warm stones keep some cold off after the fire dies in the night.
- **Soot in the chimney or stovepipe:** builds every night with the fire inside, faster with green wood. Signs show first; over 80% the flue spits sparks and can catch, scorching the roof. "Check the roof" sweeps it.
- **Smoker flare-ups:** fatty fish and meat drip onto the coals; without a pot or pan underneath, the smoker can catch fire, burning some of the batch and needing a rebuild.
- **Chink the walls** (new, for a debris hut, rock shelter or cabin): 4 moss or 3 clay, plus tallow for a tighter seal. Cuts drafts so the shelter holds about 15% more heat. Cracks over time, faster in storms and hard frost.
- Balance: median survival over 510 bot games unchanged at 49 days.

## Tools and materials update (Nov 1, 2026)

- **Dull axe:** chopping with a dull edge costs more effort and the axe glances off into your leg more often.
- **Sharpening without a whetstone:** an axe can be honed on a flat river stone, but only to a rough working edge. The sharpening stone still gives a full edge.
- **Axe heads work loose:** every chopping job loosens the head a little, twice as fast in hard frost. Signs come first; ignored, the head flies off and the axe is useless until refitted. "Refit the axe head" takes a carved wedge (needs a knife if the head is off); a strip of wet rawhide shrinks tight as it dries and makes it loosen half as fast.
- **Bursting hearth stones:** river stones have water inside; in the first three fires of a new hearth one can burst.
- **Clay needs temper:** clay chinking with no moss worked in shrinks and cracks as it dries, losing much of its seal in the first days.
- The axe's edge and head show on the camp panel.
- Balance: median survival over 510 bot games unchanged at 49 days.

## Light and cooking update (Nov 1, 2026)

- **Night work needs light:** after dark, jobs need a fire or a lamp. Inside a shelter in the dark you can still talk to the camera, rest, or twist cordage by feel; carving, sewing and the rest need to see.
- **Fat lamp** (new craft): a flat stone dish, a moss or cordage wick, and rendered tallow. It lights a shelter even when the fire is outside, and steady lamplight takes away the morale cost of working at night. It burns about a fifth of a portion of tallow an hour of work. Indoors it is occasionally knocked into the bedding.
- **Bone broth** left on the coals with the fire burning all night comes out 45% richer by morning.
- Balance: median survival over 510 bot games unchanged at 49 days.

## Water, hygiene and bedding update (Nov 1, 2026)

- **Salvaged cans:** an oil drum, fuel can or bleach jug found on the shore still holds water, but water carried in it can make you sick from what it used to hold. Boiling does not help. "Scrub out a salvaged can" (hot ash and sand by the fire) makes it safe.
- **Hands after butchery:** cleaning a catch or dressing a carcass ends with a rinse. With soap your hands come out clean; with cold water alone a little grease stays and there is a small chance of a stomach bug.
- **Gut piles:** mammal and bird guts left at camp draw raiders to your food and bring flies in warm weather, fading over about a week. Fish guts go back in the water or the bait tin. "Bury the guts" in a pit (proper with a shovel or digging stick, a shallow scrape by hand) clears it.
- **Bough bed** (new): 8 boughs, cuts the night cold by up to 15%, packs down over about a month, 4 boughs fluff it back up.
- **Correction:** a dull axe no longer costs extra energy per hour on top of the wood it already loses. It still slips into your leg more often.
- Balance against the original game: median 48 days (was 49), mean 47.8 (was 49.9).

## Shelter and sleep update (Nov 1, 2026)

- **Snow on the roof:** each snowfall adds weight; it melts off above freezing. A heavy load wears shallow roofs (tarp, lean-to) much faster than a steep debris hut, rock shelter or cabin, with warnings first. "Clear snow off the roof" takes it off. A moderate layer on a walled shelter insulates it.
- **Fire reflector** (new): a chest-high wall of poles behind an outdoor fire throws heat into an open lean-to or tarp camp.
- **Raised bed frame** (new, 6 poles, 2 cordage): gets the bed off the frozen ground; with a bough bed, about a quarter less night cold.
- **Cabin logs shrink:** about four weeks after a cabin is finished, its green logs have dried and gaps open, and the cabin is draftier until it is chinked.
- **Snowshoes:** walking in deep snow without them takes a quarter longer at double the effort; with them it costs 60% less effort.
- Balance against the original game: median 48 days (was 49), mean 47.8 (was 49.9).

## Pottery update (Nov 1, 2026)

- **Shape a clay pot** (3 clay, plus a stone pounded to grit if you have one).
- **Drying:** about a week in the air, about four days by the fire. Rain softens pots drying in the open; plain clay with no grit can crack if it dries too fast by the fire.
- **Fire the pots in a pit** (needs a fire and 2 days of firewood): dry pots with grit mostly come out whole, plain clay fails more often, and a pot fired while still damp usually bursts.
- **A fired clay pot** does what a pot does: boil water, stews, bone broth, needle tea, rendering fat, a drip pan under the smoker. It carries one potful of water, and now and then it cracks on the coals.
- Pots drying and fired pots show on the camp panel.
- Balance unchanged: median 48 days, mean 47.8 (the original game: 49 and 49.9).

## Reading the land update (Nov 1, 2026)

- **Traps left unchecked:** a catch left in a snare overnight has a 15% chance each night of being taken by a fox or something bigger.
- **Look for game sign** (new, on a trail, 30 min): snares set the same day go on the runs the animals really use and catch half again as often.
- **Read the sky** (new, late in the day or after dark, 15 min): a forecast for tomorrow. Right about 65% of the time at first, rising to 85% with practice.
- **Smoke your clothes** (new, by the fire, 30 min): masks your scent; hunting goes 20% better that day and the next.
- **Thin ice:** for about ten days after freeze-up, fishing or netting on the new ice can put you through it, soaked and chilled.
- Balance against the original game: median 48 days (was 49), mean 48.2 (was 49.9).

## Clothes and spirits update (Nov 1, 2026)

- **Clothes wear out:** chopping, cutting, hauling boughs, hunting and tracking through brush wear them a little, and storms with no real shelter more. Worn clothes let up to 20% more cold in. The camp panel says when they are worn or in rags.
- **Mend clothes and bag** (new, by day or by firelight, 1 hour): the first time, carve a bone needle (needs a knife and a bone); each mend uses a length of cordage as thread. It patches a hole in the sleeping bag (until now those were permanent), or puts back 90% of the warmth worn clothes had lost.
- **Tea by the fire:** a hot drink and a warm fire at the end of the day lifts your spirits.
- Balance against the original game: median 48 days (was 49), mean 48.1 (was 49.9).

## Hunting and fishing details (Nov 1, 2026)

- **Fine leader** (new craft, for a homemade handline): a strand of sinew from a hide between hook and cord. Fish bite about 30% more, except in muddy flood water.
- **Ice holes freeze over:** below -5 C the first ice-fishing session of a day costs half an hour of chopping. Set lines left in the ice below -15 C often freeze in, and the hooks are lost.
- **Blood trails:** fresh snow or rain makes a wounded animal harder to follow.
- **Arrows:** made by a fire, the shafts are heat-straightened. Made without one, they are crooked, and a quiver of crooked arrows hits up to 30% less.
- Balance unchanged: median 48, mean 48.1 (original 49 and 49.9).

## Materials details (Nov 1, 2026)

- **Brittle cordage:** bark twisted dry in hard frost (below -5 C) cracks, giving about a third less cordage, unless there is a pot of water at camp to soak it in, or the air is damp.
- **Scrape and soften a hide** (new, by day or firelight, 2 hours): soft leather. A leather patch makes worn clothes as good as new, and mittens sewn from two pieces of soft leather are warmer than rawhide ones.
- Balance unchanged: median 48, mean 48.1 (original 49 and 49.9).

## River crossings (Nov 1, 2026)

- **Wading the ford** wets you to the knees and, in cold weather, wears on you. Now and then a stone rolls underfoot and you go in to the chest.
- **Cut a wading staff** (new, one pole): a third leg in the current; slips are 80% rarer.
- **The log bridge** keeps you dry.

## Double-tap protection (Nov 1, 2026)

- Tapping the same job twice in quick succession on a phone now runs it once. Before, a double tap on Rest spent four hours instead of two.

## Bow and landmarks (Nov 1, 2026)

- **Carve a bow** (new, two sessions, needs a knife): split a stave from a pole and rough out the limbs, then tiller and string it (2 cordage). A homemade bow casts a little weaker than a bought one, and you make its arrows yourself. A first bow often comes out with uneven limbs, which costs a quarter of its power; **re-tiller the bow** to even them up (works about 60% of the time).
- **Landmarks:** every map now has five you can steer by: a lightning pine, a split boulder, a bare knoll, a standing stone and a blazed spruce. They are drawn in the world and named on your map once you have been near them. Existing maps keep their layout.
- **Build a cairn** (new, 4 stones, anywhere away from camp): a knee-high stack you can see even in fog. Shown on your map.
- **Losing your bearings:** in fog, snowfall, a storm or the dark, more than half a kilometre from camp, every hundred metres you walk can cost half an hour going in a circle. With one landmark or cairn in sight the risk halves; with two there is none.

## Hands-on crafting (Nov 1, 2026)

The crafts added in the realism update are now done by hand. How well you do it changes the result:
- **Carve a bow:** drive wedges to split the stave, then tiller it: shave the stiffer limb until both bend the same and string it. Done well, the limbs come out even almost every time; shave too much and the bow goes weak. Re-tillering works the same way.
- **Fat lamp:** hold to pour the tallow and stop at the line. Overfill it and some is lost in the ashes.
- **Fine leader, arrows, clay pot, mending:** alternate two moves in rhythm (twist and wet; warm and bend; coil and smooth; stitch and pull). More than a slip or two makes a worse job: a leader can snap, arrows stay crooked, a pot has a flaw that cracks in the firing, a patch holds less.
- **Scraping a hide, chinking walls:** long even strokes. Too hard and a hide can tear through; slapdash chinking seals less.
- **Firing pots:** feed the pit a stick at a time and keep the heat in the band. Let it flare and pots crack.
- **Cairn, hearth, bough bed, wading staff, drying rack, reflector, bed frame:** tap each stone, bough, knot or joint.

## Stone, weaving, joints and a raft (Nov 1, 2026)

- **Glassy stone:** gathering stones sometimes turns up a fine-grained piece that rings when tapped.
- **Knap a stone blade** (new, hands-on: strike along the edge): needs a glassy stone and a hammerstone. It can fall apart on a hidden flaw, less often with careful strikes. It works as a knife if you came without one, but it is brittle and snaps now and then.
- **Weave a door mat** (new, hands-on: over and under): 4 bark, 2 cordage. Hung over the shelter door, a tight weave cuts the cold of a windy night by about a tenth; a loose weave much less.
- **Cabin joints:** the cabin's building sessions are notching. A sloppy notch leaves a loose joint, and a cabin with loose joints wears up to twice as fast in storms.
- **Build a raft** (new, two sessions, 4 logs and 4 cordage): fishing from it in deeper water gets about 30% more bites, wind can roll it, and left in the water it soaks up 5% of its float a day until you pull it up to dry.

## Bear spray, climbing, noise and the latrine (Nov 1, 2026)

- **Bear spray:** in bear country your safety kit holds a can with two good blasts. When a bear comes into camp, spraying it turns it about 90% of the time; otherwise the wind takes it and the bear leaves with some food.
- **Climb the rock for a look around** (new, at the rock face): from the top a wide stretch of your map fills in. Wet or icy rock makes a fall likelier; with a rope anchored above (Rope, Paracord or 4 cordage) the chance is under 1%. An unroped fall can sprain an ankle, or end the run.
- **Noise when stalking:** rain, fog and falling snow hide your steps; the dry leaves before the snow and a hard winter crust give you away.
- **Dig a latrine** (new, at camp): without one the ground near camp and the water get fouled over the weeks, and untreated water makes you sick more often. A latrine dug downhill, away from the water, lets it clear; it lasts about a month.
- Balance against the original game: median 48 days (was 49), mean 48.0 (was 49.9).

## Hands-on for the older crafts (Nov 1, 2026)

The rest of the crafting is done by hand too: carving a bow drill, twisting a handline, grinding gorge hooks, charring a digging stick, tying a lure, knotting a net, lashing a smoker, food cache, woodshed and log bridge, staking a fish trap, punching a can stove, laying a clay chimney, pounding pemmican, bending and lacing snowshoes, and sewing mittens. Where a sloppy job matters, it costs: slack snowshoe lacing sags, loose mitten stitches let the cold in, a well or badly lashed cache is stronger or weaker against animals, gaps in a fish trap let fish out, badly mixed pemmican goes rancid in a couple of months, and a rough chimney fouls with soot faster.

## Smoking, bridges and splints (Nov 1, 2026)

- **Hot or cold smoke:** "Hot smoke" works as before: it cooks the outside, so the meat is safe for a few days, and dries it fastest, but fatty drips can flare. "Cold smoke" is a smoulder with no flame: half the wood and no flare-ups, but it does not cook the meat and dries it slower, so fresh fish can spoil in mild weather before it is dry.
- **The log bridge:** the flood the morning after a storm can tear a log loose (about a third of the time); it needs re-lashing. Wet logs are slick and now and then put you in to the thighs.
- **Splint the injury** (new, hands-on): for a sprain or a broken bone. It halves the pain and takes three days off; set crooked, it adds three. A bad unroped fall from the rock can now break a wrist rather than always ending the run.

## Learning by consequence (Nov 1, 2026)

The game never tells you how to survive; things happen, and the journal keeps track.
- **Field notes:** the journal now opens with notes on what you tried and what came of it: mushrooms you ate and what they looked like, worms from a meal days earlier, a plant that made you sick, a test that came back clean.
- **Look-alike plants:** now and then a root or a handful of greens is the wrong plant, and it makes you badly sick. "Look closely before you pick" (15 minutes) makes that rare for the rest of the day. The details are invented on purpose, so nobody takes them as a real-world rule.
- **Berries you do not know:** eat a handful (about a third of the time you are sick), spend the rest of the day testing them (right about three times in four, never certain), or leave them.
- **Cold that creeps up:** after wet or exposed nights with no fire in a row: hard shivering, then clumsy hands the next day (a fire is harder to light), then slurred words and a strange warmth. One warm night breaks it.
- **Smoke in a shut cabin:** a fire inside a sealed cabin with no chimney or stove gives dull headaches and heavy sleep; sealed tight with a door mat, now and then you wake confused and sick.
- **Direction:** a shadow stick on a sunny morning gives you a heading that keeps you on course for the rest of the day, even in fog later. Checking which side the moss grows on tells you nothing; it grows on every side here.
- **Fixed while testing:** getting lost had briefly become certain on every check because of a code slip; caught by the new tests.
- **Balance:** the test bot now gathers tinder so it can relight its fire (before, it often could not, which skewed every comparison). Against the original game played by the same bot: median 56 days both, mean 56.4 vs 55.9.

## Bug hunt (Nov 2, 2026)

A whole-game bug hunt (see TESTPLAN.md and BUGS.md) found and fixed 84 bugs. The ones you would notice:
- **Resting all day no longer keeps you going.** A break after a job still lifts you. Lying about with nothing done gives a little once a day and nothing after, so a run of only resting now ends around day 30 to 35 instead of lasting up to two months.
- **Cleaning birds and fish gives bone and feathers again.**
- **"Check which side the moss grows" no longer gathers moss.** Gathering moss is its own job again.
- **Bears sleep in winter:** no bear on your kill once they are denned.
- **Paid shelter materials are not lost silently.** Dropping a plan gives back what is not built in; moving camp or a collapse saves about half.
- **Set lines need bait** to catch well, and the same illness no longer stacks two or three times.
- **Hanging meat is eaten last,** so a rack of drying meat lasts until it is dry.
- Over-shaving a bow leaves it weak; a homemade bow with no arrows no longer blocks the slingshot.
- Raft fishing tires the water like fishing from shore.
- **Space no longer ends your day by accident.** Turning in early with real light left goes last and asks twice.
- **Distances are right:** "back to camp" and map pins showed kilometres 9.5 times too large.
- **Reloading keeps you where you stood,** and a bear, grouse or carcass you were dealing with comes back with you.
- **Fumbling matters:** a missed bite costs most of the fishing session, a ferro rod left unblown goes out, and a rushed bed or roof repair comes out worse.
- **Phone screens:** long messages wrap, things to pick up show above the trees, map labels no longer overlap, and the Craft menu is always there at camp.

## Checked and clean

- Engine: 1,360 random runs and 255 bot runs across all 17 places, up to day 100. No errors, no broken numbers.
- Old saves from the version before the rival rename load in all 17 places, with the new names and no errors.
- End screens for winning, being pulled and tapping out, in all 17 places, at phone width.
