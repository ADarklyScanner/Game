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

## First painted piece

The wreck on the far side of each map is the first thing drawn with the painting helper (`PAINT.sprite`): written once as a small watercolour SVG, turned into an image the first time it is needed, and reused. Phases 2 to 5 do the same for the land, trees, camp and animals.

## How the land is painted (phase 2)

- **Plain canvas, not SVG filters,** so it is fast and works in every browser. A *wash* is an uneven blob, filled thin with its edge stroked a little stronger, the way pigment pools at the edge of real watercolour. *Dry brush* is broken parallel strokes.
- **Ground:** the place's own palette (moss, darker moss, rust, lichen) laid in washes at three sizes over its base colour, with dry-brush streaks.
- **Water:** the place's blue-greys, darker pigment along the waterline, a pale line where it laps, thin light streaks instead of white ovals. The river is darker at its banks.
- **Paths:** a soft lighter band and scuffs, with no drawn edge.
- **Stones and bedrock:** a wash with a lighter top wash, a soft shadow and one crack.
- **Paper:** one seamless sheet of soft blotches and fine granulation, multiplied over every ground tile, continuous across tiles.
- **Muting:** every colour of every place is pulled about a quarter of the way toward its own grey once, at load. Trees and decor sit in the palette at no cost per frame. The player's jacket and the fire stay bright enough to find.
- **Light:** dawn, evening, dusk and night tints are taken from the palette (dusk is a muted purple, night a deep blue-black).

## How the trees are painted (phase 3)

- **Each look has its own painting.** That covers 19 looks plus dead snags: spruce, fir, cypress, cedar, black spruce, larch, pine, podocarp, eucalypt, acacia, alder, beech, myrtle, lenga, willow, aspen, birch, mountain birch and dwarf birch. Each is made once per age (sapling or mature), state (green, autumn, bare, snow) and one of three variants, in the place's muted colours, at twice the size for sharp phones.
- **Conifers** are jagged tiers in a dark wash with a lighter side and a few dark needle marks, and snow on the tier tips in winter. Pines are a few ragged clumps on a clear trunk; cedars droop; black spruce are thin spindles with a club top.
- **Broadleaf trees** are overlapping washes, lighter toward the light and darker underneath. Larch, birch and the other deciduous trees turn in autumn and go bare in winter, with snow along the branches. Lenga and beech grow in flat layers; willows droop.
- **Berry and rose-hip bushes** are painted with their berries green, ripe or gone over, picked, or under snow.
- **Wind** slides a painting a pixel or two instead of bending it. A bend costs too much on slower phones.
- The old drawings stand in for the frame or two before a painting is ready. They, the small plants, moss, logs and stumps are drawn in muted colours.

## How the camp is painted (phase 4)

- **Every piece is its own painting,** made once for what it shows and reused: the shelter by type, condition (sound, worn, broken) and snow; a half-built shelter by a quarter of the way; the rack by its roof, how much meat hangs and how dry it is; the woodpile by how many pieces; and so on.
- **Shelters.** Bedroll or bough bed when sleeping out. The tarp is an A-frame with a dark open front, seams, guy lines and pegs; worn shows creases and stains, broken a torn corner. The lean-to is a thatched roof seen from above with the dark open front under the ridge. The debris hut is a mound of leaf litter, moss and boughs with a dark doorway. The rock shelter is a dry-stone wall under a pole and sod roof, with a hide over half the door. The cabin has saddle-notched log walls, a plank door, a greased-hide window and a sod and bough roof, with a stone chimney once built. Wear shows as gaps, holes and fallen poles; snow sits on the roofs and drifts at the base.
- **Building.** The debris hut shows its ridge and ribs, then litter going on. The rock shelter goes up a course at a time, then the lintel, then the roof poles. The cabin goes up two courses, then four with the door gap, then full walls with bare rafters. A new shelter built while another stands goes up beside it.
- **The fire** is a ring of stones around a pit (charred once it has burned) and four flame paintings it cycles through, with a little flicker in size. Sparks, smoke, the glow and the light through a cabin window still move frame by frame.
- **The works:** woodshed, split firewood with the wedge ends showing, the smoker wrapped in boughs, the drying rack (open, boughs or tarp roof), the raised cache with its tin band, materials waiting by the fire, catch on a flat stone, wet clothes on a line, the mess after a raid, piles left out on the land, and cairns.
- The drying rack now stands to the right of the shelter and the clothes line in front of the fire, so a cabin no longer covers them.
- If any camp painting isn't ready yet, the whole camp is drawn the old way for that frame, so the two never mix.

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
| 0 | Foundation (done Nov 3) | Typefaces bundled, place palettes, paper and grain textures, the painting helpers, the first picture sheet |
| 1 | Top bar and tool roll (done Nov 3) | New numbers bar; jobs grouped by tool on the canvas roll; index-card job lists; messages in the new type |
| 2 | The land (done Nov 3) | Painted ground, water, shore, rivers, rock, paths; light, weather and night tinting |
| 3 | Trees and plants (done Nov 3) | Every tree kind and age, bushes, moss, cut and used states |
| 4 | Camp and shelters (done Nov 3) | Fire, every shelter type at every build stage and condition, drying rack, smoker, cache, woodshed, cairns, piles |
| 5 | Animals, people, tracks | Player, animals, carcasses, blood trails, debris, landmarks |
| 6 | Interiors | Inside every shelter type, by weather and time of day |
| 7 | Mini-games | All 26 as close-ups |
| 8 | Panels | Pack, map, journal and body, camp, build, menu, records, how to play, setup and end screens |
| 9 | Finish | Phone speed checks, a full picture-sheet review, old saves, and publishing |

## Which tool each job sits under (phase 1)

| Tool | Jobs |
|---|---|
| Camp | build and repair the shelter, rest, sleep or turn in, go inside or out, bough bed, latrine, splint, mend, roof work, letter, camera, journal, read the sky, shadow stick, moss check, cairn, climb, scout, move camp, the load and the stack |
| Fire | light, tend, move the fire in or out, cook, boil, melt snow, tea, broth, smoke, dry food, render fat, dry out, smoke clothes, pots, fetch water |
| Gather | berries, greens, mushrooms, roots, shellfish, seaweed, insects, nettles, cattails, nuts, rose hips, seeds, forage, look closely, bait, moss, stones, clay, tinder, debris, boughs, bark |
| Knife | clean, dress, hide, sharpen, whittle, cordage, and Craft… |
| Wood | firewood, poles, logs, fix the axe |
| Fish | fishing, the gill net, set lines, the raft |
| Hunt | hunt, track |
| Traps | snares, deadfalls, check the traps |

Only the tools with something to do where you stand appear on the roll. When you arrive somewhere new, the tool for the most likely job opens by itself, so the main job is still one tap (and Space still does it). Tapping the open tool again folds the card away to see the land.

## Decisions still open

- **Desktop layout.** The mock-ups are phone screens. On a wide screen the world fills the window and the roll stays centred at the bottom.
