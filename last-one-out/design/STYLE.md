# Look: grown-up watercolour

Chosen Nov 3, 2026. The mock-ups in `mockups/` are the reference; their source pages are next to them.

The aim: fit in among Steam survival games without copying them. Painted, muted and quiet, with a character of its own, never cute.

## The rules

**Paint, not lines.**
- The ground is painted edge to edge in layered washes, with no blank paper.
- Colour pools slightly darker at the edges, as real watercolour does.
- Almost no outlines. Ink is only for small accents: cracks in rock, a tree trunk, a lashing.
- Everything casts a soft shadow down and to the right.

**Colour comes from the place.** Each drop site gets its own palette, taken from photos of that landscape. For example, the subarctic shore is olive moss, rust heath, grey granite, near-black spruce and slate water. Colours stay muted, and light and weather tint the whole scene (dusk, rain, snow, firelight).

**True scale.** People, camps and trees are small against the land. Nothing is chunky or rounded for cuteness.

**Three typefaces, each with one job.** All are open-licence and bundled in the file, so the game works offline.

| Typeface | Used for |
|---|---|
| EB Garamond | Place names, job names, panel titles, the one-line mood text |
| Barlow Semi Condensed | Numbers: weight, health, odds, hours, temperature |
| Caveat (handwriting) | The journal and your own map notes only |

**Numbers are visible but quiet.** They sit in a slim fade at the top of the screen: day, place, light left, weather, weight, health, will and food. Thin bars sit under health and will. Hiding the numbers is saved for a future hard mode.

**Tools, not buttons.**
- Jobs live on a waxed-canvas tool roll at the bottom (rod, axe, pot, cord, bow, knife, and hands for jobs that need no tool).
- Picking up a tool shows its jobs on an index card: the job name in the book typeface, the odds and hours in the number typeface, and the reason in red when a job can't be done.
- Inside a shelter, the roll shows sitting-down jobs: whittle, cordage, mend, journal, sleep.

**Panels are the objects themselves.**
- The pack is the bag, laid out on a ground cloth, with a paper tag on each item.
- The map is folded paper, painted only where you have been, with your pencil marks and route on it.
- The body is the journal: weight crossed out and rewritten, spirits described in words.

**Mini-games are close-ups**: the tinder nest, the water with the line in it, the log under the axe. Each has one quiet gauge with its safe band marked, and one large paper button.

**Roughness: lived-in but tidy, leaning clean.** There's a little paper grain, an occasional stain and a soft vignette. Text must always be easy to read on a phone.

## What stays the same

All game rules, odds and the engine. This is a change to how things are drawn and laid out, not to what happens. The 1,100-plus checks and the bots keep testing the rules unchanged.

## How it will be built

- **Painted pieces drawn once.** Each tree, rock, bush, shelter and animal is written as a small watercolour drawing and painted once when the game loads, then reused. The game already caches its sprites this way (`drawBushRaw`, `drawCampRaw` and so on), so this keeps phones smooth.
- **Ground painted in tiles.** The ground is painted in tiles as you walk, then reused.
- **A picture sheet.** One page that forces every variant and shows them all as small pictures: each shelter at each build stage and condition, every season, weather and time of day, each place's colours, every mini-game and panel, at phone and desktop sizes. You scroll it in about ten minutes instead of playing for hours. The bots still check that each picture shows up in real play.

## Phases

Each phase ends with the full test run, the picture sheet updated, and a commit. The game stays playable after every phase.

| # | Phase | What changes |
|---|---|---|
| 0 | Foundation | Typefaces bundled, place palettes, paper and grain textures, the painting helpers, the first picture sheet |
| 1 | Top bar and tool roll | New numbers bar; jobs grouped by tool on the canvas roll; index-card job lists; messages in the new type |
| 2 | The land | Painted ground, water, shore, rivers, rock, paths; light, weather and night tinting |
| 3 | Trees and plants | Every tree kind and age, bushes, moss, cut and used states |
| 4 | Camp and shelters | Fire, every shelter type at every build stage and condition, drying rack, smoker, cache, woodshed, cairns, piles |
| 5 | Animals, people, tracks | Player, animals, carcasses, blood trails, debris, landmarks |
| 6 | Interiors | Inside every shelter type, by weather and time of day |
| 7 | Mini-games | All 26 as close-ups |
| 8 | Panels | Pack, map, journal and body, camp, build, menu, records, how to play, setup and end screens |
| 9 | Finish | Phone speed checks, a full picture-sheet review, old saves, and publishing |

## Decisions still open

- **Which tool a job belongs to.** For example, gathering berries goes under "hands" and boughs under the knife or hands. I'll propose a full list in phase 1.
- **Desktop layout.** The mock-ups are phone screens. On a wide screen the world fills the window and the roll stays centred at the bottom.
