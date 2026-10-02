const {chromium}=require('C:/Users/Arline/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),profile=fs.mkdtempSync(path.join(root,'tools','.test-react-'));
const base=process.env.GAME_URL||'http://127.0.0.1:8771/Solitaire-And-Friends/';
(async()=>{let c;try{
 c=await chromium.launchPersistentContext(profile,{channel:'msedge',headless:true,viewport:{width:390,height:844},serviceWorkers:'block'});let p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+'games/solitaire/');await p.waitForFunction(()=>window.__sol?.ready);
 await p.locator('#newDeal').click();await p.locator('#drawMode').selectOption('3');await p.getByRole('dialog').waitFor({state:'hidden'});
 for(let i=0;i<8;i++){await p.locator('.slot.stock').press('Enter');const checkpoint=await p.evaluate(()=>({live:window.__sol.state,saved:JSON.parse(localStorage.getItem('solitaire-friends-game-v1'))}));assert.deepEqual(checkpoint.live,checkpoint.saved.state);}
 assert.equal(await p.evaluate(()=>window.__sol.stock),0);assert.equal(await p.evaluate(()=>window.__sol.waste),24);
 await p.locator('.slot.stock').press('Enter');assert.equal(await p.evaluate(()=>window.__sol.stock),24);await p.locator('#rewindBtn').click();assert.equal(await p.evaluate(()=>window.__sol.waste),24);
 const before=await p.evaluate(()=>window.__sol.state);for(let i=0;i<3;i++)await p.locator('#rewindBtn').click();const reverseTarget=await p.evaluate(()=>window.__sol.state);for(let i=0;i<3;i++)await p.locator('.slot.stock').press('Enter');
 await p.locator('#timeReverse').click();await p.waitForFunction(()=>!window.__sol.hud.reversing);assert.equal(await p.evaluate(()=>window.__sol.rewindsLeft),2);
 const state=await p.evaluate(()=>window.__sol.state),history=await p.evaluate(()=>window.__sol.historyLength);await c.close();
 c=await chromium.launchPersistentContext(profile,{channel:'msedge',headless:true,viewport:{width:390,height:844},serviceWorkers:'block'});p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'games/solitaire/');await p.waitForFunction(()=>window.__sol?.ready);assert.deepEqual(await p.evaluate(()=>window.__sol.state),state);assert.equal(await p.evaluate(()=>window.__sol.historyLength),history);assert.equal(await p.evaluate(()=>window.__sol.rewindsLeft),2);
 // Use a real dealt board with a buried ace: a rescue may inspect hidden stock by design.
 await p.evaluate(()=>{for(let i=0;i<10;i++){window.__sol.newGame('Classic',1,false);if(window.__sol.state.stock.slice(0,-1).some(c=>c.id%13===0))break;}});
 const original=await p.evaluate(()=>window.__sol.state);await p.locator('#surpriseBtn').click();assert.equal(await p.evaluate(()=>window.__sol.hud.surprisesLeft),0);
 const count=await p.evaluate(()=>{const s=window.__sol.state;return new Set([...s.stock,...s.waste,...s.tableau.flat(),...s.foundations.flat()].map(c=>c.id)).size;});assert.equal(count,52);assert.equal(await p.evaluate(()=>window.__sol.waste),1);
 await p.locator('#rewindBtn').click();assert.deepEqual(await p.evaluate(()=>window.__sol.state),original);assert.equal(await p.evaluate(()=>window.__sol.hud.surprisesLeft),0);await p.reload();await p.waitForFunction(()=>window.__sol?.ready);assert.equal(await p.evaluate(()=>window.__sol.hud.surprisesLeft),0);
 // Almost-won legal fixture exercises celebration, record value and duplicate protection.
 await p.addInitScript(()=>{const foundations=Array.from({length:4},(_,s)=>Array.from({length:s===3?12:13},(_,r)=>({id:s*13+r,up:true})));const state={stock:[],waste:[{id:51,up:true}],foundations,tableau:Array.from({length:7},()=>[]),moves:100};localStorage.setItem('solitaire-friends-game-v1',JSON.stringify({version:1,seed:1,drawCount:1,elapsed:300,initial:state,state,history:[],shufflesLeft:1,rewindsLeft:3,surprisesLeft:0,dealKind:'Classic',winRecorded:false}));});
 await p.reload();await p.waitForFunction(()=>window.__sol?.ready);await p.locator('.card[data-id="51"]').click();await p.waitForFunction(()=>window.__sol.hud.won);const stats=await p.evaluate(()=>JSON.parse(localStorage.getItem('solitaire-friends-stats-v1')));assert.equal(stats.wins,1);assert.equal(stats.highScores[0].assisted,true);assert.equal(await p.evaluate(()=>window.__sol.hud.score),stats.highScores[0].score);assert.ok(await p.locator('.scene-victory canvas').isVisible());await p.screenshot({path:'tools/react-victory-portrait.png'});
 await p.evaluate(()=>window.__sol.rewind());await p.locator('.card[data-id="51"]').click();assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('solitaire-friends-stats-v1')).wins),1);
 await p.goto(base+'games/solitaire/statistics.html');await p.getByRole('dialog').waitFor();assert.ok(await p.locator('.record').count());
 assert.deepEqual(errors,[]);console.log('PASS draw-three/recycle, immediate checkpoints, real browser closure/history, reverse charges, Surprise conservation/undo/persistence, assisted victory and duplicate protection');
}finally{await c?.close();if(path.dirname(profile)!==path.join(root,'tools'))throw Error('Unsafe test cleanup');fs.rmSync(profile,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exitCode=1;});
