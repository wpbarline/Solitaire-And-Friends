// Semantic, bounded presentation only. No state, RNG, save or input authority.
// Supplied by the Vite shell to legacy controllers; never copied raw as TS.
export function createPresentation(board,{haptic,sound,preferences}){
 const lifecycle=new AbortController(),media=matchMedia('(prefers-reduced-motion: reduce)');
 const timers=new Set(),animations=new Set();let disposed=false,lastDealSound=-Infinity;
 const reduced=()=>preferences.reducedMotion||media.matches;
 function cancel(){for(const timer of timers)clearTimeout(timer);timers.clear();for(const animation of animations)animation.cancel();animations.clear();}
 function later(fn,delay){if(disposed||document.hidden||timers.size>=40)return;const timer=setTimeout(()=>{timers.delete(timer);if(!disposed&&!document.hidden)fn();},delay);timers.add(timer);}
 function glow(element,large=false,color='#ffe5a0b0'){
  if(disposed||document.hidden||reduced()||!element?.isConnected||animations.size>=8||!element.animate)return;
  // A painted outline keeps opaque paper and card input geometry unchanged.
  const animation=element.animate([{outline:'0px solid transparent',outlineOffset:'0px'},{outline:(large?'3':'2')+'px solid '+color,outlineOffset:large?'5px':'2px'},{outline:'0px solid transparent',outlineOffset:large?'9px':'4px'}],{duration:large?520:280,easing:'cubic-bezier(.16,.7,.3,1)'});
  animations.add(animation);animation.onfinish=()=>{animations.delete(animation);animation.cancel();};
 }
 function emit(event){
  if(disposed||document.hidden)return;
  dispatchEvent(new CustomEvent('game-presentation',{detail:{type:event.type}}));
  switch(event.type){
   case 'deal-started':cancel();sound.shuffle();break;
   case 'card-landed':
    glow(event.element);if(performance.now()-lastDealSound>100){lastDealSound=performance.now();sound.deal();haptic('deal');}break;
   case 'card-revealed':glow(event.element);haptic('reveal');break;
   case 'foundation-advanced':glow(event.element,true);haptic('foundation');break;
   case 'reverse-used':case 'shuffle-used':
    for(const element of event.elements.slice(0,6))glow(element,true);haptic(event.type==='reverse-used'?'reverse':'shuffle');break;
   case 'game-won':haptic('win');break;
   case 'invalid-action':glow(event.element,false,'#e58e9c');haptic('invalid');break;
  }
 }
 function changed(){if(reduced()||document.hidden)cancel();}
 document.addEventListener('visibilitychange',changed,{signal:lifecycle.signal});
 addEventListener('game-settings',changed,{signal:lifecycle.signal});media.addEventListener('change',changed,{signal:lifecycle.signal});
 return {emit,later,cancel,get pending(){return timers.size+animations.size;},dispose(){disposed=true;cancel();lifecycle.abort();}};
}
