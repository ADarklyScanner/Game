# Clothing and the rest of the issued kit: design note

Status: **idea for later, not started.** Written Nov 3, 2026, after the issued kit went in (see README, "Issued clothing and personal items").

## The problem

Today the game treats clothing as one thing that is always on: a single wear value that mending restores. Real people don't dress like that.
- On a mild first day, the jacket and insulated pants stay in the pack.
- They put layers on when they stop working and take them off before they sweat.
- They change into dry things, sleep in a clean set, and rotate their socks.

Most of the issued kit (hats, gloves, buff, shemagh, thermals, the shell, the second pair of boots) does nothing yet. This note designs all of it.

## The idea in one line

What you **wear** changes as the day goes. Each piece is **worn**, **in the pack**, **hanging to dry** or **wet**. Getting it right keeps you warm and dry; getting it wrong costs warmth, sweat or skin. A one-tap "Dress for the weather" does the sensible thing for players who don't want to manage it, and mistakes come from ignoring it.

## Layers and what each piece does

| Layer | Pieces | What it does |
|---|---|---|
| Base | T-shirt, 2 sets of thermals, 2 pairs of underwear | Warmth next to the skin. One thermal set kept dry just for sleeping makes nights warmer. Wet or unchanged for days: chafing and rash (ties into hygiene). |
| Mid | 2 shirts, 2 sweaters (or a sweater and a vest), 2 pairs of pants | The main warmth. Wool still warms a little when wet; cotton doesn't ("cotton kills"). The setup could let you pick wool or cotton for the shirts and sweaters. |
| Insulation | Jacket, insulated pants | Big warmth for cold days and still evenings. Too hot to work in above freezing: you sweat into your clothes and get wet from the inside. |
| Shell | Waterproof shell | Keeps rain and wind off. Worn while working hard, it traps sweat. It tears with wear (brush, rock) and leaks after. |
| Head and neck | 2 hats, buff, bandana, shemagh | A wool hat in the bag at night is noticeably warmer. A brim or shemagh against sun and heat. Buff and shemagh against wind on the face (fewer frostnipped cheeks), bugs in blackfly season, and dust. The shemagh also works as a sling, a bandage or a pre-filter for muddy water. |
| Hands | 3 pairs of gloves | Fewer frostnipped fingers, and protection from thorns and the axe handle. Fine work (knots, lighting a fire, tying hooks) is slower or fails more with gloves on, so you take them off and your hands get cold. Wet gloves are worse than none in hard cold. |
| Feet | 6 pairs of wool socks, high-leg boots, ankle boots, snake gaiters | High boots keep feet dry in bog, shallow water and snow, but are heavier (a little slower on long walks). Ankle boots are light on dry ground. Wet socks for days lead to immersion foot (painful, slow to heal). Rotating and drying socks prevents it. Wet boots take a day or more to dry by the fire, and too close scorches them (the melted-sole event already exists). Gaiters keep snow, ticks and thorns out as well as snakes. |
| Belt | Leather belt | Holds tools at hand (a knife on the belt saves a fumble); cut up, it is lacing (already in). |

## Personal items

- **Glasses** (setup option, "I wear glasses"): a fall can break them. Until you tape them (cordage, an hour), aiming, spotting game and looking closely at plants are worse.
- **Photograph** (already in): it softens and fades with weeks of handling; a dry pocket keeps it.
- **Toothbrush:** used daily, the rare cracked-tooth and infection events become rarer. A broken one can be carved from a twig.

## Wear, loss and care, piece by piece

- **Each piece wears on its own.** Pants go at the knees, boots at the soles, gloves at the fingertips, the shell at the shoulders. Mending works per piece. Leather from hides patches boots and gloves.
- **Washing** in the river: cleaner (hygiene) but wet, and it needs a dry day.
- **Drying times by weather:** a fair, windy day dries fast; rain or a still damp day hardly at all; by the fire is fast but risks scorching.
- **Losing things:** the gear-loss events (falls, river crossings, animals) can take a glove or a hat, not just tools.

## How it plays

- **Dress for the weather (one tap):** puts on what suits the temperature, wind, rain and the job you're about to do, and takes off what will make you sweat. On by default for new players; can be switched to manual.
- **The body screen** (the journal in the new look) shows what you're wearing as a simple figure with layers, and what is drying.
- **The Camp tool** gains "Layer up", "Strip a layer" and "Change" (the dry change already exists). Sleeping takes the dry thermal set automatically if you have it.
- **Warnings come through the body,** not numbers: "You're sweating through your shirt," "Your feet have been wet for three days," "Your fingers won't do the knot in these gloves."

## Rules of thumb for balance

- A player who uses "Dress for the weather" should come out the same as today's game. The current cold and wet rules already assume sensible dressing.
- Mistakes cost: working in the jacket, ignoring wet socks, sleeping in wet clothes.
- The test bot dresses for the weather, so the balance check (within 5% of the original game) still holds.
- Each new rule gets a check in `tests/regress.js` or its own suite.

## Where it fits

A separate gameplay update, after the art phases or between two of them. It needs one small piece of art: the clothing figure on the body screen, in the watercolour style.
