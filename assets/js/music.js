import {preferences,setPreference} from './preferences.js';
const player=new Audio(new URL('../audio/music.mp3',import.meta.url));player.loop=true;player.preload='none';
let gestured=false;
function sync(){
  player.volume=preferences.musicVolume;
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
