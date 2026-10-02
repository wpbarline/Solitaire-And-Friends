import {haptic} from '../../assets/js/haptics.js';
/* ============================================================================
   Arline Arcade — Klondike Solitaire
   Tap-to-move (taps auto-route: foundation first, else a legal tableau). Cards
   are persistent DOM nodes positioned by transform, so every move slides.
   CSS-drawn cards for now; the LGPL Svg-cards-2.0.svg deck is an easy art swap.
   ============================================================================ */
import sfx from '../../assets/js/sfx.js';
import { snapshot as abSnapshot, restore as abRestore, magicShuffle } from './abilities.js';
import {hints, safeFoundation, validSnapshot} from './rules.js';
import {seededRandom, shuffled, dailySeed} from '../../assets/js/game-primitives.js';
import {createCardVisual,prepareBack} from './card-visuals.js';
import {preferences} from '../../assets/js/preferences.js';

const SUITS = [{ch:'♠',color:'black'},{ch:'♥',color:'red'},{ch:'♦',color:'red'},{ch:'♣',color:'black'}];
const RANKS = ['','A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const SUIT_NAME = ['spade','heart','diamond','club'];      // matches assets/cards/rawpixel/<suit>_<rank>.png
const DECK_PATH = new URL('../../assets/cards/royal/',import.meta.url).href;
const ASPECT = 1.5;                                        // taller cards, better use of phone height

let board;
let cards, stock, waste, foundations, tableau, elMap, slotEl, zc=1, moves=0, won=false;
let history=[], rewindsLeft=3, shufflesLeft=1, cardsById=new Map();   // Arline's time powers
const posMap = new Map(); let geo=null, drag=null;

const topOf = a => a[a.length-1];
const SAVE_KEY='solitaire-friends-game-v1', STATS_KEY='solitaire-friends-stats-v1';
let seed=0,drawCount=1,elapsed=0,initial=null,autoTimer=null,dealKind='Classic',winRecorded=false;
let currentHint=null,hintIndex=0;
let reversing=false;
let checkpointSequence=0,surprisesLeft=1;
let deckReady=false,deckGeneration=0,deckReadyPromise=Promise.resolve();
let dealing=false,dealFrame=0,dealTimer=0,dealSounds=[];
function stopDeal(){cancelAnimationFrame(dealFrame);clearTimeout(dealTimer);dealSounds.forEach(clearTimeout);dealSounds=[];dealing=false;elMap?.forEach(e=>e.style.transitionDelay='');board?.classList.remove('dealing');}
let stats={played:0,wins:0,bestMoves:null,bestTime:null,highScores:[]};
try{stats={...stats,...JSON.parse(localStorage.getItem(STATS_KEY))};}catch{}
function stopAuto(){clearInterval(autoTimer);autoTimer=null;}
function snapshot(){return abSnapshot({stock,waste,foundations,tableau,moves});}
function saveGame(){
  if(window.__gameErasingData)return;
  if(!cards)return;
  try{const previous=localStorage.getItem(SAVE_KEY);if(previous)localStorage.setItem(SAVE_KEY+'-previous',previous);localStorage.setItem(SAVE_KEY,JSON.stringify({version:1,savedAt:Date.now(),checkpoint:++checkpointSequence,seed,drawCount,elapsed,initial,dealKind,winRecorded,shufflesLeft,rewindsLeft,surprisesLeft,state:snapshot(),history}));}catch{ announce('Storage is full. This game may not resume after closing.'); }
}
function saveStats(){if(window.__gameErasingData)return;try{localStorage.setItem(STATS_KEY,JSON.stringify(stats));}catch{}}
function applySnapshot(s){const restored=abRestore(s,cardsById);({stock,waste,foundations,tableau,moves}=restored);}
function announce(text){dispatchEvent(new CustomEvent('solitaire-message',{detail:text}));}
function clearHint(){board.querySelectorAll('.hinted').forEach(e=>e.classList.remove('hinted'));currentHint=null;document.getElementById('playHint')?.setAttribute('hidden','');dispatchEvent(new CustomEvent('solitaire-hint',{detail:false}));}
function hint(){
  if(reversing)return;
  stopAuto();const choices=hints({stock,waste,foundations,tableau});const wasHint=!!currentHint;clearHint();if(!wasHint)hintIndex=0;const option=choices[hintIndex++%choices.length];
  if(!option){announce('No moves found among the visible cards. Try Undo or a new deal.');return;}
  sfx.mallet('hint');slotEl[option.to]?.classList.add('hinted');
  if(option.kind==='stock'){(stock.length?elMap.get(topOf(stock).id):slotEl.stock).classList.add('hinted');announce(stock.length?'Tap the stock to draw '+drawCount+' card'+(drawCount===1?'':'s')+'.':'Tap the empty stock to turn the waste over.');}
  else{const card=cardsById.get(option.card);elMap.get(card.id).classList.add('hinted');announce('Move '+RANKS[card.rank]+SUITS[card.suit].ch+' to '+(option.kind==='foundation'?'its foundation.':'column '+(Number(option.to[1])+1)+'.'));}
  currentHint=option;document.getElementById('playHint')?.removeAttribute('hidden');updateBar(false);
}
function playHint(){
  const option=currentHint;if(!option)return;
  if(option.kind==='stock'){drawStock();return;}
  const card=cardsById.get(option.card),loc=locate(card);if(!loc)return;
  if(option.kind==='foundation'&&foundationFor(card)>=0)doFoundation(card,loc);
  else if(option.kind==='tableau'){
    const run=loc.type==='tableau'?tableau[loc.col].slice(loc.idx):[card];
    if(runValid(run)&&canTableau(card,Number(option.to[1])))doTableau(run,loc,Number(option.to[1]));
  }
}
function newGame(kind='Classic',mode=drawCount,audible=true){
  if(reversing)return;
  dealKind=kind;seed=kind==='Daily'?dailySeed():Math.floor(Math.random()*4294967296);
  drawCount=[1,3].includes(Number(mode))?Number(mode):1;
  elapsed=0;winRecorded=false;if(audible){sfx.unlock();}deal();if(audible){const generation=deckGeneration;deckReadyPromise.then(()=>{if(generation===deckGeneration&&board.isConnected)animateDeal();});}initial=snapshot();stats.played++;saveStats();saveGame();
  announce(kind==='Daily'?"Today's shared deal. Winning is not guaranteed.":'A fresh deal. Have fun!');
}
function restart(){
  if(!initial||reversing)return;stopAuto();clearHint();applySnapshot(initial);history=[];shufflesLeft=1;rewindsLeft=3;surprisesLeft=1;elapsed=0;won=false;
  hideWin();layout(true);updateBar();announce('Same cards, fresh start.');
}
function readCheckpoint(){
 for(const key of [SAVE_KEY,SAVE_KEY+'-previous']){
  try{const s=JSON.parse(localStorage.getItem(key));
   if(s?.version===1&&validSnapshot(s.state)&&validSnapshot(s.initial)&&[1,3].includes(s.drawCount)&&Number.isFinite(s.elapsed)&&s.elapsed>=0&&Array.isArray(s.history)&&s.history.every(validSnapshot))return s;
  }catch{}
 }return null;
}
function resume(){
  try{
    const saved=readCheckpoint();
    if(saved?.version!==1 || !validSnapshot(saved.state) || !validSnapshot(saved.initial) || ![1,3].includes(saved.drawCount) || !Number.isFinite(saved.elapsed)||saved.elapsed<0||!Array.isArray(saved.history)||!saved.history.every(validSnapshot))return false;
    checkpointSequence=Number(saved.checkpoint)||0;
    seed=saved.seed>>>0;drawCount=saved.drawCount;elapsed=saved.elapsed;initial=saved.initial;dealKind=saved.dealKind==='Daily'?'Daily':'Classic';winRecorded=!!saved.winRecorded;
    deal();applySnapshot(saved.state);history=saved.history;shufflesLeft=saved.shufflesLeft===0?0:1;
    surprisesLeft=saved.surprisesLeft===0?0:1;
    rewindsLeft=Number.isInteger(saved.rewindsLeft)?Math.max(0,Math.min(3,saved.rewindsLeft)):3;
    if(document.getElementById('drawMode'))document.getElementById('drawMode').value=drawCount;
    won=foundations.every(f=>f.length===13);if(won)showWin();layout(true);updateBar();announce('');return true;
  }catch{return false;}
}

function buildCards(){ cards=[]; let id=0; for(let s=0;s<4;s++) for(let r=1;r<=13;r++) cards.push({id:id++,suit:s,rank:r,color:SUITS[s].color,up:false}); }
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

function deal(){
  stopDeal();
  stopAuto();clearHint();
  buildCards();
  const d = shuffled(cards,seededRandom(seed));
  tableau=[[],[],[],[],[],[],[]];
  let i=0;
  for(let c=0;c<7;c++) for(let k=0;k<=c;k++){ const card=d[i++]; card.up=(k===c); tableau[c].push(card); }
  stock=d.slice(i); stock.forEach(c=>c.up=false);
  waste=[]; foundations=[[],[],[],[]]; moves=0; won=false; zc=1;
  history=[]; rewindsLeft=3; shufflesLeft=1;surprisesLeft=1;
  cardsById=new Map(cards.map(c=>[c.id,c]));

  board.innerHTML=''; slotEl={};
  const names=['t0','t1','t2','t3','t4','t5','t6','stock','waste','f0','f1','f2','f3'];
  for(const name of names){
    const s=document.createElement('div');
    s.className = 'slot ' + (name==='stock'?'stock':name==='waste'?'waste':name[0]==='f'?'foundation':'tableau');
    if(name[0]==='f') s.dataset.suit = SUITS[+name[1]].ch;
    board.appendChild(s); slotEl[name]=s;
  }
  elMap=new Map();
  for(const card of cards){
    const e=document.createElement('div'); e.className='card down'; e._s='d'; e.dataset.id=card.id;
    e.addEventListener('pointerdown', ev=>onPointerDown(ev, card));
    e.setAttribute('role','button');e.tabIndex=0;
    e._visualReady=createCardVisual(e,card,DECK_PATH+SUIT_NAME[card.suit]+'_'+card.rank+'.png');
    e.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();onClick(card);}});
    board.appendChild(e); elMap.set(card.id,e);
  }
  slotEl.stock.addEventListener('click', drawStock);
  slotEl.stock.setAttribute('role','button');slotEl.stock.tabIndex=0;slotEl.stock.setAttribute('aria-label','Draw cards or recycle stock');
  slotEl.stock.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();drawStock();}});
  hideWin(); layout(true); updateBar();prepareDeck();
}

/* ---- rules --------------------------------------------------------------- */
function foundationFor(card){
  const f=foundations[card.suit], t=topOf(f);
  if(!t) return card.rank===1 ? card.suit : -1;
  return t.rank===card.rank-1 ? card.suit : -1;
}
function canTableau(card, col){
  const t=topOf(tableau[col]);
  if(!t) return card.rank===13;
  return t.color!==card.color && t.rank===card.rank+1;
}
function runValid(run){
  for(let i=0;i<run.length;i++){
    if(!run[i].up) return false;
    if(i>0 && !(run[i-1].rank===run[i].rank+1 && run[i-1].color!==run[i].color)) return false;
  }
  return true;
}
function locate(card){
  let i=stock.indexOf(card); if(i>=0) return {type:'stock',idx:i};
  i=waste.indexOf(card); if(i>=0) return {type:'waste',idx:i};
  for(let f=0;f<4;f++){ i=foundations[f].indexOf(card); if(i>=0) return {type:'foundation',col:f,idx:i}; }
  for(let c=0;c<7;c++){ i=tableau[c].indexOf(card); if(i>=0) return {type:'tableau',col:c,idx:i}; }
  return null;
}

/* ---- interaction --------------------------------------------------------- */
function onClick(card){
  if(won||reversing) return;
  const loc=locate(card); if(!loc) return;
  if(loc.type==='stock'){ drawStock(); return; }
  if(!card.up) return;

  let run;
  if(loc.type==='foundation'){if(card!==topOf(foundations[loc.col]))return;run=[card];}
  else if(loc.type==='waste'){ if(card!==topOf(waste)) return; run=[card]; }
  else { run=tableau[loc.col].slice(loc.idx); if(!runValid(run)){ wiggle(card); return; } }

  if(loc.type!=='foundation' && run.length===1 && foundationFor(card)>=0){ doFoundation(card, loc); return; }
  for(let c=0;c<7;c++){
    if(loc.type==='tableau' && c===loc.col) continue;
    if(canTableau(run[0], c)){ doTableau(run, loc, c); return; }
  }
  wiggle(card);
}
function removeRun(loc, n){
  if(loc.type==='foundation')return foundations[loc.col].splice(-n,n);
  if(loc.type==='waste') return waste.splice(waste.length-n, n);
  return tableau[loc.col].splice(loc.idx);
}
function flipSource(loc){
  if(loc.type!=='tableau') return;
  const t=topOf(tableau[loc.col]);
  if(t && !t.up){ t.up=true; sfx.flip(); }
}
function bump(run){ for(const c of run) elMap.get(c.id).style.zIndex = 1000 + (zc++); }
function doFoundation(card, loc){
  pushHistory();
  removeRun(loc, 1);
  foundations[card.suit].push(card);
  bump([card]); flipSource(loc); moves++; sfx.foundation();haptic();
  layout(false); updateBar(); checkWin();
}
function doTableau(run, loc, col){
  pushHistory();
  removeRun(loc, run.length);
  for(const c of run) tableau[col].push(c);
  bump(run); flipSource(loc); moves++; sfx.place();haptic();
  layout(false); updateBar();
}
function drawStock(){
  if(won || reversing || (!stock.length&&!waste.length)) return;
  pushHistory();
  if(stock.length){ for(let i=0;i<drawCount&&stock.length;i++){const c=stock.pop(); c.up=true; waste.push(c); bump([c]);} sfx.deal(); }
  else if(waste.length){ while(waste.length){ const c=waste.pop(); c.up=false; stock.push(c); } sfx.shuffle(); }
  moves++; haptic(); layout(false); updateBar();
}
function autoFinish(){
  if(reversing)return;
  if(autoTimer){stopAuto();announce('Auto-finish stopped.');return;}
  if(stock.length||tableau.some(p=>p.some(c=>!c.up))){announce('Auto-finish becomes available when every card is revealed and the stock is empty.');return;}
  autoTimer=setInterval(()=>{if(won||!autoStep())stopAuto();},170);
}
function autoStep(){
  const cand=[];
  if(waste.length) cand.push([topOf(waste), {type:'waste'}]);
  for(let c=0;c<7;c++){ const p=tableau[c]; if(p.length && topOf(p).up) cand.push([topOf(p), {type:'tableau',col:c,idx:p.length-1}]); }
  for(const [card,loc] of cand){ if(foundationFor(card)>=0 && safeFoundation(card,foundations)){ doFoundation(card,loc); return true; } }
  return false;
}
function checkWin(){ if(foundations.every(f=>f.length===13)){
  won=true;stopAuto();
  if(!winRecorded){
    stats.wins++;stats.bestMoves=stats.bestMoves===null?moves:Math.min(stats.bestMoves,moves);
    stats.bestTime=stats.bestTime===null?elapsed:Math.min(stats.bestTime,elapsed);
    const score=Math.max(100,5200-moves*10-Math.floor(elapsed/5));
    const previousBest=(stats.highScores||[]).filter(r=>r.draw===drawCount).reduce((n,r)=>Math.max(n,r.score),0);if(previousBest>0&&score>previousBest)sfx.best();
    stats.highScores=[...(Array.isArray(stats.highScores)?stats.highScores:[]),{score,moves,seconds:elapsed,draw:drawCount,kind:dealKind,assisted:shufflesLeft===0||surprisesLeft===0,date:new Date().toISOString()}].sort((a,b)=>b.score-a.score).slice(0,20);
    winRecorded=true;saveStats();
  }
  sfx.win();haptic('win');showWin();updateBar();
} }

/* ---- Arline's time powers (Braid-style) ----------------------------------- */
// History entries are plain snapshots (abilities.js); ability counters live
// OUTSIDE the snapshots on purpose — rewinding a magic shuffle brings the
// cards back but the shuffle stays spent, so the powers can't be farmed.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
function pushHistory(){
  clearHint();
  history.push(abSnapshot({stock, waste, foundations, tableau, moves}));
}
function rewind(){
  if(!history.length||reversing) return;stopDeal();stopAuto();clearHint();won=false;hideWin();
  const s = abRestore(history.pop(), cardsById);
  stock = s.stock; waste = s.waste; foundations = s.foundations; tableau = s.tableau; moves = s.moves;
  haptic();sfx.undo();
  layout(false); updateBar();          // every card slides back — the Braid feel
}
async function timeReverse(){
  if(reversing||rewindsLeft<=0||!history.length)return;
  stopDeal();stopAuto();clearHint();reversing=true;sfx.mallet('reverse');rewindsLeft--;won=false;hideWin();
  const count=Math.min(3,history.length);
  board.classList.add('time-reversing');rewindWash();
  for(let i=0;i<count;i++){
    applySnapshot(history.pop());layout(false);updateBar();haptic();sfx.undo(true);
    if(!reducedMotion.matches&&!preferences.reducedMotion)await new Promise(r=>setTimeout(r,360));
  }
  reversing=false;board.classList.remove('time-reversing');updateBar();
  announce('Reversed '+count+' move'+(count===1?'':'s')+'. '+rewindsLeft+' Time Reverse charges left.');
}
function surprise(){
 if(won||reversing||surprisesLeft<=0)return;
 const buried=stock.slice(0,-1);
 const card=buried.find(c=>foundationFor(c)>=0)||buried.find(c=>tableau.some((_,col)=>canTableau(c,col)));
 if(!card){announce('No helpful buried stock card is available. Your Surprise is still yours.');return;}
 stopAuto();pushHistory();stock.splice(stock.indexOf(card),1);card.up=true;waste.push(card);surprisesLeft--;moves++;
 sfx.deal();sfx.surprise();haptic();layout(false);updateBar();
 const element=elMap.get(card.id);element.classList.add('shimmer');setTimeout(()=>element.classList.remove('shimmer'),700);
 announce('Surprise! '+RANKS[card.rank]+SUITS[card.suit].ch+' is ready to play. This deal will be marked assisted.');
}
function doMagicShuffle(){
  if(won || reversing || shufflesLeft <= 0) return;
  const snap = abSnapshot({stock, waste, foundations, tableau, moves});
  const n = magicShuffle({stock, tableau}, Math.random);
  if(n < 2){ sfx.invalid(); return; }  // fewer than 2 hidden cards: nothing to shuffle, don't spend it
  stopAuto();clearHint();history.push(snap);
  shufflesLeft--;
  shimmerHidden(); sfx.shuffle();
  layout(false); updateBar();
}
function rewindWash(){
  if(reducedMotion.matches||preferences.reducedMotion) return;
  let w = document.getElementById('rewindWash');
  if(!w){ w = document.createElement('div'); w.id = 'rewindWash'; w.className = 'rewind-wash'; document.body.appendChild(w); }
  w.classList.remove('on'); void w.offsetWidth; w.classList.add('on');
  clearTimeout(w._t); w._t = setTimeout(() => w.classList.remove('on'), 520);
}
function shimmerHidden(){
  if(reducedMotion.matches||preferences.reducedMotion) return;
  board.querySelectorAll('.card.down').forEach(e => {
    e.classList.add('shimmer');
    setTimeout(() => e.classList.remove('shimmer'), 720);
  });
}
function wiggle(card){ const e=elMap.get(card.id); if(e){ e.classList.add('shake'); setTimeout(()=>e.classList.remove('shake'),320); } sfx.invalid(); }

/* ---- pointer: tap OR drag (both work) ------------------------------------ */
function onPointerDown(ev, card){
  if(dealing){stopDeal();layout(true);}
  if(won||reversing) return;
  if(ev.isPrimary===false||ev.button>0)return;
  stopAuto();
  const loc=locate(card); if(!loc) return;
  drag={card, loc, sx:ev.clientX, sy:ev.clientY, moved:false, run:null, base:null};
  if((loc.type==='waste' && card===topOf(waste)) || (loc.type==='tableau' && card.up) || (loc.type==='foundation'&&card===topOf(foundations[loc.col]))){
    let run = loc.type==='tableau' ? tableau[loc.col].slice(loc.idx) : [card];
    if(loc.type==='tableau' && !runValid(run)) run=null;
    if(run){ drag.run=run; drag.base=run.map(c=>({...posMap.get(c.id)})); }
  }
  addEventListener('pointermove', onPointerMove);
  addEventListener('pointerup', onPointerUp, {once:true});
  addEventListener('pointercancel', onPointerUp, {once:true});
}
function onPointerMove(ev){
  if(!drag) return;
  const dx=ev.clientX-drag.sx, dy=ev.clientY-drag.sy;
  if(!drag.moved && Math.hypot(dx,dy)>7){drag.moved=true;if(drag.run){haptic();sfx.pickup();}}
  if(drag.moved && drag.run) drag.run.forEach((c,i)=>{
    const e=elMap.get(c.id); e.classList.add('dragging'); e.style.zIndex=3000+i;
    e.style.transform=`translate(${drag.base[i].x+dx}px,${drag.base[i].y+dy}px)`;
  });
}
function onPointerUp(ev){
  removeEventListener('pointermove', onPointerMove);
  removeEventListener('pointerup',onPointerUp);removeEventListener('pointercancel',onPointerUp);
  const d=drag; drag=null; if(!d) return;
  if(d.run) d.run.forEach(c=> elMap.get(c.id).classList.remove('dragging'));
  if(ev.type==='pointercancel'){layout(false);return;}
  if(!d.moved){ if(d.loc.type==='stock') drawStock(); else onClick(d.card); return; }   // a tap
  if(!d.run){ layout(false); return; }
  const hit=hitTest(ev.clientX, ev.clientY);                                            // a drag-drop
  if(hit && hit.type==='foundation' && hit.idx===d.card.suit && d.loc.type!=='foundation' && d.run.length===1 && foundationFor(d.card)>=0){ doFoundation(d.card, d.loc); return; }
  if(hit && hit.type==='tableau' && !(d.loc.type==='tableau' && hit.col===d.loc.col) && canTableau(d.run[0], hit.col)){ doTableau(d.run, d.loc, hit.col); return; }
  layout(false);   // illegal drop → slide back
}
function hitTest(cx, cy){
  if(!geo) return null;
  const r=board.getBoundingClientRect(); const x=cx-r.left, y=cy-r.top;
  const {gap,CW,CH,topY,tabY,colX,foundationX}=geo;
  if(y>=topY-CH*0.4 && y<=topY+CH*1.2) for(let f=0;f<4;f++){ const fx=foundationX(f); if(x>=fx-gap && x<=fx+CW+gap) return {type:'foundation',idx:f}; }
  if(y>=tabY-CH*0.4) for(let c=0;c<7;c++){ const cx2=colX(c); if(x>=cx2-gap && x<=cx2+CW+gap) return {type:'tableau',col:c}; }
  return null;
}

/* ---- layout (positions everything; transforms animate) ------------------- */
function layout(instant){
  if(instant) board.classList.add('no-anim');
  const W = board.clientWidth || 360;
  const H = board.clientHeight || 500;
  const pad = Math.max(6, Math.round(W*0.012));
  const gap = Math.max(4, Math.round(W*0.012));
  const CW = Math.max(38, Math.min(96, Math.floor((H-2*pad-24)/3.5), Math.floor((W - 2*pad - 6*gap) / 7)));
  const CH = Math.round(CW*ASPECT);
  board.style.setProperty('--cw', CW+'px'); board.style.setProperty('--ch', CH+'px');
  const tableLeft=Math.max(pad,(W-7*CW-6*gap)/2);
  const colX = c => tableLeft + c*(CW+gap);
  const topY = pad;
  const tabY = pad + CH + Math.round(gap*1.6);
  const dyDown = Math.max(24,Math.round(CH*0.17)), dyUp = Math.max(28,Math.round(CH*0.36));
  const right=preferences.deckOnRight;
  const stockX=colX(right?6:0),wasteX=colX(right?5:1);
  const foundationX=f=>colX(right?f:3+f);
  geo = {gap, CW, CH, topY, tabY, colX,foundationX};

  setSlot('stock', stockX, topY); setSlot('waste', wasteX, topY);
  for(let f=0;f<4;f++) setSlot('f'+f, foundationX(f), topY);
  for(let c=0;c<7;c++) setSlot('t'+c, colX(c), tabY);

  let maxY = tabY + CH;
  stock.forEach((card,i)=> put(card, stockX, topY, i));
  const ws = Math.max(0, waste.length-3);
  waste.forEach((card,i)=> put(card, wasteX + (right?-1:1)*Math.max(0,i-ws)*Math.round(CW*0.24), topY, i));
  for(let f=0;f<4;f++) foundations[f].forEach((card,i)=> put(card, foundationX(f), topY, i));
  for(let c=0;c<7;c++){
    let y=tabY, lastY=tabY; const p=tableau[c];
    const wanted=p.slice(0,-1).reduce((n,card)=>n+(card.up?dyUp:dyDown),0);
    const fit=Math.min(1, Math.max(0,H-pad-tabY-CH)/Math.max(1,wanted));
    p.forEach((card,i)=>{ put(card, colX(c), y, i); lastY=y; y += (card.up?dyUp:dyDown)*fit; });
    maxY = Math.max(maxY, lastY + CH);
  }
  // Height is supplied by the viewport grid; fan spacing fits each column.
  if(instant){ void board.offsetWidth; board.classList.remove('no-anim'); }
}
function animateDeal(resumed=false){
 stopDeal();sfx.shuffle();
 if(reducedMotion.matches||preferences.reducedMotion)return;
 dealing=true;board.classList.add('dealing');
 const source=posMap.get(topOf(stock)?.id)||{x:0,y:0};
 board.classList.add('no-anim');
 const entrance=resumed?[...tableau.flat(),...waste,...foundations.flat()]:tableau.flat();
 entrance.forEach((card,i)=>{const e=elMap.get(card.id);e.style.transform='translate('+source.x+'px,'+source.y+'px)';e.style.transitionDelay=(i*.023)+'s';});
 void board.offsetWidth;board.classList.remove('no-anim');
 dealFrame=requestAnimationFrame(()=>{layout(false);});
 dealTimer=setTimeout(stopDeal,Math.max(1100,entrance.length*23+350));
}
function setSlot(name,x,y){ const e=slotEl[name]; if(e) e.style.transform=`translate(${x}px,${y}px)`; }
function put(card,x,y,zi){ const e=elMap.get(card.id); e.style.transform=`translate(${x}px,${y}px)`; e.style.zIndex=zi+1; posMap.set(card.id,{x,y}); face(e,card); }
function face(e,card){
  e.setAttribute('aria-label',card.up?RANKS[card.rank]+' '+SUIT_NAME[card.suit]:'Face-down card');
  const loc=locate(card);e.tabIndex=card.up&&(loc?.type==='tableau'||(loc?.type==='waste'&&card===topOf(waste))||(loc?.type==='foundation'&&card===topOf(foundations[loc.col])))?0:-1;
  if(card.up&&loc)e.setAttribute('aria-label',e.getAttribute('aria-label')+', '+(loc.type==='tableau'?'column '+(loc.col+1):loc.type));
  e.classList.toggle('down',!card.up);e.classList.toggle('up',card.up);e.classList.toggle('red',card.up&&card.color==='red');
  e.dataset.pile=loc?.type||'';e.dataset.topStock=String(loc?.type==='stock'&&card===topOf(stock));
}

/* ---- win ----------------------------------------------------------------- */
function showWin(){dispatchEvent(new CustomEvent('solitaire-state',{detail:hud()}));}
function hideWin(){dispatchEvent(new CustomEvent('solitaire-state',{detail:hud()}));}
function confetti(){
  if(reducedMotion.matches||preferences.reducedMotion)return;
  const cols=['#e9c34a','#d11f33','#39a14a','#1f6fd0','#fff0b0'];
  for(let i=0;i<40;i++){ const d=document.createElement('div'); d.className='confetti';
    d.style.left=Math.random()*100+'vw'; d.style.background=cols[i%cols.length];
    d.style.animation=`drop ${1+Math.random()*1.6}s ${Math.random()*0.6}s ease-in forwards`;
    document.body.appendChild(d); setTimeout(()=>d.remove(),3200); }
}
function hud(){
 const home=foundations?.reduce((n,p)=>n+p.length,0)||0;
 const potential=Math.max(100,5200-moves*10-Math.floor(elapsed/5));
 const score=Math.floor(potential*home/52);
 const best=(stats.highScores||[]).filter(s=>s.draw===drawCount).reduce((n,s)=>Math.max(n,s.score),0);
 return {moves,elapsed,home,score,best,won,drawCount,rewindsLeft,shufflesLeft,historyLength:history.length,reversing,surprisesLeft,hint:!!currentHint,stats,dealKind};
}
function updateBar(persist=true){
  if(persist)saveGame();
  dispatchEvent(new CustomEvent('solitaire-state',{detail:hud()}));
}

/* ---- load screen --------------------------------------------------------- */
function prepareDeck(){
 const generation=++deckGeneration;deckReady=false;board.dataset.ready='false';dispatchEvent(new CustomEvent('solitaire-assets',{detail:{ready:false}}));
 deckReadyPromise=Promise.all([...elMap.values()].map(e=>e._visualReady).concat(prepareBack(DECK_PATH+'back'+(document.documentElement.dataset.back&&document.documentElement.dataset.back!=='blue'?'-'+document.documentElement.dataset.back:'')+'.jpg'))).then(results=>{
  if(generation!==deckGeneration||!board.isConnected)return;
  deckReady=true;board.dataset.ready='true';board.classList.toggle('back-failed',!results.at(-1).ok);const failed=results.filter(r=>!r.ok).length;
  dispatchEvent(new CustomEvent('solitaire-assets',{detail:{ready:true,failed}}));
  if(failed)announce('Some artwork could not load. Readable rank and suit cards are available; your game is safe.');
  return results;
 });
 return deckReadyPromise;
}
function hideLoader(){
  const el = document.getElementById('solLoad');
  if(el && !el.classList.contains('gone')){ el.classList.add('gone'); setTimeout(() => el.remove(), 600); }
}

/* React owns controls/HUD; this controller owns only the card-table DOM. */
export function mountSolitaire(element){
 board=element;
 const lifecycle=new AbortController(),signal=lifecycle.signal;
 window.__sol={
  get ready(){return deckReady;},get stock(){return stock.length;},get waste(){return waste.length;},get moves(){return moves;},
  get rewindsLeft(){return rewindsLeft;},get shufflesLeft(){return shufflesLeft;},
  get state(){return snapshot();},get drawCount(){return drawCount;},get historyLength(){return history.length;},
  get hud(){return hud();},
  hint,playHint,rewind,timeReverse,surprise,shuffle:doMagicShuffle,newGame,restart,autoFinish,save:saveGame
 };
 const resize=new ResizeObserver(()=>{if(!dealing)layout(true);});resize.observe(board);
 addEventListener('game-settings',()=>layout(true),{signal});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stopDeal();stopAuto();saveGame();}},{signal});
 document.addEventListener('freeze',saveGame,{signal});
 addEventListener('pagehide',saveGame,{signal});
 addEventListener('game-before-update',()=>{stopAuto();saveGame();},{signal});
 const resumed=resume();if(!resumed)newGame('Classic',1,false);
 {const generation=deckGeneration;deckReadyPromise.then(()=>{if(generation===deckGeneration&&board.isConnected&&!signal.aborted)animateDeal(resumed);});}
 const clock=setInterval(()=>{if(deckReady&&!won&&!document.hidden){elapsed++;updateBar(false);if(elapsed%5===0)saveGame();}},1000);
 deckReadyPromise.then(hideLoader);
 return ()=>{saveGame();stopDeal();stopAuto();clearInterval(clock);resize.disconnect();lifecycle.abort();removeEventListener('pointermove',onPointerMove);removeEventListener('pointerup',onPointerUp);removeEventListener('pointercancel',onPointerUp);drag=null;document.getElementById('rewindWash')?.remove();};
}
