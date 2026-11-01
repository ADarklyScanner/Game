# Last One Out

A single-file survival game: pick a place and ten items, then outlast the other survivors.

Open `index.html` in a browser to play. Everything (game data, engine, UI) is in that one file.

Live version: https://claude.ai/artifact/9zr7wjnNT3b8se9xjqKGbp

## Fixes made before the bravery update (Nov 1, 2026)

- **Map freeze on rainy days.** The first animation frame could get a negative time step, which pushed the world clock below zero. The rain ripples then got a negative size, the browser threw an error, and the map stopped animating. The time step is now never below zero.
- **"Place 1" without winning.** Going home on the same day the winning rival finished showed "place 1 of 10". A tie with the winner now puts you second. Ties with anyone else still go to you.

## Checked and clean

- Engine: 1,360 random runs and 255 bot runs across all 17 places, up to day 100. No errors, no broken numbers.
- Old saves from the version before the rival rename load in all 17 places, with the new names and no errors.
- End screens for winning, being pulled and tapping out, in all 17 places, at phone width.
