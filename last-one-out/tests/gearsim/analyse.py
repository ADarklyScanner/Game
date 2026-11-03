import json, glob, itertools, numpy as np
V={}; places=None; seeds={}
for f in glob.glob('combo/k*_p*.json'):
    d=json.load(open(f)); places=d['places']
    for k,row in d['out'].items(): key=frozenset(k.split('|')) if k else frozenset(); V[key]=np.array(row); seeds[len(key)]=d['seeds']
items=sorted({i for k in V for i in k}); P=len(places)
base=V[frozenset()]
def ext(S): return V[frozenset(S)]-base
R={'places':places,'items':items,'seeds':{str(k):v for k,v in seeds.items()},'base':base.round(2).tolist()}
# 1 alone: days added over no gear, per place and on average
solo={i:ext([i]) for i in items}; R['solo']={i:{'avg':round(float(solo[i].mean()),2),'by':solo[i].round(2).tolist()} for i in items}
# 2 pairs: what two together add beyond the two alone
if all(frozenset(p) in V for p in itertools.combinations(items,2)):
    pr=[]; 
    for a,b in itertools.combinations(items,2):
        x=ext([a,b])-solo[a]-solo[b]; pr.append({'a':a,'b':b,'syn':round(float(x.mean()),2),'ext':round(float(ext([a,b]).mean()),2),'by':x.round(1).tolist()})
    R['pairs']=pr
# 3 and 4: beyond the sum of the singles, and beyond the best pair inside
for n in (3,4):
    combos=list(itertools.combinations(items,n))
    if not all(frozenset(c) in V for c in combos): continue
    out=[]
    for c in combos:
        e=ext(c); beyond=e-sum(solo[i] for i in c)
        bestsub=max(float(ext(s).mean()) for s in itertools.combinations(c,n-1))
        out.append({'set':list(c),'ext':round(float(e.mean()),2),'beyond':round(float(beyond.mean()),2),'overBestSub':round(float(e.mean())-bestsub,2)})
    R[f'k{n}']=out
# the single number: the average days an item adds when it joins any kit of 0 to (largest-1) other items, each kit size weighted equally
maxk=max(len(k) for k in V)
score={}
for i in items:
    per=[]
    for m in range(0,maxk):
        diffs=[ (V[S|{i}]-V[S]).mean() for S in V if len(S)==m and i not in S and (S|{i}) in V ]
        if diffs: per.append(np.mean(diffs))
    score[i]=round(float(np.mean(per)),2); R.setdefault('scoreBySize',{})[i]=[round(float(x),2) for x in per]
R['score']=score; R['maxk']=maxk
# in a real 10-item kit (the random-kit runs), relative to the average item
try:
    kits=[r for f in sorted(glob.glob('kits?.json')) for r in json.load(open(f))]
    pl=sorted({r['place'] for r in kits}); X=[];y=[]
    for r in kits: X.append([1.0 if r['place']==p else 0.0 for p in pl]+[1.0 if i in r['kit'] else 0.0 for i in items]); y.append(r['days'])
    X=np.array(X);y=np.array(y); b=np.linalg.lstsq(X,y,rcond=None)[0][len(pl):]; b=b-b.mean()
    R['full10']={i:round(float(v),2) for i,v in zip(items,b)}; R['full10n']=len(kits)
except Exception as e: print('full10', e)
json.dump(R,open('comboresult.json','w'))
print('base avg', base.mean().round(1), 'max kit size', maxk)
for i in sorted(items,key=lambda i:-score[i]): print(f"{i:20} solo {R['solo'][i]['avg']:+5.1f}  score {score[i]:+5.1f}  bysize {R['scoreBySize'][i]}  full10 {R.get('full10',{}).get(i,0):+5.1f}")
if 'pairs' in R:
    ps=sorted(R['pairs'],key=lambda x:-x['syn']); print('top pairs', [(p['a'],p['b'],p['syn']) for p in ps[:8]]); print('worst pairs', [(p['a'],p['b'],p['syn']) for p in ps[-8:]])
