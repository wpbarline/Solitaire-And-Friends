import {preferences,setPreference} from './preferences.js';
// Recorded card and interface cues. Each requested cue waits for its own decode;
// concurrent flip/place cues never suppress one another.
let gestureSeen=false;for(const type of ['pointerdown','keydown'])addEventListener(type,e=>{if(e.isTrusted)gestureSeen=true;},{passive:true});
let ctx,master,compressor;const buffers=new Map(),bytes=new Map(),decoding=new Map(),voices=new Set();
const cues={
 launch:{file:'launch-chime.wav',gain:.85,bus:'UI',duck:1100},open:{file:'menu-open.wav',gain:.6,bus:'UI'},close:{file:'menu-close.wav',gain:.5,bus:'UI'},
 hint:{file:'hint-chime.wav',gain:.65,bus:'UI'},reverse:{file:'reverse-chime.wav',gain:.6,bus:'UI',duck:950},tap:{file:'tap-chime.wav',gain:.4,bus:'UI'},
 surprise:{file:'surprise-bonus.ogg',gain:.45,bus:'Rewards',duck:4300},best:{file:'hint-chime.wav',gain:.4,bus:'Rewards',duck:1000},
 shuffle:{file:'card-shuffle.wav',gain:.5,bus:'Cards'},win:{file:'tada.ogg',gain:.65,bus:'Rewards',duck:1500}
};
const names=[...new Set(['card-contact.wav','tap.ogg','reward.ogg',...Object.values(cues).map(c=>c.file)])];
const buses=new Map();const busTrim={Cards:1,UI:.85,Rewards:.85};
function ac(){
 if(!ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
 ctx=new AC();master=ctx.createGain();master.gain.value=.9;
 compressor=ctx.createDynamicsCompressor();compressor.threshold.value=-8;compressor.knee.value=8;compressor.ratio.value=5;compressor.attack.value=.003;compressor.release.value=.18;
 master.connect(compressor);compressor.connect(ctx.destination);}
 return ctx;
}
function getBytes(name){
 if(!bytes.has(name))bytes.set(name,fetch(new URL('../audio/'+name,import.meta.url)).then(r=>{if(!r.ok)throw Error('Audio '+r.status);return r.arrayBuffer();}).catch(e=>{bytes.delete(name);throw e;}));
 return bytes.get(name);
}
names.forEach(name=>getBytes(name).catch(()=>{}));
export function unlock(){
 const c=ac();if(!c)return Promise.resolve();
 // Resume inside the user's gesture, before any asynchronous decoding.
 const resume=c.state==='running'?Promise.resolve():c.resume();
 const source=c.createBufferSource();source.buffer=c.createBuffer(1,1,c.sampleRate);source.connect(master);source.start();source.onended=()=>source.disconnect();
 return resume.catch(()=>{});
}
export function context(){return ac();}
async function decode(name){
 if(buffers.has(name))return buffers.get(name);
 if(!decoding.has(name))decoding.set(name,getBytes(name).then(data=>ac().decodeAudioData(data.slice(0))).then(b=>{buffers.set(name,b);return b;}).finally(()=>decoding.delete(name)));
 return decoding.get(name);
}
export async function ready(){const c=ac();if(!c)return;await Promise.all(names.map(decode));}
export function isMuted(){return !preferences.effects;}
export function setMuted(value){setPreference('effects',!value);}
export function toggleMute(){setMuted(!isMuted());return isMuted();}
async function play(name,{volume=1,rate=1,delay=0,bus='Cards',event=name}={}){
 if(isMuted()||document.hidden||(!navigator.userActivation?.hasBeenActive&&!gestureSeen&&ctx?.state!=='running')||!ac())return;
 const started=performance.now();const resumed=unlock();
 try{const b=await decode(name);await resumed;
 if(isMuted()||document.hidden||performance.now()-started>5000)return;
 if(voices.size>=8){const oldest=voices.values().next().value;oldest.stop();}
 const c=ac(),source=c.createBufferSource(),gain=c.createGain();source.buffer=b;source.playbackRate.value=rate;
 gain.gain.value=Math.min(1,preferences.effectsVolume)*volume;
 if(!buses.has(bus)){const node=c.createGain();node.gain.value=busTrim[bus]||1;node.connect(master);buses.set(bus,node);}
 source.connect(gain);gain.connect(buses.get(bus));voices.add(source);
 source.onended=()=>{voices.delete(source);source.disconnect();gain.disconnect();};
 source.start(c.currentTime+delay);
 dispatchEvent(new CustomEvent('game-audio-cue',{detail:{name,event,bus}}));
 }catch(e){dispatchEvent(new CustomEvent('game-audio-error',{detail:e.message}));}
}
export function emit(event){const cue=cues[event];if(!cue)return Promise.resolve();if(cue.duck&&!isMuted())dispatchEvent(new CustomEvent('game-music-duck',{detail:cue.duck}));return play(cue.file,{volume:cue.gain,bus:cue.bus,event});}
export const deal=()=>play('card-contact.wav',{volume:.38,rate:.98+Math.random()*.04,event:'deal'});
export const flip=()=>play('card-contact.wav',{volume:.32,rate:1.08,event:'flip'});
export const pickup=()=>play('card-contact.wav',{volume:.3,rate:1.03,event:'pickup'});
export const place=()=>play('card-contact.wav',{volume:.4,rate:.96+Math.random()*.04,event:'place'});
export const foundation=()=>{place();return play('tap-chime.wav',{volume:.18,bus:'Rewards',delay:.08,event:'foundation'});};
export const invalid=()=>play('tap.ogg',{volume:.16,rate:.8,bus:'UI',event:'invalid'});
export const shuffle=()=>emit('shuffle');
export const win=()=>emit('win');
export const launch=()=>emit('launch');
export const surprise=()=>emit('surprise');
export const best=()=>emit('best');
export const mallet=kind=>emit(kind);
export async function undo(reverse=false){
 if(isMuted())return;unlock();let source;try{source=await decode('card-contact.wav');}catch(e){dispatchEvent(new CustomEvent('game-audio-error',{detail:e.message}));return;}
 if(!buffers.has('card-return')){const b=ac().createBuffer(source.numberOfChannels,source.length,source.sampleRate);
 for(let channel=0;channel<source.numberOfChannels;channel++){const from=source.getChannelData(channel),to=b.getChannelData(channel);for(let i=0;i<source.length;i++)to[i]=from[source.length-1-i];}buffers.set('card-return',b);}
 play('card-return',{volume:.35,rate:reverse?.85:1,event:'undo'});
}
export const tap=()=>mallet('tap');
export default {unlock,context,ready,toggleMute,isMuted,setMuted,deal,flip,pickup,place,foundation,invalid,shuffle,win,launch,surprise,best,emit,tap,undo,mallet};
