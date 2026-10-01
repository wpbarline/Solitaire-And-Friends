// Deterministic random/shuffle primitives are also usable by Uno and Rummy.
export function seededRandom(seed){
  let n=seed>>>0;
  return ()=>{ n+=0x6D2B79F5; let t=Math.imul(n^(n>>>15),1|n); t^=t+Math.imul(t^(t>>>7),61|t); return ((t^(t>>>14))>>>0)/4294967296; };
}
export function shuffled(items,rng=Math.random){
  const a=items.slice();
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(rng()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}
export function dailySeed(date=new Date()){
  const label=[date.getFullYear(),date.getMonth()+1,date.getDate()].join('-');
  let n=2166136261; for(const ch of label) n=Math.imul(n^ch.charCodeAt(0),16777619);
  return n>>>0;
}
