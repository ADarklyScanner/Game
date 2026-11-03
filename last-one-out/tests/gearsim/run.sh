#!/bin/sh
# singles (with the empty kit) and pairs with many seeds, triples and quads with fewer
for k in 0 1; do for p in 0 1 2 3; do node combo.js $k 40 $p 4 & done; wait; done
for p in 0 1 2 3; do node combo.js 2 20 $p 4 & done; wait
for p in 0 1 2 3; do node combo.js 3 8 $p 4 & done; wait
for p in 0 1 2 3; do node combo.js 4 3 $p 4 & done; wait
echo DONE
