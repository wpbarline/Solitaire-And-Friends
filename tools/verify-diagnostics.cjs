const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.GAME_URL||'http://127.0.0.1:8773/Solitaire-And-Friends/';
(async()=>{const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'msedge',headless:true});try{
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();
 await page.addInitScript(()=>localStorage.setItem('solitaire-friends-player-name','Arline'));
 await page.goto(base);await page.locator('#startGame:enabled').click();await page.waitForFunction(()=>window.__sol?.ready);
 await page.locator('.slot.stock').press('Enter');const before=await page.evaluate(()=>window.__sol.state);
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(r=>navigator.serviceWorker.addEventListener('controllerchange',r,{once:true}));});
 await context.setOffline(true);
 await page.getByRole('button',{name:'Settings',exact:true}).click();await page.getByRole('button',{name:'App',exact:true}).click();
 await page.getByRole('button',{name:'Card rendering diagnostic',exact:true}).click();
 await page.getByRole('button',{name:'Collect rendering report',exact:true}).click();await page.locator('.render-diagnostics pre').waitFor();
 const report=JSON.parse(await page.locator('.render-diagnostics pre').textContent());
 assert.match(report.runningRelease,/^solitaire-friends-react-/,'report identifies executing HTML even offline');
 assert.equal(report.images.length,2);for(const image of report.images){assert.equal(image.status,200);assert.ok(image.decodedSize.every(n=>n>0));}
 for(const name of ['clip','transform','transition','effects'])await page.getByLabel(name,{exact:true}).check();
 await page.getByRole('button',{name:'Collect rendering report',exact:true}).click();
 assert.deepEqual(await page.evaluate(()=>window.__sol.state),before);
 await page.getByRole('button',{name:'Close',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});
 await page.locator('.slot.stock').press('Enter');assert.equal(await page.evaluate(()=>window.__sol.moves),2);
 console.log('PASS offline lazy diagnostic, original face/back, independent toggles, unchanged checkpoint, dismissal');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
