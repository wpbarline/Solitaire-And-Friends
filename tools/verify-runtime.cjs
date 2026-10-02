const {chromium}=require('C:/Users/Arline/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 for(const viewport of [{width:390,height:844},{width:1366,height:768}]){
  const context=await b.newContext({viewport,serviceWorkers:'block'}),p=await context.newPage(),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.goto(process.env.GAME_URL||'http://127.0.0.1:8772/Solitaire-And-Friends/');await p.locator('#startGame:enabled').click();
  await p.waitForFunction(()=>window.__sol?.ready);assert.equal(await p.locator('.card').count(),52);
  const root=p.url();await p.locator('.slot.stock').press('Enter');assert.ok(await p.evaluate(()=>window.__sol.moves>0));
  p.once('dialog',d=>d.accept());await p.reload();await p.waitForFunction(()=>window.__sol?.ready);
  assert.equal(p.url(),root);assert.equal(await p.evaluate(()=>window.__sol.moves),0);
  await p.getByRole('button',{name:'Games',exact:true}).click();await p.getByRole('button',{name:'UNO · Four players',exact:true}).click();
  await p.waitForSelector('#uno .opp');assert.equal(await p.locator('#uno .opp').count(),3);assert.equal(await p.locator('#uno .card-btn').count(),7);assert.equal(p.url(),root);
  assert.ok(await p.locator('#uno').evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight+1),'UNO board fits viewport');
  await p.getByRole('button',{name:'Games',exact:true}).click();await p.getByRole('button',{name:'Solitaire',exact:true}).click();
  await p.waitForFunction(()=>window.__sol?.ready);await p.waitForTimeout(1600);assert.equal(await p.locator('.card').count(),52);assert.deepEqual(errors,[]);
  console.log('PASS single URL, refresh restart, Solitaire/UNO switching, four players',viewport);await context.close();
 }
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
