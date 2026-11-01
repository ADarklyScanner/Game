#!/bin/sh
# Run every check. Stops at the first failure.  ./run-all.sh
set -e
cd "$(dirname "$0")"
node baseline.js
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
node balance.js
node fuzz.js 20
node ui-check.js
node handson.js
echo "Everything passed."
