# Gear simulation

Every item alone, every pair, every set of three and four, run in all 17 places with the test bot (same seeds for every kit in a place, capped at 60 days), plus random full 10-item kits. Then one fair-share number per item: the average days it adds when it joins any kit of up to three other items.

    cd tests/gearsim
    ./run.sh                                  # all kits up to four items, about an hour on four cores
    for p in 0 1 2 3; do PART=$p K=750 node kits.js kits$p.json & done; wait   # 3,000 random 10-item kits
    python3 analyse.py && python3 report.py   # comboresult.json, then gearreport.html

Put an earlier `comboresult.json` next to it as `before.json` (with a `label`) and the report adds a before-and-after section.

Results (Nov 4, 2026, after the fixes, with the Nov 3 run as before.json): https://claude.ai/artifact/C7t6VdPtTjBZZZudUdh8aP
