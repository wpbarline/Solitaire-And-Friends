const {chromium}=require('playwright'),assert=require('node:assert/strict');
const base=process.env.GAME_URL||'http://127.0.0.1:8773/Solitaire-And-Friends/';
(async()=>{const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'msedge',headless:true});try{
 for(const viewport of [{width:390,height:844},{width:844,height:390},{width:1366,height:768}]){
  const page=await browser.newPage({viewport,serviceWorkers:'block'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('solitaire-friends-player-name','Arline'));
  await page.goto(base);await page.locator('#startGame:enabled').click();await page.waitForFunction(()=>window.__sol?.ready);
  await page.locator('.board:not(.dealing)').waitFor();
  const before=await page.evaluate(()=>window.__sol.state);await page.locator('.card[data-top-stock="true"]').click();
  assert.equal(await page.evaluate(()=>window.__sol.moves),1,'mouse click is a stock tap');
  await page.evaluate(()=>window.__sol.rewind());assert.deepEqual(await page.evaluate(()=>window.__sol.state),before);
  // Use authoritative visible hints, then perform an actual pointer drag.
  let hint;for(let i=0;i<25;i++){
   hint=await page.evaluate(async base=>{const {hints}=await import(base+'games/solitaire/rules.js');const s=window.__sol.state;const pile=p=>p.map(c=>({...c,suit:Math.floor(c.id/13),rank:c.id%13+1,color:[1,2].includes(Math.floor(c.id/13))?'red':'black'}));return hints({stock:pile(s.stock),waste:pile(s.waste),tableau:s.tableau.map(pile),foundations:s.foundations.map(pile)}).find(h=>h.kind==='foundation'||h.kind==='tableau');},base);
   if(hint)break;await page.locator('.slot.stock').press('Enter');
  }assert.ok(hint);await page.waitForTimeout(300);
  const source=await page.locator(`.card[data-id="${hint.card}"]`).boundingBox(),target=await page.locator(hint.to[0]==='f'?'.slot.foundation':'.slot.tableau').nth(+hint.to[1]).boundingBox();
  const moves=await page.evaluate(()=>window.__sol.moves);
  await page.mouse.move(source.x+source.width/2,source.y+8);await page.mouse.down();await page.mouse.move(target.x+target.width/2,target.y+target.height/2,{steps:10});await page.mouse.up();
  assert.equal(await page.evaluate(()=>window.__sol.moves),moves+1);
  await page.getByRole('button',{name:'Game Select',exact:true}).click();await page.getByRole('button',{name:'UNO · Four players',exact:true}).click();await page.waitForSelector('#uno .opp');
  const hand=page.locator('#hand');assert.equal(await hand.evaluate(e=>getComputedStyle(e).scrollbarWidth),'none');
  assert.ok(await hand.evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight),'UNO hand fits the visible table');
  assert.ok(await page.locator('#uno .controls').evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight),'UNO turn controls fit');
  const overflowing=await hand.evaluate(e=>e.scrollWidth>e.clientWidth);
  if(overflowing){
   const card=await hand.locator('.card-btn').first().boundingBox();
   await page.mouse.move(card.x+card.width/2,card.y+card.height/2);await page.mouse.down();await page.mouse.move(card.x-130,card.y+card.height/2,{steps:12});await page.mouse.up();
   assert.ok(await hand.evaluate(e=>e.scrollLeft)>50,'grab hand scrolls horizontally');
   assert.equal(await page.locator('#uno .card-btn').count(),7,'scroll drag never plays a card');
   assert.equal(await page.locator('#uno .overlay').count(),0,'scroll drag never opens a wild decision');
  }
  const legal=page.locator('#uno .card-btn.legal').first();
  if(await legal.count()){
   await legal.click();const color=page.locator('#uno .pick').first();if(await color.count())await color.click();
   assert.equal(await page.locator('#uno .card-btn').count(),6,'mouse tap plays exactly one UNO card');
  }else{
   await page.locator('#drawBtn').click();assert.equal(await page.locator('#uno .card-btn').count(),8,'mouse tap draws exactly one UNO card');
  }
  await page.getByRole('button',{name:'Settings',exact:true}).click();await page.getByRole('button',{name:'Cards & table',exact:true}).click();
  const sheet=page.locator('.scene-sheet');assert.equal(await sheet.evaluate(e=>getComputedStyle(e).scrollbarWidth),'none');
  if(await sheet.evaluate(e=>e.scrollHeight>e.clientHeight+30)){
   const box=await sheet.boundingBox();const x=box.x+12,y=box.y+box.height-35;
   await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x,y-130,{steps:10});await page.mouse.up();assert.ok(await sheet.evaluate(e=>e.scrollTop)>30,'grab sheet scrolls vertically');
  }
  await page.getByLabel('Reduced motion',{exact:true}).check();assert.equal(await page.getByLabel('Reduced motion',{exact:true}).isChecked(),true);
  assert.deepEqual(errors,[]);console.log('PASS pointer tap, legal card drag, hidden bars, grab overflow, native setting controls',viewport);await page.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
