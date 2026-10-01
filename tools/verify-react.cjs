const {chromium}=require('C:/Users/Arline/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.GAME_URL||'http://127.0.0.1:8771/Solitaire-And-Friends/';
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
for(const [width,height] of [[360,640],[390,844],[844,390],[1366,768]]){
const c=await b.newContext({viewport:{width,height},serviceWorkers:'block'}),p=await c.newPage(),errors=[],dialogs=[],cues=[];p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>{dialogs.push(d.type());d.dismiss();});
await p.goto(base);await p.waitForSelector('#startGame:enabled');await p.evaluate(()=>{window.cues=[];addEventListener('game-audio-cue',e=>window.cues.push(e.detail.name));});await p.screenshot({path:'tools/react-title-'+width+'-portrait.png'});
await p.locator('#startGame').click();await p.waitForFunction(()=>window.__sol?.state&&document.querySelectorAll('.card').length===52);
await p.waitForTimeout(400);assert.ok((await p.evaluate(()=>window.cues)).includes('tada.ogg'),'First tap welcome cue');
assert.equal(await p.locator('.card').count(),52);assert.ok(await p.evaluate(()=>document.documentElement.scrollHeight<=innerHeight&&document.body.scrollHeight<=innerHeight));
const stock=await p.locator('.slot.stock').boundingBox(),foundation=await p.locator('.slot.foundation').first().boundingBox();assert.ok(stock.x>foundation.x,'Deck on right');
const before=await p.evaluate(()=>window.__sol.state);await p.locator('#hintBtn').click();await p.locator('#playHint').click();assert.equal(await p.evaluate(()=>window.__sol.moves),1);await p.waitForTimeout(100);
assert.ok((await p.evaluate(()=>window.cues)).some(n=>n.startsWith('deal-')),'Guided Play emits physical card cue');
await p.locator('#rewindBtn').click();assert.deepEqual(await p.evaluate(()=>window.__sol.state),before);await p.waitForTimeout(100);assert.ok((await p.evaluate(()=>window.cues)).includes('card-return'),'Undo return cue');
await p.locator('#newDeal').click();await p.locator('#newGame').click();await p.waitForTimeout(150);assert.ok((await p.evaluate(()=>window.cues)).includes('shuffle.wav'),'New deal riffle');assert.deepEqual(dialogs,[]);
await p.waitForFunction(()=>[...document.querySelectorAll('.card img')].every(i=>i.complete&&i.naturalWidth>0));
await p.waitForSelector('.board:not(.dealing)');await p.screenshot({path:'tools/react-game-'+width+'-portrait.png'});
const fit=await p.evaluate(()=>{const r=document.getElementById('board').getBoundingClientRect();return [...document.querySelectorAll('.card')].every(e=>{const a=e.getBoundingClientRect();return a.bottom<=r.bottom+1&&a.right<=r.right+1&&a.left>=r.left-1;});});assert.ok(fit,'Card bounds '+width);
await p.getByRole('button',{name:'Settings',exact:true}).click();await p.getByRole('button',{name:'Cards & table'}).click();await p.getByLabel('Draw deck').selectOption('left');await p.getByRole('button',{name:'Close',exact:true}).click();assert.ok((await p.locator('.slot.stock').boundingBox()).x<(await p.locator('.slot.foundation').first().boundingBox()).x);
await p.locator('.slot.stock').press('Enter');const saved=await p.evaluate(()=>window.__sol.state);await p.reload();await p.waitForFunction(()=>window.__sol?.state);assert.deepEqual(await p.evaluate(()=>window.__sol.state),saved);
assert.deepEqual(errors,[]);console.log('PASS React '+width+'x'+height+' title/welcome, guided audio, undo, shuffle, glyph settings, bounds, checkpoint');await c.close();
}
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});