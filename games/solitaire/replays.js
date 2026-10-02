import {validSnapshot} from './rules.js';
const KEY='solitaire-friends-replays-v1';
const copy=value=>JSON.parse(JSON.stringify(value));
export function validReplay(run){
 return run?.version===1&&typeof run.id==='string'&&[1,3].includes(run.drawCount)&&validSnapshot(run.initial)&&Number.isFinite(run.durationMs)&&run.durationMs>=0&&Array.isArray(run.events)&&run.events.length<=2000&&run.events.every((event,i)=>Number.isFinite(event.at)&&event.at>=0&&event.at<=run.durationMs&&(i===0||event.at>=run.events[i-1].at)&&validSnapshot(event.state));
}
export function beginReplay({seed,drawCount,initial}){
 return {version:1,id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),date:new Date().toISOString(),seed,drawCount,initial:copy(initial),events:[],durationMs:0,completed:false,assisted:false};
}
export function recordReplay(run,state,at,action='move'){
 if(!run)return;
 const last=run.events.at(-1)?.state||run.initial;
 if(JSON.stringify(last)===JSON.stringify(state))return;
 if(run.events.length>=2000){run.truncated=true;return;}
 const timestamp=Math.max(run.events.at(-1)?.at||0,Math.round(at));
 run.events.push({at:timestamp,action,state:copy(state)});run.durationMs=Math.max(run.durationMs,timestamp);
}
export function readReplays(){try{return (JSON.parse(localStorage.getItem(KEY))||[]).filter(validReplay);}catch{return [];}}
export function saveReplay(run){
 if(window.__gameErasingData||!run?.events.length||!validReplay(run))return;
 const runs=[copy(run),...readReplays().filter(old=>old.id!==run.id)].slice(0,12);
 // Bound local storage use; retain at least the newest recording.
 while(runs.length>1&&JSON.stringify(runs).length>1500000)runs.pop();
 try{localStorage.setItem(KEY,JSON.stringify(runs));}catch{}
}
export function replayStateAt(run,milliseconds){
 let low=0,high=run.events.length;
 while(low<high){const mid=(low+high)>>1;if(run.events[mid].at<=milliseconds)low=mid+1;else high=mid;}
 return low?run.events[low-1].state:run.initial;
}
