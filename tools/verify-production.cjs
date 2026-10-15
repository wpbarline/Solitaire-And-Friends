// Sequential: the worker-replacement check intentionally edits dist/sw.js and
// restores it in finally. Never rebuild/serve a different dist during this run.
const {spawn}=require('node:child_process');
const tests=['verify-rules.mjs','verify-runtime.cjs','verify-ghost.cjs','verify-intro-rendering.cjs','verify-storage.cjs','verify-update.cjs','verify-react-offline.cjs','verify-personalization.cjs','verify-react-audio.cjs','verify-diagnostics.cjs','verify-menu-audio.cjs','verify-pointer.cjs','verify-effects.cjs'];
(async()=>{for(const test of tests){
 console.log('\nCHECK',test);
 const code=await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[require('node:path').join(__dirname,test)],{stdio:'inherit',env:{...process.env,GAME_URL:process.env.GAME_URL||'http://127.0.0.1:8773/Solitaire-And-Friends/'}});child.on('error',reject);child.on('exit',resolve);});
 if(code!==0)throw Error(`${test} failed (${code}); production verification stopped`);
}console.log('\nPASS all production checks');})().catch(e=>{console.error(e);process.exitCode=1;});
