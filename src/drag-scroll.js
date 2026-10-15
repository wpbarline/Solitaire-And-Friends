// Touch keeps native panning. Mouse/pen can grab overflow surfaces just as a
// finger does, without converting a drag into a card/button click.
export function installDragScroll(root=document){
 const lifecycle=new AbortController(),options={signal:lifecycle.signal,capture:true};
 let gesture=null,blocked=null,blockUntil=0;
 function candidates(target){
  const result=[];
  for(let node=target;node instanceof Element;node=node.parentElement){
   const style=getComputedStyle(node);
   const x=/(auto|scroll)/.test(style.overflowX)&&node.scrollWidth>node.clientWidth+1;
   const y=/(auto|scroll)/.test(style.overflowY)&&node.scrollHeight>node.clientHeight+1;
   if(x||y)result.push({node,x,y,left:node.scrollLeft,top:node.scrollTop});
  }return result;
 }
 function end(){
  const old=gesture;gesture=null;
  if(old?.surface){blocked=old.surface.node;blockUntil=performance.now()+400;try{blocked.releasePointerCapture(old.id);}catch{}}
 }
 root.addEventListener('pointerdown',event=>{
  if(event.button!==0||event.isPrimary===false)return;
  end();blocked=null;
  if(event.pointerType==='touch')return;
  if(!(event.target instanceof Element)||event.target.closest('input,select,textarea,[contenteditable="true"],.board'))return;
  const surfaces=candidates(event.target);if(!surfaces.length)return;
  gesture={id:event.pointerId,x:event.clientX,y:event.clientY,surfaces,surface:null};
 },options);
 root.addEventListener('pointermove',event=>{
  if(!gesture||gesture.id!==event.pointerId)return;
  const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
  if(!gesture.surface){
   if(Math.hypot(dx,dy)<8)return;
   const horizontal=Math.abs(dx)>Math.abs(dy);
   gesture.surface=gesture.surfaces.find(s=>horizontal?s.x:s.y);
   if(!gesture.surface){gesture=null;return;}
   try{gesture.surface.node.setPointerCapture(event.pointerId);}catch{end();return;}
  }
  const {node,x,y,left,top}=gesture.surface;if(!node.isConnected){end();return;}
  event.preventDefault();
  if(x)node.scrollLeft=left-dx;if(y)node.scrollTop=top-dy;
 },{...options,passive:false});
 for(const name of ['pointerup','pointercancel','lostpointercapture'])root.addEventListener(name,event=>{if(gesture?.id===event.pointerId)end();},options);
 root.addEventListener('click',event=>{
  if(event.detail!==0&&blocked&&performance.now()<blockUntil&&blocked.contains(event.target)){event.preventDefault();event.stopImmediatePropagation();blocked=null;}
 },options);
 addEventListener('blur',end,{signal:lifecycle.signal});
 return()=>{end();blocked=null;lifecycle.abort();};
}
