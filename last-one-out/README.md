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

## Checked and clean

- Engine: 1,360 random runs and 255 bot runs across all 17 places, up to day 100. No errors, no broken numbers.
- Old saves from the version before the rival rename load in all 17 places, with the new names and no errors.
- End screens for winning, being pulled and tapping out, in all 17 places, at phone width.
