// Adapted from MansfieldPlumbing/ArlineArcade d1ef00f: original falling-card/chip shader.
export function startIntroShader(canvas,{reduced=false}={}){
 const media=matchMedia('(prefers-reduced-motion: reduce)');canvas.dataset.active='false';
 if(reduced||media.matches)return ()=>{};
 let gl;try{gl=canvas.getContext('webgl2',{alpha:true,premultipliedAlpha:true,antialias:false,powerPreference:'low-power'});}catch{}
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
function buildProgram(gl){
  const vs = `#version 300 es
  void main(){ vec2 p = vec2((gl_VertexID<<1)&2, gl_VertexID&2); gl_Position = vec4(p*2.0-1.0, 0.0, 1.0); }`;
  const v = compile(gl, gl.VERTEX_SHADER, vs);
  const f = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if(!v||!f) return null;
  const p = gl.createProgram();
  gl.attachShader(p,v); gl.attachShader(p,f); gl.linkProgram(p);
  if(!gl.getProgramParameter(p, gl.LINK_STATUS)){ console.warn('intro link:', gl.getProgramInfoLog(p)); return null; }
  return p;
}
function compile(gl, type, src){
  const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
  if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){ console.warn('intro shader:', gl.getShaderInfoLog(s)); return null; }
  return s;
}

/* ---- the original fragment shader ---------------------------------------- */
const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;
uniform vec2 u_res;
uniform float u_time;

const float PI = 3.14159265;
const int NCARD = 18;
const int NCHIP = 14;

float hash11(float p){ return fract(sin(p*127.13)*43758.5453); }

mat3 rotX(float a){ float s=sin(a),c=cos(a); return mat3(1.,0.,0., 0.,c,s, 0.,-s,c); }
mat3 rotY(float a){ float s=sin(a),c=cos(a); return mat3(c,0.,-s, 0.,1.,0., s,0.,c); }
mat3 rotZ(float a){ float s=sin(a),c=cos(a); return mat3(c,s,0., -s,c,0., 0.,0.,1.); }

float sdBox(vec2 p, vec2 b, float r){ vec2 d=abs(p)-b+r; return min(max(d.x,d.y),0.0)+length(max(d,0.0))-r; }

/* --- fill masks (1 inside, 0 outside), my own constructions --------------- */
float mCircle(vec2 p, vec2 c, float r){ return 1.0 - smoothstep(r-0.03, r+0.02, length(p-c)); }
float mBox(vec2 p, vec2 c, vec2 b, float r){ return 1.0 - smoothstep(0.0,0.045, sdBox(p-c,b,r)); }
float mTri(vec2 p, vec2 a, vec2 b, vec2 c){
  float d1=(p.x-b.x)*(a.y-b.y)-(a.x-b.x)*(p.y-b.y);
  float d2=(p.x-c.x)*(b.y-c.y)-(b.x-c.x)*(p.y-c.y);
  float d3=(p.x-a.x)*(c.y-a.y)-(c.x-a.x)*(p.y-a.y);
  float mn=min(d1,min(d2,d3)), mx=max(d1,max(d2,d3));
  return (mn<0.0 && mx>0.0) ? 0.0 : 1.0;
}
float mDiamond(vec2 p){ p=abs(p); return 1.0 - smoothstep(0.0,0.05, (p.x/0.60 + p.y/0.82) - 1.0); }
float mHeart(vec2 p){
  float a = max(mCircle(p, vec2(-0.30,0.30), 0.36), mCircle(p, vec2(0.30,0.30), 0.36));
  return max(a, mTri(p, vec2(-0.66,0.34), vec2(0.66,0.34), vec2(0.0,-0.80)));
}
float mSpade(vec2 p){
  float a = mTri(p, vec2(0.0,0.92), vec2(-0.58,-0.14), vec2(0.58,-0.14));   // pointed body
  a = max(a, mCircle(p, vec2(-0.32,-0.20), 0.33));                           // bottom lobes
  a = max(a, mCircle(p, vec2(0.32,-0.20), 0.33));
  return max(a, mTri(p, vec2(0.0,-0.10), vec2(-0.20,-0.64), vec2(0.20,-0.64))); // flared stem
}
float mClub(vec2 p){
  float a = mCircle(p, vec2(0.0,0.34), 0.30);
  a = max(a, mCircle(p, vec2(-0.32,-0.06), 0.30));
  a = max(a, mCircle(p, vec2(0.32,-0.06), 0.30));
  return max(a, mTri(p, vec2(0.0,-0.04), vec2(-0.17,-0.60), vec2(0.17,-0.60))); // flared stem
}
float suitMask(vec2 p, int s){
  if(s==0) return mDiamond(p);
  if(s==1) return mHeart(p);
  if(s==2) return mSpade(p);
  return mClub(p);
}

vec3 cardFront(vec2 uv, int s){
  vec3 cream=vec3(0.97,0.95,0.89), gold=vec3(0.85,0.69,0.37);
  vec3 ink = (s<2) ? vec3(0.80,0.12,0.12) : vec3(0.10,0.11,0.16);
  vec3 col = cream;
  float border = 1.0 - smoothstep(0.0,0.055, abs(sdBox(uv, vec2(0.90,0.90), 0.18)));
  col = mix(col, gold, border*0.85);
  col = mix(col, ink, suitMask(uv/0.46, s)*0.96);                 // big center pip
  float k = suitMask((uv-vec2(-0.66,0.70))/0.17, s);
  k = max(k, suitMask((uv-vec2(0.66,-0.70))/0.17, s));            // corner pips
  col = mix(col, ink, k*0.95);
  return col;
}
vec3 cardBack(vec2 uv){
  vec3 navy=vec3(0.07,0.11,0.27), gold=vec3(0.84,0.68,0.38);
  vec3 col = navy;
  float lattice = 0.5+0.5*sin((uv.x+uv.y)*15.0)*sin((uv.x-uv.y)*15.0);
  col = mix(col, gold*0.45, lattice*0.55);
  col = mix(col, gold, (1.0-smoothstep(0.0,0.05, abs(sdBox(uv, vec2(0.84,0.84),0.14))))*0.8);
  return col;
}

void chipColors(int idx, out vec3 body, out vec3 mark){
  int m = idx - 5*(idx/5);
  if(m==0){ body=vec3(0.72,0.06,0.05); mark=vec3(0.96,0.92,0.82); }
  else if(m==1){ body=vec3(0.05,0.18,0.55); mark=vec3(0.92,0.95,1.0); }
  else if(m==2){ body=vec3(0.05,0.42,0.20); mark=vec3(0.93,0.90,0.74); }
  else if(m==3){ body=vec3(0.06,0.06,0.07); mark=vec3(0.86,0.66,0.30); }
  else { body=vec3(0.42,0.11,0.55); mark=vec3(0.94,0.90,0.97); }
}
vec3 chipFace(vec2 p, int idx){      // p in [-1,1] disk
  vec3 body, mark; chipColors(idx, body, mark);
  float r = length(p), ang = atan(p.y,p.x);
  vec3 col = body;
  col = mix(col, mark, (1.0-smoothstep(0.0,0.035,abs(r-0.82)))*0.95);       // outer ring
  float wedges = step(0.5, fract(ang/(2.0*PI)*8.0)) * smoothstep(0.58,0.61,r) * (1.0-smoothstep(0.79,0.82,r));
  col = mix(col, mark, wedges*0.9);                                          // edge wedges
  col = mix(col, mark, (1.0-smoothstep(0.0,0.03,abs(r-0.44)))*0.5);          // inner ring
  col = mix(col, mix(body,mark,0.35), (1.0-smoothstep(0.22,0.26,r))*0.55);   // center cap
  return col;
}

vec3 shadeLit(vec3 base, vec3 n, vec3 v, float shiny){
  vec3 l1=normalize(vec3(0.42,0.82,0.55)), l2=normalize(vec3(-0.7,0.32,0.5)), l3=normalize(vec3(0.05,-0.2,1.0));
  float d1=max(dot(n,l1),0.0), d2=max(dot(n,l2),0.0), d3=max(dot(n,l3),0.0);
  vec3 h1=normalize(l1+v);
  float sp=pow(max(dot(n,h1),0.0), shiny)*0.7;
  // Normalized dot products can round above 1 on mobile GPUs. A negative
  // fractional-power base produces NaN and can turn the entire surface black.
  float grazing=1.0-clamp(dot(n,v),0.0,1.0);
  float fres=pow(grazing, 4.0);
  float rim =pow(grazing, 2.2)*0.18;
  vec3 amb = base*mix(vec3(0.05,0.06,0.09), vec3(0.16,0.14,0.11), 0.5+0.5*n.y);
  vec3 dif = base*(d1*0.9*vec3(1.25,1.05,0.82) + d2*0.32*vec3(0.5,0.62,0.95) + d3*0.18*vec3(0.4,0.5,0.8));
  vec3 spc = sp*vec3(1.3,1.05,0.72) + fres*vec3(0.10,0.13,0.19);
  return amb + dif + spc + rim*vec3(0.8,0.85,1.0);
}

void cardPose(float id, float t, out vec3 pos, out mat3 R){
  float h0=hash11(id*1.7+0.3), h1=hash11(id*3.1+1.1), h2=hash11(id*5.7+2.2);
  float cols=6.0, col=mod(id,cols), row=floor(id/cols);
  float speed=mix(0.07,0.12,h2);
  float ft=t*speed + row*0.21 + h1, ph=fract(ft), cyc=floor(ft);
  float z=mix(-3.0,0.4, hash11(id*9.1+cyc*13.7));
  float spread=2.1 + (-z)*0.55;
  float x=mix(-spread,spread,(col+0.5)/cols) + (hash11(id*2.3+cyc*7.1)-0.5)*0.45;
  pos=vec3(x, mix(3.4,-3.4,ph), z);
  float ax=(h2-0.5)*0.7 + 0.15*sin(t*0.5+id);
  float ay=(h1<0.5?0.0:PI) + 0.25*sin(t*0.4+id*1.3);
  float az=h0*6.2831 + 0.22*sin(t*0.3+id);
  R = rotY(ay)*rotX(ax)*rotZ(az);
}
void chipPose(float id, float t, out vec3 pos, out mat3 R){
  float h1=hash11(id*4.3+0.7), h2=hash11(id*6.1+2.9);
  float cols=5.0, col=mod(id,cols), row=floor(id/cols);
  float speed=mix(0.09,0.15,h2);
  float ft=t*speed + row*0.17 + h1, ph=fract(ft), cyc=floor(ft);
  float z=mix(0.5,1.7, hash11(id*7.7+cyc*11.3));
  float spread=2.4 + z*0.2;
  float x=mix(-spread,spread,(col+0.5)/cols) + (hash11(id*3.9+cyc*5.3)-0.5)*0.3;
  pos=vec3(x, mix(3.0,-3.0,ph), z);
  R = rotY(t*(1.1+h2)+id*1.7)*rotX(t*(1.4+h1)+id)*rotZ(h1*6.28);
}

vec3 background(vec2 uv){
  float y = clamp(uv.y*0.5+0.55, 0.0, 1.0);
  vec3 bg = mix(vec3(0.10,0.04,0.19), vec3(0.24,0.13,0.34), y);
  bg += vec3(0.10,0.08,0.03)*pow(max(0.0,1.0-length(uv*vec2(0.8,1.0))), 3.0);
  return bg;
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*u_res)/u_res.y;
  vec3 ro = vec3(0.0,0.0,4.6), ta = vec3(0.0);
  vec3 ww=normalize(ta-ro), uu=normalize(cross(ww,vec3(0,1,0))), vv=cross(uu,ww);
  vec3 rd = normalize(uv.x*uu + uv.y*vv + 1.9*ww);

  float bestT = 1e9;
  bool hit = false;
  vec3 hitCol=vec3(0.0), hitN=vec3(0.0,0.0,1.0); float hitShiny=60.0;

  for(int i=0;i<NCARD;i++){
    float id=float(i);
    vec3 pos; mat3 R; cardPose(id,u_time,pos,R);
    mat3 iR=transpose(R);
    vec3 roL=iR*(ro-pos), rdL=iR*rd;
    if(abs(rdL.z)<1e-4) continue;
    float t=-roL.z/rdL.z; if(t<=0.0 || t>=bestT) continue;
    vec2 p=(roL+rdL*t).xy;
    if(sdBox(p, vec2(0.5,0.72), 0.08) > 0.0) continue;
    bestT=t; hit=true;
    bool front = rdL.z<0.0;
    hitN = normalize(R*vec3(0.0,0.0, front?1.0:-1.0));
    vec2 fuv = p/vec2(0.5,0.72);
    int s = int(mod(id,4.0));
    hitCol = front ? cardFront(fuv, s) : cardBack(fuv);
    hitShiny = 60.0;
  }
  for(int i=0;i<NCHIP;i++){
    float id=float(i);
    vec3 pos; mat3 R; chipPose(id,u_time,pos,R);
    mat3 iR=transpose(R);
    vec3 roL=iR*(ro-pos), rdL=iR*rd;
    if(abs(rdL.z)<1e-4) continue;
    float t=-roL.z/rdL.z; if(t<=0.0 || t>=bestT) continue;
    vec2 p=(roL+rdL*t).xy;
    if(length(p) > 0.27) continue;
    bestT=t; hit=true;
    hitN = normalize(R*vec3(0.0,0.0, rdL.z<0.0?1.0:-1.0));
    hitCol = chipFace(p/0.27, int(id));
    hitShiny = 120.0;
  }

  vec3 col = background(uv);
  if(hit){
    vec3 p = ro + rd*bestT;
    vec3 view = normalize(ro-p);
    vec3 lit = shadeLit(hitCol, hitN, view, hitShiny);
    float fog = exp(-0.02*bestT*bestT);
    col = mix(background(uv), lit, clamp(fog,0.0,1.0));
  }

  vec2 q = gl_FragCoord.xy/u_res;
  float vig = pow(16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y), 0.20);
  col *= mix(0.55, 1.05, clamp(vig,0.0,1.0));
  col = (col*(2.51*col+0.03))/(col*(2.43*col+0.59)+0.14);  // filmic tone-map
  col = pow(clamp(col,0.0,1.0), vec3(1.0/2.2));
  float alpha = hit ? 1.0 : 0.0; outColor = vec4(col*alpha, alpha);
}`;
