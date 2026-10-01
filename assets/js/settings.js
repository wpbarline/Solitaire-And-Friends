import {preferences,setPreference} from './preferences.js';
import sfx from './sfx.js';
import music from './music.js';
let returnFocus;
function audioControls(panel){
  if(panel.querySelector('.audio-settings'))return;
  const box=document.createElement('section');box.className='audio-settings';
  box.innerHTML=`<h2>Sound & comfort</h2>
    <label><input type="checkbox" data-pref="music"> Music</label>
    <label>Music volume <input type="range" min="0" max="1" step=".05" data-pref="musicVolume"></label>
    <label><input type="checkbox" data-pref="effects"> Sound effects</label>
    <label>Effects volume <input type="range" min="0" max="1" step=".05" data-pref="effectsVolume"></label>
    <label><input type="checkbox" data-pref="reducedMotion"> Fewer animations</label>
    <label><input type="checkbox" data-pref="haptics"> Gentle vibration</label>
    <small>Vibration works on supported devices, usually Android. iPhone browsers may not support it.</small>
    <button type="button" class="btn" id="soundPreview">Try card sounds</button>
    <a href="${new URL('../audio/CREDITS.html',import.meta.url)}">Audio credits</a>`;
  box.querySelectorAll('[data-pref]').forEach(input=>{
    const k=input.dataset.pref;if(input.type==='checkbox')input.checked=preferences[k];else input.value=preferences[k];
    input.addEventListener('input',()=>{sfx.unlock();setPreference(k,input.type==='checkbox'?input.checked:Number(input.value));});
  });
  box.querySelector('#soundPreview').onclick=()=>{sfx.unlock();setPreference('effects',true);sfx.shuffle();setTimeout(()=>sfx.deal(),1450);};
  panel.appendChild(box);
  if(panel.classList.contains('ds-panel')){
    const tabs=document.createElement('div');tabs.className='settings-tabs';tabs.innerHTML='<button type="button" aria-pressed="true">Sound</button><button type="button" aria-pressed="false">Cards</button>';panel.prepend(tabs);
    const children=[...panel.children].filter(e=>e!==tabs&&!e.classList.contains('ds-close'));
    function tab(audio){children.forEach(e=>e.hidden=audio?e!==box:e===box);[...tabs.children].forEach((e,i)=>e.setAttribute('aria-pressed',String(i===(audio?0:1))));}
    tabs.children[0].onclick=()=>tab(true);tabs.children[1].onclick=()=>tab(false);tab(true);
  }
}
export function openSettings(){
  returnFocus=document.activeElement;
  const menu=document.getElementById('gameMenu');if(menu?.open)menu.close();
  if(window.DeckPrefs){window.DeckPrefs.open();audioControls(document.querySelector('#deck-settings .ds-panel'));}
  else {
    let dlg=document.getElementById('audio-dialog');
    if(!dlg){dlg=document.createElement('dialog');dlg.id='audio-dialog';dlg.innerHTML='<button class="btn" id="closeAudio">Close</button>';document.body.appendChild(dlg);audioControls(dlg);dlg.querySelector('#closeAudio').onclick=()=>dlg.close();}
    dlg.showModal();
  }
  document.querySelector('#deck-settings .ds-close, #audio-dialog button')?.focus();
}
// Capture the existing Settings gesture, keeping its protected deck module intact.
document.addEventListener('click',e=>{if(e.target.closest('[data-settings], [data-audio-settings]')){e.preventDefault();e.stopImmediatePropagation();openSettings();}},true);
new MutationObserver(()=>{
  const panel=document.querySelector('#deck-settings .ds-panel');
  if(panel){audioControls(panel);const close=panel.querySelector('.ds-close');if(close&&!close.dataset.focusRestore){close.dataset.focusRestore='1';close.addEventListener('click',()=>returnFocus?.focus());}}
}).observe(document.body,{childList:true});
document.addEventListener('keydown',e=>{
  const panel=document.querySelector('#deck-settings .ds-panel');
  if(!panel||e.key!=='Tab')return;
  const items=[...panel.querySelectorAll('button,a,input')].filter(x=>!x.disabled);
  if(e.shiftKey&&document.activeElement===items[0]){e.preventDefault();items.at(-1).focus();}
  else if(!e.shiftKey&&document.activeElement===items.at(-1)){e.preventDefault();items[0].focus();}
});
