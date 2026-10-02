const {chromium}=require('C:/Users/Arline/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 for(const viewport of [{width:390,height:844},{width:844,height:390}]){
  const p=await b.newPage({viewport,serviceWorkers:'block'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  const base=process.env.GAME_URL||'http://127.0.0.1:8773/Solitaire-And-Friends/';
  await p.goto(base);await p.locator('#startGame:enabled').click();
  await p.getByRole('dialog',{name:'What should we call you?'}).waitFor();
  await p.getByLabel('Your name',{exact:true}).fill('  Arline  ');await p.getByRole('button',{name:'Let’s play!'}).click();
  await p.waitForFunction(()=>window.__sol?.ready);assert.equal(await p.locator('.player-greeting').textContent(),'Welcome, Arline!');
  await p.locator('.player-greeting').waitFor({state:'hidden'});assert.equal(await p.evaluate(()=>localStorage.getItem('solitaire-friends-player-name')),'Arline');
  await p.locator('.slot.stock').press('Enter');const moves=await p.evaluate(()=>window.__sol.moves);
  await p.getByRole('button',{name:'Home',exact:true}).click();await p.locator('#startGame').waitFor();assert.equal(await p.getByRole('dialog').count(),0);
  await p.getByRole('button',{name:'Edit name',exact:true}).click();await p.getByLabel('Your name',{exact:true}).fill('Aunt Arline');await p.getByRole('button',{name:'Save',exact:true}).click();await p.getByRole('dialog').waitFor({state:'hidden'});assert.equal(await p.locator('.home-player span').textContent(),'Aunt Arline');
  await p.getByRole('button',{name:'Game Select',exact:true}).click();await p.getByRole('button',{name:'Solitaire',exact:true}).click();await p.waitForFunction(()=>window.__sol?.ready);assert.equal(await p.evaluate(()=>window.__sol.moves),moves);
  await p.evaluate(()=>{window.popupCues=[];addEventListener('game-audio-cue',e=>{if(['open','close'].includes(e.detail.event))window.popupCues.push(e.detail);});});
  await p.getByRole('button',{name:'Audio',exact:true}).click();
  await p.waitForFunction(()=>window.popupCues.some(e=>e.event==='open'&&e.name==='harp-transition.ogg'));
  const music=p.getByRole('switch',{name:'Music',exact:true});await music.click();assert.equal(await music.getAttribute('aria-checked'),'false');
  await p.getByRole('slider',{name:'Sound effects volume',exact:true}).fill('0.35');
  await p.getByRole('button',{name:'Close',exact:true}).click();await p.getByRole('dialog').waitFor({state:'hidden'});
  await p.waitForFunction(()=>window.popupCues.some(e=>e.event==='close'&&e.name==='harp-transition.ogg'));
  await p.getByRole('button',{name:'Audio',exact:true}).click();assert.equal(await music.getAttribute('aria-checked'),'false');assert.equal(await p.getByRole('slider',{name:'Sound effects volume',exact:true}).inputValue(),'0.35');
  await p.waitForTimeout(350);await p.screenshot({path:'C:/Temp/audio-panel-'+viewport.width+'.png'});
  await p.getByRole('button',{name:'Close',exact:true}).click();await p.getByRole('dialog').waitFor({state:'hidden'});
  p.once('dialog',d=>d.accept());await p.reload();await p.waitForFunction(()=>window.__sol?.ready);
  assert.equal(await p.locator('.player-greeting').textContent(),'Welcome back, Aunt Arline!');assert.ok(!(await p.locator('#hintText').textContent()).includes('Your game is saved'));
  await p.locator('.player-greeting').waitFor({state:'hidden'});assert.deepEqual(errors,[]);
  console.log('PASS first/returning greeting, disappearance, audio toggles and saved volumes',viewport);await p.close();
 }
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
