const {chromium}=require('C:/Users/Arline/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await b.newPage({viewport:{width:390,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8773/Solitaire-And-Friends/');
 await p.evaluate(async()=>{localStorage.setItem('solitaire-friends-player-name','Arline');localStorage.setItem('other-app-data','keep');await caches.open('other-app-cache');await navigator.serviceWorker.ready;});
 await p.reload();await p.locator('#startGame:enabled').click();await p.waitForFunction(()=>window.__sol?.ready);await p.locator('.slot.stock').press('Enter');const before=await p.evaluate(()=>window.__sol.state);
 const app=async()=>{await p.getByRole('button',{name:'Settings',exact:true}).click();await p.getByRole('button',{name:'App',exact:true}).click();};
 await app();await p.getByRole('button',{name:'Check for updates',exact:true}).click();await p.getByText('The app is up to date.',{exact:true}).waitFor();
 await p.getByRole('button',{name:'Refresh app cache',exact:true}).click();await p.getByRole('button',{name:'Keep everything',exact:true}).click();await p.getByRole('dialog').waitFor({state:'hidden'});assert.deepEqual(await p.evaluate(()=>window.__sol.state),before);
 await app();await p.getByRole('button',{name:'Refresh app cache',exact:true}).click();await Promise.all([p.waitForEvent('load'),p.getByRole('button',{name:'Refresh app cache',exact:true}).click()]);await p.waitForFunction(()=>window.__sol?.ready);assert.deepEqual(await p.evaluate(()=>window.__sol.state),before);
 assert.equal(await p.evaluate(()=>localStorage.getItem('solitaire-friends-player-name')),'Arline');assert.ok(await p.evaluate(()=>caches.has('other-app-cache')));
 await app();await p.getByRole('button',{name:'Erase saved data',exact:true}).click();await p.getByRole('button',{name:'Erase saved data',exact:true}).click();await p.waitForSelector('#startGame:enabled');
 assert.equal(await p.evaluate(()=>localStorage.getItem('solitaire-friends-player-name')),null);assert.equal(await p.evaluate(()=>localStorage.getItem('solitaire-friends-game-v1')),null);assert.equal(await p.evaluate(()=>localStorage.getItem('other-app-data')),'keep');assert.deepEqual(errors,[]);
 console.log('PASS manual update check, cache refresh preserves checkpoint, cancel, scoped saved-data erase');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
