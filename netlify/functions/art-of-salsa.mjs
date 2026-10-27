import { getStore, getDeployStore } from '@netlify/blobs';
import { timingSafeEqual } from 'node:crypto';
import { shopifyClient, publicOptions, checkout, adminData, validCapacity, SalsaError } from '../../server/salsa.mjs';
// Shopify keys live only in Netlify environment variables (SHOPIFY_STORE, SHOPIFY_CLIENT_ID, SHOPIFY_CLIENT_SECRET).
const gql=shopifyClient({store:process.env.SHOPIFY_STORE,clientId:process.env.SHOPIFY_CLIENT_ID,clientSecret:process.env.SHOPIFY_CLIENT_SECRET,token:process.env.SHOPIFY_ADMIN_TOKEN});
const json=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const pinOk=given=>{const pin=process.env.SALSA_ADMIN_PIN||'';const a=Buffer.from(String(given||'')),b=Buffer.from(pin);return pin.length>=6&&a.length===b.length&&timingSafeEqual(a,b);};
export default async function handler(request){
 const production=['rootsandwisdomstudio.com','www.rootsandwisdomstudio.com','majestic-paletas-4fdb52.netlify.app'].includes(new URL(request.url).hostname);
 const blob=production?getStore({name:'art-of-salsa-v1',consistency:'strong'}):getDeployStore({name:'art-of-salsa-preview-v1',consistency:'strong'});
 const parts=new URL(request.url).pathname.replace(/^\/api\/salsa\/?/,'').split('/').filter(Boolean);
 try{
  if(!process.env.SHOPIFY_STORE||!(process.env.SHOPIFY_CLIENT_SECRET||process.env.SHOPIFY_ADMIN_TOKEN))throw new SalsaError('Registration is not connected to Shopify yet.',503);
  const caps=(await blob.get('capacity',{type:'json'}))||{};
  if(request.method==='GET'&&parts.join('/')==='options')return json(await publicOptions({gql,caps}));
  if(request.method==='POST'&&parts.join('/')==='checkout')return json(await checkout({gql,caps,body:await request.json().catch(()=>({}))}));
  if(parts[0]==='admin'){
   if(!pinOk(request.headers.get('x-admin-pin')))return json({error:'PIN required'},401);
   if(request.method==='GET'&&parts.length===1)return json(await adminData({gql,caps}));
   if(request.method==='POST'&&parts[1]==='capacity'){
    const b=await request.json().catch(()=>({}));validCapacity(b.option,b.capacity);
    const next={...caps,[b.option]:b.capacity??null};await blob.setJSON('capacity',next);
    return json(await adminData({gql,caps:next}));
   }
  }
  return json({error:'Not found'},404);
 }catch(e){
  if(e instanceof SalsaError)return json({error:e.message,...e.extra},e.status);
  console.error('Art of Salsa error',e);return json({error:'Something went wrong. Please try again in a moment.'},502);
 }
}
export const config={path:'/api/salsa/*',rateLimit:{action:'rate_limit',aggregateBy:['ip','domain'],windowSize:60,windowLimit:60}};
