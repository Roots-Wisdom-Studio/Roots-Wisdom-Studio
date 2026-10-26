import { getStore, getDeployStore } from '@netlify/blobs';
import { createHandler } from '../../server/core.mjs';
export default async function handler(request){
 const production=['rootsandwisdomstudio.com','www.rootsandwisdomstudio.com','majestic-paletas-4fdb52.netlify.app'].includes(new URL(request.url).hostname);
 const enabled=production?process.env.FAMILY_WAIVERS_ENABLED==='true':true;
 const blob=production?getStore({name:'family-waivers-v1',consistency:'strong'}):getDeployStore({name:'family-waivers-preview-v1',consistency:'strong'});
 const store={get:key=>blob.getWithMetadata(key,{type:'json',consistency:'strong'}),set:(key,data,options)=>blob.setJSON(key,data,options)};
 const notify=async(record,event)=>{
  if(!production)return;
  const body=new URLSearchParams({'form-name':'family-waiver-notice-v1',event,'registration-reference':record.id,'signed-count':String(record.participants.filter(p=>p.status==='signed').length),'pending-count':String(record.participants.filter(p=>p.status==='pending').length),'staff-records':'https://app.netlify.com/projects/majestic-paletas-4fdb52/blobs','received-at':record.receivedAt});
  try{const result=await fetch(new URL('/waiver-notification.html',request.url),{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body,signal:AbortSignal.timeout(8000)});if(!result.ok)console.error('Waiver notice not accepted',result.status);}catch{console.error('Waiver notice could not be submitted; private record remains saved.');}
 };
 return createHandler({store,notify,secret:process.env.WAIVER_LINK_SECRET,mode:production?'production':'preview',enabled})(request);
}
export const config={rateLimit:{action:'rate_limit',aggregateBy:['ip','domain'],windowSize:60,windowLimit:40}};
