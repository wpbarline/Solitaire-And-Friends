// Render the shared vector brand mark without touching deck or title artwork.
import {readFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Arline/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=new URL('../',import.meta.url),svg=await readFile(new URL('assets/app-icon.svg',root),'utf8');
await writeFile(new URL('assets/favicon.svg',root),svg);
const browser=await chromium.launch({channel:'msedge',headless:true});
try{for(const size of [192,512]){
 const page=await browser.newPage({viewport:{width:size,height:size},deviceScaleFactor:1});
 await page.setContent('<style>html,body{margin:0;width:100%;height:100%;overflow:hidden}svg{width:100%;height:100%}</style>'+svg);
 const png=await page.screenshot();await writeFile(new URL(`assets/icon-${size}.png`,root),png);await page.close();
}}finally{await browser.close();}
console.log('Rendered crowned-spade app icons and favicon.');
