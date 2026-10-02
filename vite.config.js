import {defineConfig} from 'vite';
import {resolve} from 'node:path';
export default defineConfig({base:'/Solitaire-And-Friends/',publicDir:false,esbuild:{jsx:'automatic'},build:{outDir:'dist',rollupOptions:{input:{home:resolve('index.html')}}},server:{port:8771},preview:{port:8771}});
