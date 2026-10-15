const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.GAME_URL||'http://127.0.0.1:8773/Solitaire-And-Friends/';
(async()=>{const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'msedge',headless:true});try{
 const page=await browser.newPage({serviceWorkers:'block'});
 await page.addInitScript(()=>localStorage.setItem('solitaire-friends-player-name','Arline'));
 await page.goto(base);await page.locator('#startGame:enabled').click();await page.waitForFunction(()=>window.__sol?.ready);
 await page.evaluate(()=>{window.menuCues=[];addEventListener('game-audio-cue',e=>{if(['open','close'].includes(e.detail.event))window.menuCues.push(e.detail);});});
 for(let i=0;i<4;i++){
  await page.getByRole('button',{name:'Settings',exact:true}).click();await page.waitForFunction(n=>menuCues.length>=n,i*2+1);
  await page.getByRole('button',{name:'Close',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});await page.waitForFunction(n=>menuCues.length>=n,i*2+2);
 }
 const cues=await page.evaluate(()=>menuCues);assert.equal(cues.length,8);assert.ok(new Set(cues.map(c=>c.name)).size>=2);
 for(let i=0;i<cues.length;i++){assert.notEqual(cues[i].name,'harp-transition.ogg');if(i)assert.notEqual(cues[i].name,cues[i-1].name);}
 await page.evaluate(async base=>{const {setPreference}=await import(base+'assets/js/preferences.js');setPreference('effects',false);},base);
 await page.getByRole('button',{name:'Settings',exact:true}).click();await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>menuCues.length),8);
 console.log('PASS eight actual menu cues, no immediate repeats or menu harp, effects-off silence');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
