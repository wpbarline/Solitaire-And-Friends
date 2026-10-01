import {preferences,setPreference} from './preferences.js';
// Recorded card and interface cues. Each requested cue waits for its own decode;
// concurrent flip/place cues never suppress one another.
let ctx,master,compressor;const buffers=new Map(),bytes=new Map(),decoding=new Map(),voices=new Set();
const names=['deal-1.wav','deal-2.wav','deal-3.wav','shuffle.wav','tap.ogg','reward.ogg','tada.ogg'];
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
async function play(name,{volume=1,rate=1,delay=0}={}){
 if(isMuted()||document.hidden||!ac())return;
 const started=performance.now();const resumed=unlock();
 try{const b=await decode(name);await resumed;
 if(isMuted()||document.hidden||performance.now()-started>5000)return;
 if(voices.size>=8){const oldest=voices.values().next().value;oldest.stop();}
 const c=ac(),source=c.createBufferSource(),gain=c.createGain();source.buffer=b;source.playbackRate.value=rate;
 gain.gain.value=Math.min(1,preferences.effectsVolume)*volume;
 source.connect(gain);gain.connect(master);voices.add(source);
 source.onended=()=>{voices.delete(source);source.disconnect();gain.disconnect();};
 source.start(c.currentTime+delay);
 dispatchEvent(new CustomEvent('game-audio-cue',{detail:{name}}));
 }catch(e){dispatchEvent(new CustomEvent('game-audio-error',{detail:e.message}));}
}
let variant=0;
export const deal=()=>play('deal-'+(variant++%3+1)+'.wav');
export const flip=()=>play('deal-3.wav',{volume:.8,rate:1.07});
export const pickup=()=>play('deal-1.wav',{volume:.6,rate:1.1});
export const place=()=>play('deal-2.wav',{rate:.97+Math.random()*.06});
export const foundation=()=>{place();return play('reward.ogg',{volume:.65,delay:.08});};
export const invalid=()=>play('tap.ogg',{volume:.3,rate:.8});
export const shuffle=()=>play('shuffle.wav');
export const win=()=>{dispatchEvent(new CustomEvent('game-music-duck',{detail:1400}));return play('tada.ogg');};
export async function mallet(kind='tap'){
 if(isMuted()||!ac())return;await unlock();const c=ac();
 const phrases={tap:[880],open:[659,880],close:[880,659],hint:[1047,1319],reverse:[1319,1047,784]};
 const notes=phrases[kind]||phrases.tap;
 notes.forEach((f,i)=>{for(const [harmonic,level] of [[1,.13],[2.76,.025],[5.4,.009]]){
 const o=c.createOscillator(),g=c.createGain(),t=c.currentTime+i*.055;o.type='sine';o.frequency.value=f*harmonic;
 g.gain.setValueAtTime(.00001,t);g.gain.exponentialRampToValueAtTime(level*preferences.effectsVolume+.00001,t+.004);g.gain.exponentialRampToValueAtTime(.00001,t+.28);
 o.connect(g);g.connect(master);o.start(t);o.stop(t+.3);o.onended=()=>{o.disconnect();g.disconnect();};
 }});
 dispatchEvent(new CustomEvent('game-audio-cue',{detail:{name:'mallet-'+kind}}));
}
export async function undo(reverse=false){
 if(isMuted())return;unlock();const source=await decode('deal-2.wav');
 if(!buffers.has('card-return')){const b=ac().createBuffer(source.numberOfChannels,source.length,source.sampleRate);
 for(let channel=0;channel<source.numberOfChannels;channel++){const from=source.getChannelData(channel),to=b.getChannelData(channel);for(let i=0;i<source.length;i++)to[i]=from[source.length-1-i];}buffers.set('card-return',b);}
 play('card-return',{rate:reverse?.85:1});
 if(reverse)mallet('reverse');
}
export const tap=()=>mallet('tap');
export default {unlock,context,ready,toggleMute,isMuted,setMuted,deal,flip,pickup,place,foundation,invalid,shuffle,win,tap,undo,mallet};
