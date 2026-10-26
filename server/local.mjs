import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { createHandler } from './core.mjs';
import { fileStore } from './stores.mjs';
const root=fileURLToPath(new URL('../site/',import.meta.url));
const data=fileURLToPath(new URL('../.local-data/',import.meta.url));fs.mkdirSync(data,{recursive:true,mode:0o700});
const secretPath=path.join(data,'link-secret');if(!fs.existsSync(secretPath))fs.writeFileSync(secretPath,randomBytes(32).toString('hex'),{mode:0o600});
const secret=fs.readFileSync(secretPath,'utf8');const handler=createHandler({store:fileStore(path.join(data,'records')),secret,mode:'preview'});
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.json':'application/json'};
const server=http.createServer(async(req,res)=>{try{
 const origin=`http://127.0.0.1:${server.address().port}`;const u=new URL(req.url,origin);
 if(u.pathname==='/.netlify/functions/family-waivers'){
  const body=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>65536){res.writeHead(413);res.end('Too large');return;}body.push(chunk);}
  const request=new Request(u,{method:req.method,headers:req.headers,body:req.method==='GET'?undefined:Buffer.concat(body)});const response=await handler(request);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
 }
 const target=u.pathname==='/'?'/register-family.html':u.pathname==='/register-family'?'/register-family.html':u.pathname==='/family-sign'?'/family-sign.html':u.pathname;
 const p=path.resolve(root,'.'+decodeURIComponent(target));if(!p.startsWith(root)||!fs.existsSync(p)||fs.statSync(p).isDirectory()){res.writeHead(404);res.end('Not found');return;}
 res.writeHead(200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'"});fs.createReadStream(p).pipe(res);
 }catch{res.writeHead(500);res.end('Unable to load this page.');}});
server.listen(Number(process.env.PORT||4178),'127.0.0.1',()=>console.log(`Local preview: http://127.0.0.1:${server.address().port}/register-family.html`));
