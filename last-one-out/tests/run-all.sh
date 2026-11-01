#!/bin/sh
# Run every check. Stops at the first failure.  ./run-all.sh
set -e
cd "$(dirname "$0")"
node baseline.js
node food.js
node cooking.js
node fire.js
node tools.js
node balance.js
node fuzz.js 20
node ui-check.js
echo "Everything passed."
