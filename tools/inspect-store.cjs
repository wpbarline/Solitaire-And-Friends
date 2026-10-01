const {chromium}=require('C:/Users/Arline/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{const p=await b.newPage({viewport:{width:1400,height:1000},deviceScaleFactor:1});
for(const [name,id] of [['playmint','com.playmint.purely.solitaire'],['mobilityware','com.mobilityware.solitaire'],['microsoft','com.microsoft.microsoftsolitairecollection']]){
await p.goto('https://play.google.com/store/apps/details?id='+id+'&hl=en_US',{waitUntil:'domcontentloaded'});const shots=p.locator('img[alt="Screenshot image"]');await shots.first().waitFor();const count=await shots.count();console.log(name+' '+count+' screenshots');
for(let i=0;i<Math.min(4,count);i++){const img=shots.nth(i);await img.scrollIntoViewIfNeeded();await img.evaluate(e=>e.loading='eager');await img.evaluate(e=>e.complete?Promise.resolve():new Promise(r=>{e.onload=r;e.onerror=r;}));await img.screenshot({path:'tools/references/'+name+'-'+(i+1)+'.png'});console.log(name+'-'+(i+1));}
}
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});