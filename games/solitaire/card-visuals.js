// Each persistent card owns exactly one image node and one readable fallback.
// Loading/decoding failures affect presentation only, never the saved deal.
export function createCardVisual(element,card,url){
 const image=document.createElement('img');image.className='cf';image.alt='';image.draggable=false;image.decoding='async';
 const fallback=document.createElement('span');fallback.className='face-fallback';fallback.setAttribute('aria-hidden','true');
 const rank=['','A','2','3','4','5','6','7','8','9','10','J','Q','K'][card.rank],suit=['♠','♥','♦','♣'][card.suit];
 const corner=document.createElement('span');corner.textContent=rank+' '+suit;
 const pip=document.createElement('strong');pip.textContent=suit;fallback.append(corner,pip);
 element.append(image,fallback);element.dataset.imageState='loading';
 return new Promise(resolve=>{
  let settled=false;
  function finish(ok){if(settled)return;settled=true;clearTimeout(timeout);image.onload=image.onerror=null;
   element.dataset.imageState=ok?'ready':'fallback';element.classList.toggle('face-failed',!ok);resolve({id:card.id,ok,url});}
  image.onerror=()=>finish(false);
  image.onload=async()=>{try{if(image.decode)await image.decode();finish(image.naturalWidth>0);}catch{finish(false);}};
  const timeout=setTimeout(()=>finish(false),15000);
  image.src=url;
  if(image.complete){if(image.naturalWidth)image.onload();else queueMicrotask(()=>finish(false));}
 });
}

const backs=new Map();
export function prepareBack(url){
 if(!backs.has(url))backs.set(url,new Promise(resolve=>{const image=new Image();let settled=false;
  const finish=ok=>{if(settled)return;settled=true;clearTimeout(timer);resolve({id:'back',ok,url});};
  image.onerror=()=>finish(false);image.onload=async()=>{try{if(image.decode)await image.decode();finish(image.naturalWidth>0);}catch{finish(false);}};
  const timer=setTimeout(()=>finish(false),15000);image.src=url;
 }));
 return backs.get(url);
}
