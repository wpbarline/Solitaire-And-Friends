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
  await p.getByRole('button',{name:'Audio',exact:true}).click();
  const music=p.getByRole('switch',{name:'Music',exact:true});await music.click();assert.equal(await music.getAttribute('aria-checked'),'false');
  await p.getByRole('slider',{name:'Sound effects volume',exact:true}).fill('0.35');
  await p.getByRole('button',{name:'Close',exact:true}).click();await p.getByRole('dialog').waitFor({state:'hidden'});
  await p.getByRole('button',{name:'Audio',exact:true}).click();assert.equal(await music.getAttribute('aria-checked'),'false');assert.equal(await p.getByRole('slider',{name:'Sound effects volume',exact:true}).inputValue(),'0.35');
  await p.waitForTimeout(350);await p.screenshot({path:'C:/Temp/audio-panel-'+viewport.width+'.png'});
  await p.getByRole('button',{name:'Close',exact:true}).click();await p.getByRole('dialog').waitFor({state:'hidden'});
  p.once('dialog',d=>d.accept());await p.reload();await p.waitForFunction(()=>window.__sol?.ready);
  assert.equal(await p.locator('.player-greeting').textContent(),'Welcome back, Arline!');assert.ok(!(await p.locator('#hintText').textContent()).includes('Your game is saved'));
  await p.locator('.player-greeting').waitFor({state:'hidden'});assert.deepEqual(errors,[]);
  console.log('PASS first/returning greeting, disappearance, audio toggles and saved volumes',viewport);await p.close();
 }
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
