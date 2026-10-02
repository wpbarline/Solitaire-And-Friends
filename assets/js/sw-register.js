/* Install offline assets automatically. Save, then apply new code between moves.
   Never reload for first installation or while a gesture/dialog is active. */
let lastInput=Date.now(),pending=false,reloading=false;
for(const event of ['pointerdown','pointermove','keydown'])addEventListener(event,()=>{lastInput=Date.now();},{passive:true});
function applyUpdate(){
 if(!pending||reloading||document.hidden||Date.now()-lastInput<3000)return;
 if(document.querySelector('.dragging,.time-reversing,dialog[open],.ds-overlay'))return;
 // UNO has no persistent checkpoint yet: finish the round before upgrading.
 if(window.__uno&&!window.__uno.over)return;
 reloading=true;window.__gameApplyingUpdate=true;try{sessionStorage.setItem('solitaire-friends-auto-update','yes');}catch{}dispatchEvent(new Event('game-before-update'));location.reload();
}
if('serviceWorker' in navigator){
 let controlled=!!navigator.serviceWorker.controller;
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(controlled){pending=true;applyUpdate();}else controlled=true;});
 const swUrl=new URL('../../sw.js',import.meta.url),scope=new URL('../../',import.meta.url);
 navigator.serviceWorker.register(swUrl,{scope,updateViaCache:'none'}).then(reg=>{
  reg.update().catch(()=>{});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){reg.update().catch(()=>{});applyUpdate();}});
  setInterval(()=>reg.update().catch(()=>{}),30*60*1000);
 }).catch(()=>{});
 setInterval(applyUpdate,1000);
 // Persistent storage reduces eviction on supported browsers; refusal changes no gameplay.
 addEventListener('pointerdown',()=>{navigator.storage?.persist?.().catch(()=>{});},{once:true,passive:true});
}
