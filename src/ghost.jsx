import React,{useEffect,useState} from 'react';
import {readReplays,replayStateAt} from '../games/solitaire/replays.js';
const base=new URL(import.meta.env.BASE_URL,location.origin);
const asset=path=>new URL(path,base).href;
const clock=ms=>Math.floor(ms/60000)+':'+String(Math.floor(ms/1000)%60).padStart(2,'0');
export function GhostChoices({onChoose}){
 const runs=readReplays().filter(run=>!run.truncated).sort((a,b)=>Number(b.completed)-Number(a.completed)||a.durationMs-b.durationMs);
 return <div className="ghost-choices"><p>A race uses the exact same cards as your past game. Starting replaces the current deal.</p>{runs.map(run=><button key={run.id} onClick={()=>onChoose(run)}><strong>{run.completed?'Finished game':'Practice run'} · {clock(run.durationMs)}</strong><span>{run.events.length} actions · Draw {run.drawCount} · {new Date(run.date).toLocaleDateString()}{run.assisted?' · Assisted':''}</span></button>)}{!runs.length&&<p>Play Solitaire first. Your moves and times will be recorded on this device for a future race.</p>}</div>;
}
export function GhostBoard({run,controls,onControls,onLeave}){
 const [at,setAt]=useState(0);
 useEffect(()=>{setAt(0);const timer=setInterval(()=>setAt(window.__sol?.milliseconds||0),200);return()=>clearInterval(timer);},[run.id]);
 const state=replayStateAt(run,at),home=state.foundations.reduce((n,p)=>n+p.length,0),finished=at>=run.durationMs;
 const won=window.__sol?.hud.won;
 const result=won?(run.completed?(at<run.durationMs?'You beat your past self!':at===run.durationMs?'A tie!':'Your past self won this race.'):'Practice finished!'):(finished?(run.completed?'Your past self finished. Keep going!':'Practice replay finished. Keep going!'):'');
 let back='blue';try{back=JSON.parse(localStorage.getItem('arline-deck-prefs'))?.back||'blue';}catch{}
 const backUrl=asset('assets/cards/royal/back'+(back==='blue'?'':'-'+back)+'.jpg');
 const card=(item,x,y,key)=>{const suit=['spade','heart','diamond','club'][Math.floor(item.id/13)],rank=item.id%13+1;return <g key={key||item.id} transform={`translate(${x} ${y})`}><rect width="78" height="108" rx="7" fill="#fffaf0" stroke="#142d27"/><image href={item.up?asset(`assets/cards/royal/${suit}_${rank}.png`):backUrl} x="1" y="1" width="76" height="106" preserveAspectRatio="none"/></g>;};
 const longest=Math.max(...state.tableau.map(p=>p.length),1),step=Math.min(18,82/Math.max(1,longest-1));
 return <section className="ghost-panel" aria-label="Your past game"><header><div><strong>{result||'Your past self'}</strong><span>{clock(Math.min(at,run.durationMs))} / {clock(run.durationMs)} · {home}/52</span></div><button aria-pressed={controls} onClick={onControls}>Controls</button><button onClick={onLeave}>End race</button></header><svg viewBox="0 0 720 330" role="img" aria-label={`Past game at ${clock(at)}, ${home} cards home`}>
 {[0,1,2,3].map(i=><rect key={i} x={15+i*98} y="16" width="78" height="108" rx="7" fill="none" stroke="#ffffff35"/>)}
 {state.foundations.map((pile,i)=>pile.length?card(pile.at(-1),15+i*98,16):null)}
 {state.waste.slice(-3).map((item,i)=>card(item,495+i*17,16))}
 {state.stock.length?card(state.stock.at(-1),623,16):null}
 <text x="662" y="139" fill="#d6e8df" fontSize="18" textAnchor="middle">{state.stock.length}</text>
 {state.tableau.flatMap((pile,col)=>pile.map((item,row)=>card(item,15+col*98,140+row*step)))}
 </svg></section>;
}
