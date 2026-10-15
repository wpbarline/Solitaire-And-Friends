const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.GAME_URL||'http://127.0.0.1:8773/Solitaire-And-Friends/';
const out=path.resolve('evidence/effects');fs.mkdirSync(out,{recursive:true});
const card=(id,up=false)=>({id,up});
function checkpoint(state){return {version:1,seed:314159,drawCount:1,elapsed:0,initial:state,state,history:[],shufflesLeft:1,rewindsLeft:3,surprisesLeft:1};}
(async()=>{
 const {shuffled,seededRandom}=await import('../assets/js/game-primitives.js');
 const deck=shuffled(Array.from({length:52},(_,id)=>card(id)),seededRandom(314159));let cursor=0;
 const tableau=Array.from({length:7},(_,col)=>Array.from({length:col+1},(_,row)=>({...deck[cursor++],up:row===col})));
 const fixture=checkpoint({stock:deck.slice(cursor),waste:[],foundations:[[],[],[],[]],tableau,moves:0});
 // Preserve immutable fixtures on disk before any isolated browser mutations.
 fs.writeFileSync(path.join(out,'checkpoint-fixture.json'),JSON.stringify(fixture,null,2));
 const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'msedge',headless:true});
 try{
  const results=[];
  for(const reduced of [false,true]){
   const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(({fixture,reduced})=>{
    localStorage.setItem('solitaire-friends-player-name','Arline');localStorage.setItem('solitaire-friends-game-v1',JSON.stringify(fixture));
    localStorage.setItem('solitaire-friends-settings-v1',JSON.stringify({reducedMotion:reduced,haptics:true,music:false,effects:false}));
    window.pulses=[];Object.defineProperty(navigator,'vibrate',{value:pattern=>{pulses.push({pattern,at:performance.now()});return true;},configurable:true});
    window.events=[];addEventListener('game-presentation',e=>events.push(e.detail.type));
   },{fixture,reduced});
   await page.goto(base);await page.locator('#startGame:enabled').click();await page.waitForFunction(()=>window.__sol?.ready);await page.waitForTimeout(50);
   // Input during entrance cancels it without changing the logical result.
   await page.locator('.slot.stock').press('Enter');await page.locator('.slot.stock').press('Enter');await page.locator('.slot.stock').press('Enter');
   await page.evaluate(()=>window.__sol.timeReverse());assert.deepEqual(await page.evaluate(()=>window.__sol.state),fixture.state);
   assert.equal(await page.evaluate(()=>window.__sol.hud.reversing),false,'reverse never awaits presentation');
   const reversed=await page.evaluate(()=>window.__sol.state);
   // Consume a different number of cosmetic random values: shuffle must agree.
   await page.evaluate(count=>{for(let i=0;i<count;i++)Math.random();window.__sol.shuffle();},reduced?100:3);
   const mixed=await page.evaluate(()=>window.__sol.state);await page.evaluate(()=>window.__sol.rewind());assert.deepEqual(await page.evaluate(()=>window.__sol.state),reversed);
   const journal=await page.evaluate(()=>JSON.parse(localStorage.getItem('solitaire-friends-replays-v1'))[0].events.map(({action,state})=>({action,state})));
   await page.evaluate(()=>window.__sol.restart());assert.deepEqual(await page.evaluate(()=>window.__sol.state),fixture.state);
   assert.equal(await page.evaluate(()=>window.__sol.presentationPending),0);
   const off=await page.evaluate(async base=>{const {setPreference}=await import(base+'assets/js/preferences.js');setPreference('haptics',false);const count=pulses.length;window.__sol.surprise();return {count,after:pulses.length};},base);assert.equal(off.after,off.count);
   const state=await page.evaluate(()=>window.__sol.state);
   await page.evaluate(()=>window.retired=window.__sol);await page.getByRole('button',{name:'Home',exact:true}).click();assert.equal(await page.evaluate(()=>!!window.__sol),false);
   const saved=await page.evaluate(()=>localStorage.getItem('solitaire-friends-game-v1'));await page.evaluate(()=>{retired.newGame();retired.timeReverse();retired.save();});await page.waitForTimeout(1200);
   assert.equal(await page.evaluate(()=>localStorage.getItem('solitaire-friends-game-v1')),saved,'retired controller cannot save/change next session');
   results.push({mixed,state,journal});assert.deepEqual(errors,[]);
   console.log('PASS reduced='+reduced+': input/undo/reverse/shuffle/restart, cosmetic RNG isolation, haptics-off, retired controller');await context.close();
  }
  assert.deepEqual(results[0],results[1],'motion preference never changes gameplay');
  const arrival=checkpoint({stock:Array.from({length:52},(_,id)=>card(id)).filter(c=>c.id!==13),waste:[],foundations:[[],[],[],[]],tableau:[[card(13,true)],[],[],[],[],[],[]],moves:0});
  const arrivalPage=await browser.newPage({viewport:{width:390,height:844},serviceWorkers:'block'});
  await arrivalPage.addInitScript(fixture=>{localStorage.setItem('solitaire-friends-player-name','Arline');localStorage.setItem('solitaire-friends-game-v1',JSON.stringify(fixture));localStorage.setItem('solitaire-friends-settings-v1',JSON.stringify({music:false,effects:false,haptics:true}));window.pulses=[];Object.defineProperty(navigator,'vibrate',{value:p=>{pulses.push(p);return true;}});},arrival);
  await arrivalPage.goto(base);await arrivalPage.locator('#startGame:enabled').click();await arrivalPage.waitForFunction(()=>window.__sol?.ready);await arrivalPage.waitForTimeout(1300);
  await arrivalPage.screenshot({path:path.join(out,'foundation-before-390.png')});await arrivalPage.locator('.card[data-id="13"]').press('Enter');await arrivalPage.waitForTimeout(130);await arrivalPage.screenshot({path:path.join(out,'foundation-arrival-390.png')});
  assert.equal(await arrivalPage.evaluate(()=>window.__sol.hud.home),1);
  await arrivalPage.evaluate(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'));});
  assert.equal(await arrivalPage.evaluate(()=>window.__sol.presentationPending),0,'hidden cancels active animations/timers');
  assert.equal(await arrivalPage.evaluate(()=>pulses.at(-1)),0,'hidden clears native vibration');await arrivalPage.close();
  // Known legal near-win board exercises a real foundation action, win and undo.
  const foundations=Array.from({length:4},(_,s)=>Array.from({length:s===3?12:13},(_,i)=>card(s*13+i,true)));
  const nearWin=checkpoint({stock:[],waste:[],foundations,tableau:[[card(51,true)],[],[],[],[],[],[]],moves:0});
  fs.writeFileSync(path.join(out,'near-win-fixture.json'),JSON.stringify(nearWin,null,2));
  const page=await browser.newPage({viewport:{width:390,height:844},serviceWorkers:'block'});
  await page.addInitScript(fixture=>{localStorage.setItem('solitaire-friends-player-name','Arline');localStorage.setItem('solitaire-friends-game-v1',JSON.stringify(fixture));localStorage.setItem('solitaire-friends-settings-v1',JSON.stringify({music:false,effects:false,haptics:true}));window.pulses=[];Object.defineProperty(navigator,'vibrate',{value:p=>{pulses.push(p);return true;}});},nearWin);
  await page.goto(base);await page.locator('#startGame:enabled').click();await page.waitForFunction(()=>window.__sol?.ready);await page.waitForTimeout(1300);
  await page.locator('.card[data-id="51"]').press('Enter');assert.equal(await page.evaluate(()=>window.__sol.hud.won),true);assert.equal(await page.locator('.card').count(),52);
  assert.ok(await page.evaluate(()=>pulses.some(p=>Array.isArray(p)&&p.length===5)),'win requests the distinct bounded pattern');
  await page.waitForTimeout(250);await page.screenshot({path:path.join(out,'win-390.png')});
  const frames=await page.evaluate(()=>new Promise(resolve=>{const deltas=[];let last=performance.now();function sample(now){deltas.push(now-last);last=now;if(deltas.length===90)resolve(deltas);else requestAnimationFrame(sample);}requestAnimationFrame(sample);}));
  const sorted=frames.slice(1).sort((a,b)=>a-b),measurement={device:'Desktop Edge headless; not Android hardware',frames:sorted.length,medianMs:sorted[Math.floor(sorted.length/2)],p95Ms:sorted[Math.floor(sorted.length*.95)],maxMs:Math.max(...sorted)};
  fs.writeFileSync(path.join(out,'desktop-frame-sample.json'),JSON.stringify(measurement,null,2));console.log('MEASURED',measurement);
  await page.evaluate(()=>window.__sol.rewind());assert.deepEqual(await page.evaluate(()=>window.__sol.state),nearWin.state);await page.waitForTimeout(600);assert.equal(await page.evaluate(()=>window.__sol.presentationPending),0);
  console.log('PASS real final foundation/win/undo, 52 cards, bounded vibration request and effects return to rest');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
