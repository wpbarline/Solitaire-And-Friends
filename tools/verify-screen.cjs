const {chromium}=require('C:/Users/Arline/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
for(const [width,height] of [[360,640],[390,844],[844,390],[1366,768]]){
const c=await b.newContext({viewport:{width,height},serviceWorkers:'block'});const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://127.0.0.1:8770/games/solitaire/');await p.waitForFunction(()=>window.__sol?.state);await p.waitForTimeout(500);
assert.equal(await p.locator('[data-settings]').count(),1);assert.equal(await p.locator('.topbar').count(),0);
assert.ok(await p.evaluate(()=>document.documentElement.scrollHeight<=innerHeight && document.body.scrollHeight<=innerHeight));
await p.locator('#hintBtn').click();await p.locator('#playHint').click();assert.equal(await p.evaluate(()=>window.__sol.moves),1);await p.locator('#rewindBtn').click();
const fit=await p.evaluate(()=>{const r=document.getElementById('board').getBoundingClientRect();return [...document.querySelectorAll('.card')].every(e=>{const a=e.getBoundingClientRect();return a.bottom<=r.bottom+1&&a.right<=r.right+1;});});assert.ok(fit,'All cards fit '+width+'x'+height);
await p.locator('#openMenu').click();await p.locator('#menuSettings').click();assert.equal(await p.locator('#gameMenu').evaluate(e=>e.open),false);
await p.locator('.ds-close').click();await p.waitForFunction(()=>[...document.querySelectorAll('.card img')].every(i=>i.complete&&i.naturalWidth>0));await p.screenshot({path:'tools/game-'+width+'-portrait.png'});
await p.goto('http://127.0.0.1:8770/');assert.ok(await p.evaluate(()=>document.documentElement.scrollHeight<=innerHeight && document.body.scrollHeight<=innerHeight));
assert.equal(await p.locator('.tile:visible').count(),4);await p.locator('#nextGames').click();assert.equal(await p.locator('.tile:visible').count(),4);
await p.screenshot({path:'tools/home-'+width+'-portrait.png'});assert.deepEqual(errors,[]);console.log('PASS '+width+'x'+height);await c.close();}
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
