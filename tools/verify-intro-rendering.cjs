const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'msedge',headless:true});try{
 for(const viewport of [{width:390,height:844},{width:1366,height:768}]){
  const page=await browser.newPage({viewport,serviceWorkers:'block'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.GAME_URL||'http://127.0.0.1:8773/Solitaire-And-Friends/');
  await page.waitForFunction(()=>document.querySelector('.intro-shader')?.dataset.active==='true');
  assert.equal(await page.locator('.title-card-fan').evaluate(e=>getComputedStyle(e).opacity),'1');
  const paper=await page.locator('.title-card-fan img').evaluateAll(cards=>cards.map(card=>{
   const animation=card.getAnimations()[0];const samples=[];
   for(const at of [0,450,900]){if(animation){animation.pause();animation.currentTime=at;}const style=getComputedStyle(card);samples.push({opacity:style.opacity,paper:style.backgroundColor});}return samples;
  }));
  assert.equal(paper.length,4);for(const card of paper)for(const sample of card){assert.equal(sample.opacity,'1','individual fan card stays opaque during entrance');assert.equal(sample.paper,'rgb(255, 250, 240)');}
  assert.equal(await page.locator('.title-scene .scene-particles').count(),0,'No synchronized row of small falling cards over the original shader');
  const samples=await page.evaluate(async(source)=>{
   const {startIntroShader}=await import('data:text/javascript;base64,'+btoa(source));
   const canvas=document.createElement('canvas');canvas.style.cssText='position:fixed;inset:0;width:100%;height:100%;pointer-events:none';document.body.append(canvas);
   const original=requestAnimationFrame;let next;window.requestAnimationFrame=fn=>{next=fn;return 0;};
   let stop;try{stop=startIntroShader(canvas);const gl=canvas.getContext('webgl2'),results=[];
    for(const time of [100,1100,2300,4100]){next(time);const pixels=new Uint8Array(canvas.width*canvas.height*4);gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);let opaque=0,partial=0;for(let i=3;i<pixels.length;i+=4){if(pixels[i]===255)opaque++;else if(pixels[i]!==0)partial++;}results.push({opaque,partial,error:gl.getError()});}return results;
   }finally{stop?.();window.requestAnimationFrame=original;canvas.remove();}
  },require('node:fs').readFileSync(require('node:path').join(__dirname,'../src/intro-shader.js'),'utf8'));
  for(const sample of samples){assert.ok(sample.opaque>1000);assert.equal(sample.partial,0);assert.equal(sample.error,0);}
  assert.deepEqual(errors,[]);console.log('PASS opaque intro surfaces, WebGL frames, title fan',viewport);await page.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
