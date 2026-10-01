const {chromium}=require('C:/Users/Arline/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8770/games/solitaire/');await page.waitForFunction(()=>window.__sol?.state);
  await page.waitForFunction(()=>!document.getElementById('solLoad')||document.getElementById('solLoad').classList.contains('gone'));
  const tapCard=async id=>{const b=await page.locator(`.card[data-id="${id}"]`).boundingBox();await page.touchscreen.tap(b.x+b.width/2,b.y+12);};
  const top=await page.evaluate(()=>window.__sol.state.stock.at(-1).id);
  await tapCard(top);assert.equal(await page.evaluate(()=>window.__sol.moves),1);
  let move;
  for(let i=0;i<30;i++){
   move=await page.evaluate(async()=>{
    const {hints}=await import('./rules.js');const s=window.__sol.state;
    const pile=p=>p.map(c=>({...c,suit:Math.floor(c.id/13),rank:c.id%13+1,color:[1,2].includes(Math.floor(c.id/13))?'red':'black'}));
    return hints({stock:pile(s.stock),waste:pile(s.waste),tableau:s.tableau.map(pile),foundations:s.foundations.map(pile)}).find(h=>h.kind==='tableau'||h.kind==='foundation');
   });
   if(move)break;
   const id=await page.evaluate(()=>window.__sol.state.stock.at(-1)?.id);if(id===undefined)break;await tapCard(id);
  }
  assert.ok(move,'Find a real legal move for drag testing');
  const before=await page.evaluate(()=>window.__sol.moves);
  const source=await page.locator(`.card[data-id="${move.card}"]`).boundingBox();
  const target=await page.locator(move.to[0]==='f'?'.slot.foundation':'.slot.tableau').nth(Number(move.to[1])).boundingBox();
  await page.mouse.move(source.x+source.width/2,source.y+10);await page.mouse.down();
  await page.mouse.move(target.x+target.width/2,target.y+target.height/2,{steps:12});await page.mouse.up();
  assert.equal(await page.evaluate(()=>window.__sol.moves),before+1,'Drag commits one legal move');
  const state=await page.evaluate(()=>window.__sol.state),all=[...state.stock,...state.waste,...state.tableau.flat(),...state.foundations.flat()];
  assert.equal(new Set(all.map(c=>c.id)).size,52);
  // Wait for full precaching, then simulate an offline installed-phone reload.
  await page.waitForFunction(async()=>{
   if(!navigator.serviceWorker.controller)return false;
   const c=await caches.open('solitaire-friends-v2');return (await c.keys()).length>=100;
  },null,{timeout:60000});
  await context.setOffline(true);await page.reload();await page.waitForFunction(()=>window.__sol?.state);
  assert.deepEqual(await page.evaluate(()=>window.__sol.state),state);
  assert.equal(await page.locator('.card img').evaluateAll(images=>images.every(i=>i.complete&&i.naturalWidth>0)),true);
  const sounds=await page.evaluate(async()=>{
   const c=new AudioContext();const result=[];
   for(const name of ['shuffle.wav','deal-1.wav','reward.ogg','tada.ogg']){const r=await fetch('../../assets/audio/'+name);const b=await c.decodeAudioData(await r.arrayBuffer());result.push(b.duration>0);}
   await c.close();return result;
  });assert.ok(sounds.every(Boolean));
  await page.goto('http://127.0.0.1:8770/');assert.equal(await page.locator('.primary-play').textContent(),'Play Solitaire');
  await page.screenshot({path:'C:/github-projects/Solitaire-And-Friends/tools/home-phone.png',fullPage:true});
  assert.deepEqual(errors,[]);console.log('PASS: phone tap, legal drag, card conservation, full offline reload/art/audio, home.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
