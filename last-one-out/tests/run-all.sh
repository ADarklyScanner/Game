#!/bin/sh
# Run every check. Stops at the first failure.  ./run-all.sh
set -e
cd "$(dirname "$0")"
node baseline.js
node golden.js
node food.js
node cooking.js
node fire.js
node tools.js
node light.js
node hygiene.js
node shelter.js
node pottery.js
node wild.js
node mend.js
node bowmap.js
node crafts.js
node finish.js
node conseq.js
node regress.js
node lazy.js
node upkeep.js
node balance.js
node fuzz.js 20
node exhaustive.js 4000
node styles.js 2
node ui-check.js
node handson.js
node screens.js
node campsite.js
node budget.js
node unlocks.js
node oldsave.js
node minis.js
node camping.js
node selfcheck.js
echo "Everything passed."
