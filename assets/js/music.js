import {preferences,setPreference} from './preferences.js';
const player=new Audio(new URL('../audio/cozy-puzzle.ogg',import.meta.url));player.loop=true;player.preload='none';
let gestured=false,ducked=false,duckTimer;
function sync(){
  player.volume=preferences.musicVolume*(ducked?.3:1);
  if(preferences.music && gestured && !document.hidden)player.play().catch(()=>{});else player.pause();
  const btn=document.getElementById('musicToggle');if(btn){btn.textContent=preferences.music?'Music on':'Music off';btn.setAttribute('aria-pressed',String(preferences.music));}
}
function start(){gestured=true;sync();}
function stop(){player.pause();}
function toggle(){gestured=true;setPreference('music',!preferences.music);}
addEventListener('pointerdown',start,{once:true});addEventListener('keydown',start,{once:true});
addEventListener('game-settings',sync);document.addEventListener('visibilitychange',sync);
document.getElementById('musicToggle')?.addEventListener('click',toggle);sync();
export default {start,stop,toggle,isOn:()=>preferences.music};

addEventListener('game-music-duck',e=>{ducked=true;sync();clearTimeout(duckTimer);duckTimer=setTimeout(()=>{ducked=false;sync();},e.detail||1000);});
