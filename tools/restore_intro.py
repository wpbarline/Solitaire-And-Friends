"""Restore owned upstream shader, adapted as a bounded React scene effect."""
from pathlib import Path
import subprocess
r=Path(__file__).resolve().parents[1]
old=subprocess.check_output(['git','show','d1ef00f:assets/js/intro.js'],cwd=r).decode()
helpers=old[old.index('function buildProgram(gl)'):]
helpers=helpers.replace('vec3(0.015,0.04,0.03), vec3(0.02,0.06,0.05)','vec3(0.10,0.04,0.19), vec3(0.24,0.13,0.34)')
helpers=helpers.replace('outColor = vec4(col, 1.0);','float alpha = hit ? 0.82 : 0.0; outColor = vec4(col*alpha, alpha);')
prefix='''// Adapted from MansfieldPlumbing/ArlineArcade d1ef00f: original falling-card/chip shader.
export function startIntroShader(canvas,{reduced=false}={}){
 const media=matchMedia('(prefers-reduced-motion: reduce)');canvas.dataset.active='false';
 if(reduced||media.matches)return ()=>{};
 let gl;try{gl=canvas.getContext('webgl2',{alpha:true,antialias:false,powerPreference:'low-power'});}catch{}
 if(!gl){canvas.dataset.renderer='fallback';return ()=>{};}
 const program=buildProgram(gl);if(!program){canvas.dataset.renderer='fallback';return ()=>{};}
 canvas.dataset.renderer='webgl2';gl.useProgram(program);const vao=gl.createVertexArray();gl.bindVertexArray(vao);
 const res=gl.getUniformLocation(program,'u_res'),time=gl.getUniformLocation(program,'u_time');
 let raf=0,start=0,last=0,hidden=0,done=false;
 function stop(){done=true;cancelAnimationFrame(raf);canvas.dataset.active='false';gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);}
 function draw(now){if(done||document.hidden)return;if(media.matches||document.documentElement.classList.contains('reduce-motion')){stop();return;}
  if(!start)start=now;const t=(now-start)/1000;if(t>5.2){stop();return;}
  if(now-last>=33){last=now;const b=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio,1.25),s=Math.min(1,900/Math.max(b.width*d,b.height*d));
   const w=Math.max(2,Math.round(b.width*d*s)),h=Math.max(2,Math.round(b.height*d*s));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
   gl.viewport(0,0,w,h);gl.uniform2f(res,w,h);gl.uniform1f(time,t);gl.drawArrays(gl.TRIANGLES,0,3);canvas.dataset.active='true';canvas.style.opacity=String(Math.min(1,(5.2-t)/.6));}
  raf=requestAnimationFrame(draw);
 }
 function visibility(){if(document.hidden){hidden=performance.now();cancelAnimationFrame(raf);canvas.dataset.active='false';}else if(!done){if(start&&hidden)start+=performance.now()-hidden;hidden=0;raf=requestAnimationFrame(draw);}}
 function motion(){if(media.matches)stop();}function lost(e){e.preventDefault();stop();canvas.dataset.renderer='fallback';}
 document.addEventListener('visibilitychange',visibility);media.addEventListener('change',motion);canvas.addEventListener('webglcontextlost',lost);
 if(!document.hidden)raf=requestAnimationFrame(draw);
 return()=>{stop();document.removeEventListener('visibilitychange',visibility);media.removeEventListener('change',motion);canvas.removeEventListener('webglcontextlost',lost);gl.deleteVertexArray(vao);for(const shader of gl.getAttachedShaders(program)||[])gl.deleteShader(shader);gl.deleteProgram(program);};
}
'''
(r/'src/intro-shader.js').write_text(prefix+helpers,encoding='utf-8')
