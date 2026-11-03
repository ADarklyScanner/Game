import json, html
R = json.load(open('comboresult.json'))
items = R['items']; places = R['places']
NAMES = {'US-S1':'Rainforest Coast','US-S2':'Salmon Inlets','US-S3':'Andean Lakes','US-S5':'Taiga Edge','US-S6':'Subarctic Shore','US-S7':'Long Winter','US-S8':'Grizzly Lake','US-S9':'Tidal River','US-S10':'Boreal Lakes','US-S11':'Arctic Delta','US-S12':'Dry Karoo','US-S13':'Early Winter Delta','US Frozen-S1':'Frozen Coast','AU-S1':'Wet Rainforest','AU-S2':'Fiordland Forest','AU-S3':'Flood Rivers','AU-S4':'Sapmi Winter'}
e = html.escape
score = R['score']; solo = {i: R['solo'][i]['avg'] for i in items}; full = R.get('full10', {})
order = sorted(items, key=lambda i: -score[i])
fmt = lambda v: '0.0' if abs(v) < 0.05 else ('+' if v > 0 else '\u2212') + f'{abs(v):.1f}'

def hbars(rows, unit='days', w=640):
    """horizontal bars about a zero line, as page elements so the text stays readable on a phone"""
    lo = min(0, min(v for _, v, _ in rows)); hi = max(0, max(v for _, v, _ in rows)); span = (hi - lo) or 1
    z = (0 - lo) / span * 100
    out = ['<div class="bars">']
    for label, v, tip in rows:
        left = z + min(v, 0) / span * 100; width = abs(v) / span * 100
        out.append(f'<div class="br hit" data-tip="{e(tip)}"><span class="bl">{e(label)}</span><span class="bt"><i class="zero" style="left:{z:.2f}%"></i><b class="{'pos' if v >= 0 else 'neg'}" style="left:{left:.2f}%;width:{max(width, 0.6):.2f}%"></b></span><span class="bv">{fmt(v)}</span></div>')
    out.append('</div>'); return ''.join(out)

def heat(rows, cols, val, tip, cell=18, lab=150, top=96, maxabs=None):
    """a diverging grid: blue works for you, red against, grey is nothing"""
    vals = [val(r, c) for r in rows for c in cols if val(r, c) is not None]
    m = maxabs or (max(abs(v) for v in vals) or 1)
    w = lab + cell * len(cols) + 4; h = top + cell * len(rows) + 4
    out = [f'<svg class="chart heat" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" aria-label="grid">']
    for j, c in enumerate(cols):
        x = lab + j * cell + cell / 2
        out.append(f'<text transform="translate({x + 4:.1f},{top - 6}) rotate(-60)" class="lbl sm">{e(c)}</text>')
    for i, r in enumerate(rows):
        y = top + i * cell
        out.append(f'<text x="{lab - 6}" y="{y + cell / 2 + 4}" text-anchor="end" class="lbl sm">{e(r)}</text>')
        for j, c in enumerate(cols):
            v = val(r, c)
            if v is None: continue
            pct = min(100, abs(v) / m * 100); pole = 'var(--pos)' if v >= 0 else 'var(--neg)'
            out.append(f'<rect x="{lab + j * cell + 1}" y="{y + 1}" width="{cell - 2}" height="{cell - 2}" rx="2" style="fill:color-mix(in oklab, {pole} {pct:.0f}%, var(--mid))" class="hit" data-tip="{e(tip(r, c, v))}"/>')
    out.append('</svg>'); return ''.join(out)

def table(head, rows):
    return '<div class="tw"><table><thead><tr>' + ''.join(f'<th>{e(h)}</th>' for h in head) + '</tr></thead><tbody>' + ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in r) + '</tr>' for r in rows) + '</tbody></table></div>'

secs = []
# the one number
best, worst = order[0], order[-1]
secs.append(f'''<section><h2>The one number</h2>
<p>Average days an item adds when it joins any kit of {("up to " + str(R["maxk"] - 1)) if R["maxk"] > 1 else "no"} other items, every kit size counted equally. It folds the item alone, every pair, every set of three{" and four" if R["maxk"] >= 4 else ""} into one figure: its fair share of the days it adds.</p>
{hbars([(i, score[i], f"{i}: {fmt(score[i])} days on average. Alone {fmt(solo[i])}; in a full 10-item kit {fmt(full.get(i, 0))} versus the average item.") for i in order])}
</section>''')
# alone
secs.append(f'''<section><h2>Each item alone</h2>
<p>Days added over no gear at all, in the same place with the same luck ({R["seeds"]["1"]} runs per item per place, capped at 60 days). With no gear a run lasts {sum(R["base"]) / len(R["base"]):.1f} days on average.</p>
{hbars([(i, solo[i], f"{i} alone: {fmt(solo[i])} days") for i in sorted(items, key=lambda i: -solo[i])])}
<h3>Alone, place by place</h3><div class="sx">{heat(sorted(items, key=lambda i: -solo[i]), [NAMES[p] for p in places], lambda r, c: R["solo"][r]["by"][[NAMES[p] for p in places].index(c)], lambda r, c, v: f"{r} alone in {c}: {fmt(v)} days")}</div>
</section>''')
# pairs
if 'pairs' in R:
    P = R['pairs']; pm = {(p['a'], p['b']): p for p in P}; pm.update({(p['b'], p['a']): p for p in P})
    ps = sorted(P, key=lambda p: -p['syn'])
    secs.append(f'''<section><h2>Pairs</h2>
<p>What two items add together beyond their two solo numbers combined. Blue: more together than apart. Red: less ({R["seeds"]["2"]} runs per pair per place).</p>
<div class="sx">{heat(order, order, lambda r, c: None if r == c else pm[(r, c)]["syn"], lambda r, c, v: f"{r} + {c}: {fmt(v)} days beyond the two alone (together they add {fmt(pm[(r, c)]['ext'])})")}</div>
<div class="two"><div><h3>Work best together</h3>{hbars([(f"{p['a']} + {p['b']}", p['syn'], f"together {fmt(p['ext'])} days") for p in ps[:12]], w=420)}</div>
<div><h3>Clash most</h3>{hbars([(f"{p['a']} + {p['b']}", p['syn'], f"together {fmt(p['ext'])} days") for p in ps[-12:][::-1]], w=420)}</div></div>
</section>''')
for n in (3, 4):
    k = f'k{n}'
    if k not in R: continue
    S = sorted(R[k], key=lambda x: -x['beyond'])
    word = 'three' if n == 3 else 'four'
    secs.append(f'''<section><h2>Sets of {word}</h2>
<p>Days the set adds beyond its {word} solo numbers combined ({R["seeds"][str(n)]} runs per set per place, every set of {word}).</p>
<div class="two"><div><h3>Most beyond the sum</h3>{hbars([(" + ".join(x["set"]), x["beyond"], f"the set adds {fmt(x['ext'])} days") for x in S[:12]], w=480)}</div>
<div><h3>Most below the sum</h3>{hbars([(" + ".join(x["set"]), x["beyond"], f"the set adds {fmt(x['ext'])} days") for x in S[-12:][::-1]], w=480)}</div></div>
</section>''')
if full:
    fo = sorted(items, key=lambda i: -full[i])
    secs.append(f'''<section><h2>In a full 10-item kit</h2>
<p>From {R.get("full10n", 0):,} runs of 10 random items in random places: days each item adds compared with the average item in the kit. This is the number that decides real loadouts.</p>
{hbars([(i, full[i], f"{i} in a full kit: {fmt(full[i])} days versus the average item") for i in fo])}
</section>''')
secs.append('<section><h2>All the numbers</h2>' + table(['#', 'Item', 'One number', 'Alone', 'In a full kit'], [[str(n + 1), e(i), fmt(score[i]), fmt(solo[i]), fmt(full.get(i, 0))] for n, i in enumerate(order)]) + '</section>')
secs.append(f'''<section class="note"><h2>How it was run</h2>
<p>The game's own rules and its test bot, which plays every job it can with what it carries. Same seeds for every kit in a place, so the differences come from the gear, not the luck. Runs stop at 60 days. Kits up to {R["maxk"]} items were all run; full 10-item kits were sampled at random. Game as of Nov 3, 2026 (water round and upkeep included).</p></section>''')

page = f'''<title>Last One Out Gear Simulation</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
:root {{ --bg:#f3eee2; --surface:#fbf8f0; --fg:#211d16; --soft:#5d5444; --faint:#8b8170; --line:#d8cfba;
  --pos:#2a78d6; --neg:#e34948; --mid:#ece7da; color-scheme:light;
  --display:'EB Garamond', Georgia, serif; --ui:'Barlow Semi Condensed', 'Arial Narrow', system-ui, sans-serif; }}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{ --bg:#1c1a16; --surface:#24211b; --fg:#ece4cf; --soft:#c0b59b; --faint:#8f8670; --line:#3a3428; --pos:#3987e5; --neg:#e66767; --mid:#35322b; color-scheme:dark; }} }}
:root[data-theme="dark"] {{ --bg:#1c1a16; --surface:#24211b; --fg:#ece4cf; --soft:#c0b59b; --faint:#8f8670; --line:#3a3428; --pos:#3987e5; --neg:#e66767; --mid:#35322b; color-scheme:dark; }}
body {{ background:var(--bg); color:var(--fg); font:17px/1.45 var(--display); padding-left:max(16px, env(safe-area-inset-left, 0px)); padding-right:max(16px, env(safe-area-inset-right, 0px)); }}
main {{ max-width:980px; margin:0 auto; padding-block:24px 60px; }}
h1 {{ font-weight:600; font-size:clamp(30px, 6vw, 44px); line-height:1.05; margin:0 0 8px; text-wrap:balance; }}
h2 {{ font-weight:600; font-size:25px; margin:0 0 6px; text-wrap:balance; font-variant:small-caps; letter-spacing:.03em; }}
h3 {{ font:600 13px var(--ui); letter-spacing:.09em; text-transform:uppercase; color:var(--faint); margin:16px 0 6px; }}
p {{ max-width:66ch; margin:0 0 10px; color:var(--soft); }} .lead {{ font-size:19px; color:var(--fg); }}
section {{ background:var(--surface); border:1px solid var(--line); border-radius:4px; padding:18px 18px 14px; margin:18px 0; }}
.chart {{ width:100%; height:auto; display:block; font-family:var(--ui); }} .heat {{ width:auto; max-width:none; }}
.sx {{ overflow-x:auto; }} .two {{ display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:10px 22px; }}
.lbl {{ fill:var(--fg); font-size:13px; }} .lbl.sm {{ font-size:11px; fill:var(--soft); }} .val {{ fill:var(--soft); font-size:12px; font-variant-numeric:tabular-nums; }}
.axis {{ stroke:var(--faint); stroke-width:1; }}
.bars {{ display:flex; flex-direction:column; gap:2px; font:14px var(--ui); }} .br {{ display:grid; grid-template-columns:minmax(96px, 38%) 1fr 46px; align-items:center; gap:8px; padding:2px 0; }} .br:hover {{ background:var(--mid); }}
.bl {{ text-align:right; color:var(--fg); min-width:0; overflow-wrap:anywhere; line-height:1.15; }} .bt {{ position:relative; height:14px; }} .bt b {{ position:absolute; top:2px; height:10px; border-radius:2px; }} .bt .zero {{ position:absolute; top:-3px; bottom:-3px; width:1px; background:var(--faint); }}
.bv {{ color:var(--soft); font-variant-numeric:tabular-nums; }} b.pos {{ background:var(--pos); }} b.neg {{ background:var(--neg); }}
.hit:hover rect.pos, .hit:hover rect.neg {{ opacity:.8; }} rect.hit:hover {{ stroke:var(--fg); stroke-width:1.5; }}
.key {{ display:flex; gap:16px; font:13px var(--ui); color:var(--soft); margin:6px 0 12px; flex-wrap:wrap; }} .key i {{ display:inline-block; width:12px; height:12px; border-radius:2px; vertical-align:-2px; margin-right:6px; }}
.tw {{ overflow-x:auto; }} table {{ border-collapse:collapse; width:100%; font:14px var(--ui); font-variant-numeric:tabular-nums; }} th, td {{ text-align:left; padding:5px 8px; border-bottom:1px solid var(--line); }} th {{ color:var(--faint); font-weight:600; }}
.note p {{ font-size:15px; }}
#tip {{ position:fixed; pointer-events:none; background:var(--fg); color:var(--bg); font:13px/1.3 var(--ui); padding:6px 9px; border-radius:3px; max-width:280px; opacity:0; transition:opacity .1s; z-index:9; }}
</style>
<main>
<h1>Last One Out: what each item is worth</h1>
<p class="lead">Every item run alone in every place, every pair, every set of three and four, then one fair-share number per item. Best: <b>{e(best)}</b> ({fmt(score[best])} days). Worst: <b>{e(worst)}</b> ({fmt(score[worst])} days).</p>
<div class="key"><span><i style="background:var(--pos)"></i>adds days</span><span><i style="background:var(--neg)"></i>costs days</span><span><i style="background:var(--mid)"></i>no difference</span></div>
{''.join(secs)}
</main>
<div id="tip" role="tooltip"></div>
<script>
const tip = document.getElementById('tip');
document.addEventListener('pointermove', ev => {{ const t = ev.target.closest('[data-tip]'); if (!t) {{ tip.style.opacity = 0; return; }} tip.textContent = t.dataset.tip; tip.style.opacity = 1; const x = Math.min(ev.clientX + 14, innerWidth - tip.offsetWidth - 8); tip.style.left = x + 'px'; tip.style.top = (ev.clientY + 16) + 'px'; }});
document.addEventListener('pointerdown', ev => {{ const t = ev.target.closest('[data-tip]'); if (t) {{ tip.textContent = t.dataset.tip; tip.style.opacity = 1; tip.style.left = Math.min(ev.clientX + 10, innerWidth - 290) + 'px'; tip.style.top = (ev.clientY + 14) + 'px'; }} }});
</script>
'''
open('gearreport.html', 'w').write(page)
print('ok', len(page))
