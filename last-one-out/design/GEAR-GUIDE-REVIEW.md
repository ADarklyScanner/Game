# Review: "Complete Survival & Gear Analysis Guide"

Checked against the game as it is on Nov 3, 2026 (after the water round and the upkeep fixes), using the game's own data and a fresh simulation.

## Verdict

Sections 1 and 3 (the gear list and the catch tables) match the game. Section 2 is right on temperatures, freeze dates and animals but wrong on every resource multiplier. Sections 4 to 7 (the simulation, the single-tool matrix, synergies and loadouts) do not match the game and contradict each other, so they should not be used for balance or player advice. Section 8 (progression) orders the places close to backwards: its two starter places are among the hardest, both in the real show and in the game.

## Section by section

**1. Gear list.** All 28 items and every selection rate match the game. Claims the game does not support:
- Shovel: the game has no water holes or wells. The shovel digs roots, cattails, clay and the latrine.
- Gillnet "until freeze-up": with an axe or saw you can set it under the ice.
- Pot "render fat": the frying pan is the item that renders fat without losing it.

**2. Places.** Temperatures, snow and freeze days, big game and predators match, with small gaps:
- Sapmi Winter: snow from day 1 and freeze-up on day 20. The guide says only "Day 1 cold".
- A few predators are missing: snake and buffalo in the Karoo, boar in Taiga Edge.

The fish / hunt / trap / forage multipliers are wrong in every row. Taiga Edge, for example, is 1.45 / 1.64 / 1.72 / 3.0 in the game, not 1.00 / 1.13 / 1.19 / 1.43. They look like they came from an older version.

**3. Catch tables.** Correct for the four places listed. Some lists are cut short:
- Rainforest Coast forage leaves out cattail (3.7%).
- Subarctic Shore hunt leaves out ptarmigan, muskrat and beaver.

**4. Simulation and ranking.** This section cannot be right as written:
- The run count doesn't add up: 28 items × 17 places × 500 runs is 238,000 (246,500 with the no-gear runs), not 245,000.
- It contradicts itself. The Pot averages 58.4 of 60 days alone, yet section 5 never lists it in a single place's top three except the Karoo, at 5.0 days.
- The game says otherwise. Taking each item alone, with the game's test bot, 10 runs per place, capped at 60 days:
  - No gear at all lasts 22.5 days, not 5.4.
  - No single item adds more than 4 days; the ferro rod is best.
  - A gill net or fishing gear alone adds almost nothing.
  - The axe and saw shorten a run, because chopping burns food that one item can't replace.

| # | Item alone | Average days (of 60) | vs no gear |
|---|---|---|---|
| 1 | Ferro rod | 26.5 | +4.0 |
| 2 | Sleeping bag | 24.2 | +1.7 |
| 3 | Tarp | 23.5 | +1.0 |
| 4 | Rations | 23.2 | +0.6 |
| 5 | Pot | 22.9 | +0.4 |
| 6 | Canteen | 22.9 | +0.3 |
| 7 | Blanket | 22.8 | +0.3 |
| 8 | Bivy bag | 22.8 | +0.2 |
| 9 | Multitool | 22.6 | +0.1 |
| 10 | Knife | 22.6 | +0.1 |
| 11 | Hammock | 22.6 | +0.1 |
| 12 | Fishing gear | 22.6 | +0.1 |
| 13 | Soap | 22.6 | +0.0 |
| 14 | Ground sheet | 22.6 | +0.0 |
| 15 | Frying pan | 22.6 | +0.0 |
| 16 | Gillnet | 22.6 | +0.0 |
| 17 | Sharpening stone | 22.5 | +0.0 |
| 18 | Wire | 22.5 | +0.0 |
| 19 | Trapping wire | 22.5 | +0.0 |
| 20 | Slingshot | 22.5 | +0.0 |
| 21 | Shovel | 22.5 | +0.0 |
| 22 | Scotch eyed auger | 22.5 | +0.0 |
| 23 | Salt | 22.5 | +0.0 |
| 24 | Bow and arrows | 22.5 | -0.0 |
| 25 | Rope | 22.4 | -0.1 |
| 26 | Paracord | 22.4 | -0.1 |
| 27 | Saw | 21.1 | -1.5 |
| 28 | Axe | 20.5 | -2.1 |

**5. Single-tool lifelines.** "A gillnet alone lasts 59 days" does not happen in the game: alone it is no better than nothing. The ferro rod is the best single item in 13 of 17 places, and the sleeping bag tops Sapmi Winter.

| Place | | No gear | Best three alone |
|---|---|---|---|
| US-S1 | Rainforest Coast | 28.0 | Soap 28.3 · Rations 28.3 · Wire 28.0 |
| US-S2 | Salmon Inlets | 28.1 | Rations 28.8 · Pot 28.7 · Canteen 28.5 |
| US-S3 | Andean Lakes | 24.8 | Ferro rod 27.7 · Rope 25.8 · Paracord 25.8 |
| US-S5 | Taiga Edge | 21.7 | Ferro rod 27.5 · Sleeping bag 22.9 · Tarp 22.7 |
| US-S6 | Subarctic Shore | 21.2 | Ferro rod 27.6 · Sleeping bag 23.8 · Tarp 22.8 |
| US-S7 | Long Winter | 21.0 | Ferro rod 26.8 · Sleeping bag 25.4 · Tarp 22.7 |
| US-S8 | Grizzly Lake | 21.6 | Ferro rod 27.8 · Tarp 24.0 · Sleeping bag 24.0 |
| US-S9 | Tidal River | 20.2 | Ferro rod 28.3 · Tarp 21.9 · Sleeping bag 21.4 |
| US-S10 | Boreal Lakes | 19.3 | Ferro rod 27.1 · Tarp 20.8 · Sleeping bag 20.4 |
| US-S11 | Arctic Delta | 18.3 | Ferro rod 25.1 · Sleeping bag 23.2 · Tarp 21.2 |
| US-S12 | Dry Karoo | 26.9 | Ferro rod 28.0 · Pot 27.8 · Frying pan 27.2 |
| US-S13 | Early Winter Delta | 18.1 | Ferro rod 25.3 · Sleeping bag 23.7 · Tarp 19.9 |
| US Frozen-S1 | Frozen Coast | 14.5 | Ferro rod 20.9 · Sleeping bag 17.7 · Blanket 15.5 |
| AU-S1 | Wet Rainforest | 27.6 | Ferro rod 28.0 · Tarp 27.8 · Rations 27.8 |
| AU-S2 | Fiordland Forest | 25.0 | Ferro rod 27.5 · Rations 26.0 · Hammock 25.5 |
| AU-S3 | Flood Rivers | 28.0 | Wire 28.0 · Trapping wire 28.0 · Tarp 28.0 |
| AU-S4 | Sapmi Winter | 18.8 | Sleeping bag 20.7 · Ferro rod 20.6 · Tarp 19.9 |

**6. Synergies and traps.** Checked against the rules:
- Axe + Saw: no extra effect when you have both. The axe gives 5 days of firewood per job, the saw 3, both together 5. Either one counts as a cutting tool for building.
- Sleeping bag + Bivy: the bivy cuts night cold by 10% and keeps the bag dry. There is no "+8 °C" in the rules.
- Canteen + Shovel: no wells exist. The canteen carries and boils an extra potful.
- Bow + Salt: salt covers sodium for 60 days and makes dried meat keep 30 days longer. The "100k kcal" figure is not in the game.
- Knife + Multitool: redundant (both count as the same blade), but it costs only the slot, not "18.2 days".
- Wire + Trapping wire: they add up (28 wire, with a cap of 24 snares). Mostly redundant because of the cap, not because "standard wire is too stiff".
- Blanket + Sleeping bag: they add up. The blanket adds warmth on top of the bag, so it is not a trap.
- Rope + Paracord: they add up to 36 lengths of cordage.
- Gillnet after freeze-up: usable under the ice with an axe or saw.

**7. Loadouts.** These are 7-item loadouts, but a player takes 10.

**8. Progression.** The two starter places are among the hardest. The show's real medians, which the game is tuned to:

| Place | Show median (days) |
|---|---|
| Rainforest Coast | 8 |
| Wet Rainforest | 12 |
| Dry Karoo | 14 |
| Arctic Delta | 23 |
| Frozen Coast | 26 |
| Sapmi Winter | 32 |
| Salmon Inlets, Taiga Edge | 35 |
| Grizzly Lake | 37 |
| Fiordland Forest | 38 |
| Boreal Lakes, Flood Rivers | 40 |
| Long Winter | 44 |
| Tidal River | 46 |
| Subarctic Shore | 52 |
| Early Winter Delta | 62 |
| Andean Lakes | 72 |

The game's test bot agrees on the easy end: Subarctic Shore 78, Long Winter 77 and Early Winter Delta 75 days. At the hard end it has Sapmi Winter 27, Dry Karoo 35 and Rainforest Coast 46. Order the unlocks by these numbers, easiest first, not by how cold a place sounds.

## What to do with it

- Keep sections 1 to 3, with the multipliers replaced by the game's own numbers.
- Regenerate sections 4 to 7 from the game with a script, so they cannot drift again (the single-item run above takes about 15 minutes).
- Rebuild section 8 from the medians above.
