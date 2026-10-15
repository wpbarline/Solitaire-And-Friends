import React,{useEffect,useState} from 'react';
import './render-diagnostics.css';

// Opt-in, removable presentation probe. Never reads or changes saves or settings.
export default function RenderDiagnostics(){
 const root=new URL(import.meta.env.BASE_URL,location.origin);
 const face=new URL('assets/cards/royal/heart_1.png',root).href;
 const back=new URL('assets/cards/royal/back.jpg',root).href;
 const [options,setOptions]=useState({clip:false,transform:false,transition:false,effects:false});
 const [metadata,setMetadata]=useState({model:'',os:'',browser:'',mode:matchMedia('(display-mode: standalone)').matches?'installed':'browser',observations:''});
 const [report,setReport]=useState(null),[errors,setErrors]=useState([]),[busy,setBusy]=useState(false);
 useEffect(()=>{const error=e=>setErrors(list=>[...list.slice(-19),String(e.message||e.reason)]);addEventListener('error',error);addEventListener('unhandledrejection',error);return()=>{removeEventListener('error',error);removeEventListener('unhandledrejection',error);};},[]);
 async function inspect(){
  setBusy(true);
  try{
   const images=await Promise.all([face,back].map(async url=>{
    let status=null,requestError=null;try{status=(await fetch(url,{cache:'no-cache'})).status;}catch(e){requestError=String(e);}
    const image=new Image();image.src=url;let decodeError=null;try{await image.decode();}catch(e){decodeError=String(e);}
    return {url,status,requestError,decodedSize:[image.naturalWidth,image.naturalHeight],decodeError};
   }));
   let release;try{release=await (await fetch(new URL('release.json',root))).json();}catch{release={error:'Release metadata unavailable offline'};}
   const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl2')||canvas.getContext('webgl');
   const context=gl?{version:gl.getParameter(gl.VERSION),shadingLanguage:gl.getParameter(gl.SHADING_LANGUAGE_VERSION),maxTextureSize:gl.getParameter(gl.MAX_TEXTURE_SIZE),contextLost:gl.isContextLost(),error:gl.getError()}:{unavailable:true};
   gl?.getExtension('WEBGL_lose_context')?.loseContext();
   const wrappers=[...document.querySelectorAll('.render-probe img')].map(el=>{const s=getComputedStyle(el);return {src:el.currentSrc,size:[el.naturalWidth,el.naturalHeight],transform:s.transform,clip:s.clipPath,filter:s.filter,background:s.backgroundColor};});
   setReport({at:new Date().toISOString(),metadata,runningRelease:document.querySelector('meta[name="app-release"]')?.content||'development/unknown',fetchedRelease:release,userAgent:navigator.userAgent,viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,colorScheme:getComputedStyle(document.documentElement).colorScheme,options,images,wrappers,context,errors});
  }finally{setBusy(false);}
 }
 function download(){const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='card-render-diagnostic.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 return <div className="render-diagnostics">
  <p>Compare these original images with the live table and ghost cards. Decoding success cannot prove that pixels display correctly. This test does not change your game.</p>
  <div className="render-probes">
   <figure className="render-probe"><img src={face} alt="Raw ace of hearts"/><figcaption>Raw transparent face</figcaption></figure>
   <figure className="render-probe"><img src={back} alt="Raw blue back"/><figcaption>Raw back</figcaption></figure>
   <figure className="render-probe"><img style={{background:'#fffaf0'}} src={face} alt="Static opaque ace"/><figcaption>Opaque paper</figcaption></figure>
   <figure className="render-probe"><img className="probe-variable" style={{background:'#fffaf0',clipPath:options.clip?'inset(0 round 10px)':'none',transform:options.transform?'translate(4px, 0) rotate(2deg)':'none',transition:options.transition?'transform 500ms ease':'none',filter:options.effects?'drop-shadow(0 3px 4px #0008)':'none'}} src={face} alt="Variable ace"/><figcaption>Change one switch at a time</figcaption></figure>
   <figure className="render-probe"><svg viewBox="0 0 78 108" role="img" aria-label="Ghost SVG ace"><rect width="78" height="108" fill="#fffaf0"/><image href={face} width="78" height="108" preserveAspectRatio="none"/></svg><figcaption>Ghost SVG paper</figcaption></figure>
  </div>
  {Object.keys(options).map(key=><label className="setting-row" key={key}>{key}<input type="checkbox" checked={options[key]} onChange={e=>setOptions({...options,[key]:e.target.checked})}/></label>)}
  <p>Check the title separately: logo fan, falling cards/chips (2D canvas), and purple background (WebGL). Record which layer fails and take screenshots using your phone.</p>
  {Object.keys(metadata).map(key=><label className="probe-field" key={key}>{key}<input aria-label={'Diagnostic '+key} value={metadata[key]} onChange={e=>setMetadata({...metadata,[key]:e.target.value})}/></label>)}
  <button disabled={busy} onClick={inspect}>{busy?'Collecting…':'Collect rendering report'}</button>
  {report&&<><button onClick={download}>Save report</button><pre>{JSON.stringify(report,null,2)}</pre></>}
 </div>;
}
