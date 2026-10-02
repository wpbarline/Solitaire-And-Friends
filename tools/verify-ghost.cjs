const {chromium}=require('C:/Users/Arline/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 for(const viewport of [{width:390,height:844},{width:844,height:390}]){
  const page=await browser.newPage({viewport,serviceWorkers:'block'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('solitaire-friends-player-name','Arline'));
  await page.goto(process.env.GAME_URL||'http://127.0.0.1:8773/Solitaire-And-Friends/');
  await page.locator('#startGame:enabled').click();await page.waitForFunction(()=>window.__sol?.ready);
  await page.waitForTimeout(2200);
  const initial=await page.evaluate(()=>window.__sol.state);
  await page.locator('.slot.stock').press('Enter');await page.waitForTimeout(700);
  const afterDraw=await page.evaluate(()=>window.__sol.state);
  await page.evaluate(()=>window.__sol.rewind());await page.waitForTimeout(400);
  await page.getByRole('button',{name:'Home',exact:true}).click();
  const run=await page.evaluate(()=>JSON.parse(localStorage.getItem('solitaire-friends-replays-v1'))[0]);
  assert.deepEqual(run.initial,initial);assert.equal(run.events.length,2);
  assert.deepEqual(run.events[0].state,afterDraw);assert.deepEqual(run.events[1].state,initial);
  assert.equal(run.events[0].action,'draw');assert.equal(run.events[1].action,'undo');
  assert.ok(run.events[1].at-run.events[0].at>=600);
  await page.getByRole('button',{name:'Game Select',exact:true}).click();
  await page.getByRole('button',{name:'Ghost race',exact:true}).click();
  await page.getByRole('button',{name:/Practice run/}).first().click();
  await page.waitForFunction(()=>window.__sol?.ready);await page.waitForTimeout(2200);
  assert.deepEqual(await page.evaluate(()=>window.__sol.state),initial);
  assert.equal(await page.locator('.play-dock').evaluate(e=>e.inert),true);
  assert.equal(await page.locator('.ghost-panel').isVisible(),true);
  await page.waitForFunction(()=>document.getElementById('timer').textContent!=='0:00');
  const replayChecks=await page.evaluate(async(run)=>{
   const m=await import(new URL('games/solitaire/replays.js',location.href));
   return {before:m.replayStateAt(run,run.events[0].at-1),draw:m.replayStateAt(run,run.events[0].at),undo:m.replayStateAt(run,run.events[1].at),valid:m.validReplay(run),malformed:m.validReplay({...run,events:[{at:-1,state:run.initial}]})};
  },run);
  assert.deepEqual(replayChecks.before,initial);assert.deepEqual(replayChecks.draw,afterDraw);assert.deepEqual(replayChecks.undo,initial);assert.equal(replayChecks.valid,true);assert.equal(replayChecks.malformed,false);
  assert.ok(await page.locator('.ghost-panel').evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight+1));
  await page.screenshot({path:`C:/Temp/ghost-race-${viewport.width}.png`});
  await page.getByRole('button',{name:'Controls',exact:true}).click();assert.equal(await page.locator('.play-dock').evaluate(e=>e.inert),false);
  await page.locator('.slot.stock').press('Enter');
  const raceState=await page.evaluate(()=>window.__sol.state);
  await page.evaluate(()=>{window.__sol.save();sessionStorage.setItem('solitaire-friends-auto-update','yes');window.__gameApplyingUpdate=true;});
  await page.reload();await page.waitForFunction(()=>window.__sol?.ready);
  assert.deepEqual(await page.evaluate(()=>window.__sol.state),raceState);
  assert.equal(await page.locator('.ghost-panel').count(),1);
  await page.getByRole('button',{name:'End race',exact:true}).click();await page.waitForFunction(()=>window.__sol?.ready);
  assert.deepEqual(await page.evaluate(()=>window.__sol.state),raceState);
  assert.equal(await page.locator('.ghost-panel').count(),0);assert.deepEqual(errors,[]);
  console.log('PASS exact deal, timed draw/undo, replay boundaries, hidden controls and race exit',viewport);await page.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
