// Production screenshots in fresh, disposable contexts; never uses a real profile.
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const base=process.env.GAME_URL||'http://127.0.0.1:8773/Solitaire-And-Friends/';
(async()=>{
 const out=path.resolve(process.env.CAPTURE_DIR||'evidence/baseline');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'msedge',headless:true});
 try{for(const viewport of [{width:390,height:844},{width:844,height:390},{width:1366,height:768}]){
  const context=await browser.newContext({viewport,serviceWorkers:'block'}),page=await context.newPage();
  await page.addInitScript(()=>localStorage.setItem('solitaire-friends-player-name','Arline'));
  const shot=label=>page.screenshot({path:path.join(out,`${label}-${viewport.width}.png`)});
  await page.goto(base);await page.locator('#startGame:enabled').waitFor();await page.waitForTimeout(1200);await shot('title');
  await page.locator('#startGame').click();await page.waitForFunction(()=>window.__sol?.ready);await page.waitForTimeout(2200);await shot('solitaire');
  await page.getByRole('button',{name:'Settings',exact:true}).click();await page.waitForTimeout(350);await shot('settings');
  await page.getByRole('button',{name:'Close',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});
  await page.locator('.slot.stock').press('Enter');await page.waitForTimeout(700);
  await page.getByRole('button',{name:'Home',exact:true}).click();
  await page.getByRole('button',{name:'Game Select',exact:true}).click();await page.getByRole('button',{name:'Ghost race',exact:true}).click();
  await page.getByRole('button',{name:/Practice run/}).first().click();await page.waitForFunction(()=>window.__sol?.ready);await page.waitForTimeout(2200);await shot('ghost');
  await page.getByRole('button',{name:'Game Select',exact:true}).click();await page.getByRole('button',{name:'UNO · Four players',exact:true}).click();
  await page.waitForSelector('#uno .opp');await page.waitForTimeout(350);await shot('uno');await context.close();
  console.log('Captured five scenes',viewport);
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
