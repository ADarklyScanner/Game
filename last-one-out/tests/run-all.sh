#!/bin/sh
# Run every check. Stops at the first failure.  ./run-all.sh
set -e
cd "$(dirname "$0")"
node baseline.js
node fuzz.js 20
node ui-check.js
echo "Everything passed."
