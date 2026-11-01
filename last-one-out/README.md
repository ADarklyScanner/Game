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

## Checked and clean

- Engine: 1,360 random runs and 255 bot runs across all 17 places, up to day 100. No errors, no broken numbers.
- Old saves from the version before the rival rename load in all 17 places, with the new names and no errors.
- End screens for winning, being pulled and tapping out, in all 17 places, at phone width.
