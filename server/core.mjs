import { randomUUID, createHash, createHmac, timingSafeEqual } from 'node:crypto';
import agreements from './agreements.json' with { type: 'json' };
export const ACCESS_TEXT = 'I understand the household contact can view this participant record and signed copy.';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SECRET=/^[a-f0-9]{64}$/i;
const normalized=x=>x.trim().replace(/\s+/g,' ').toLocaleLowerCase('en-US');
export const hash=x=>createHash('sha256').update(x).digest('hex');
function fail(message,status=422){throw Object.assign(new Error(message),{status});}
function text(value,label,max=150){if(typeof value!=='string'||!value.trim()||value.length>max||/[\u0000-\u001f]/.test(value))fail(`Enter a valid ${label}.`);return value.trim().replace(/\s+/g,' ');}
function fullName(value,label='full legal name'){const s=text(value,label,120);if(s.split(/\s+/).length<2)fail(`Enter the full ${label}, including last name.`);return s;}
function email(v){const s=text(v,'email address',254);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s))fail('Enter a valid email address.');return s;}
function phone(v){const s=text(v,'phone number',40);if(s.replace(/\D/g,'').length<7)fail('Enter a valid phone number.');return s;}
export function localDay(now){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);}
export function ageAt(birth,day){if(typeof birth!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(birth)||birth>day)return null;const [y,m,d]=birth.split('-').map(Number);const dt=new Date(Date.UTC(y,m-1,d));if(dt.getUTCFullYear()!==y||dt.getUTCMonth()!==m-1||dt.getUTCDate()!==d)return null;const [ty,tm,td]=day.split('-').map(Number);const age=ty-y-((tm<m||(tm===m&&td<d))?1:0);return age<0||age>120?null:age;}
function birth(v,day){const age=ageAt(v,day);if(age===null)fail('Enter a valid date of birth.');return {dob:v,age};}
function compare(a,b){const aa=Buffer.from(a),bb=Buffer.from(b);return aa.length===bb.length&&timingSafeEqual(aa,bb);}
function signature(raw,participant,day,now,mode){
 const minor=participant.age<18;
 const signerName=minor?fullName(raw.signerName,'guardian legal name'):participant.name;
 const signerBirth=minor?birth(raw.signerDob,day):{dob:participant.dob,age:participant.age};
 if(normalized(participant.emergencyName)===normalized(signerName))fail('Choose an emergency contact other than the adult signer.');
 if(signerBirth.age<18)fail('A parent or legal guardian age 18 or older must sign for a child.');
 if(raw.ownSignature!==true)fail('The adult signer must confirm they are signing personally.');
 if(raw.accepted!==true||raw.accessAccepted!==true)fail('Read and accept the agreement and household access notice.');
 if(mode==='preview'&&raw.previewAccepted!==true)fail('Confirm this is an unsigned preview test.');
 const typed=fullName(raw.signature,'signature');
 if(normalized(typed)!==normalized(signerName))fail('The typed signature must match the adult signer’s full legal name.');
 let relationship=null;
 if(minor){if(!['Parent','Legal guardian'].includes(raw.relationship)||raw.guardianAuthority!==true)fail('Confirm parent or legal guardian authority.');relationship=raw.relationship;}
 return {role:minor?'guardian':'adult',signerName,signerDob:signerBirth.dob,relationship,guardianAuthority:minor,signature:typed,agreementAccepted:true,mediaReleaseIncluded:true,householdAccessAccepted:ACCESS_TEXT,ownSignatureConfirmed:true,serverReceivedAt:now.toISOString(),browserSignedAt:typeof raw.browserSignedAt==='string'?raw.browserSignedAt.slice(0,40):null,testOnly:mode==='preview',legalSignature:mode==='production'};
}
function profile(raw,day,household){
 const name=fullName(raw.name,'participant legal name');const bd=birth(raw.dob,day);
 const waiverKey=raw.waiver==='Samba'?'All-Practices':raw.waiver;const agreement=Object.hasOwn(agreements,waiverKey)?agreements[waiverKey]:null;if(!agreement)fail('Choose a waiver for each participant.');
 if(raw.agreementVersion!==agreement.version||raw.agreementHash!==agreement.sha256)fail('The agreement changed. Reload and read the current version before signing.',409);
 return {id:randomUUID(),name,...bd,practice:raw.waiver,externalRegistration:raw.waiver==='Samba'?{provider:'Carisma Dance Academy',url:'https://form.jotform.com/262537661593163',required:true,status:'not_verified'}:null,email:raw.email?email(raw.email):household.email,phone:raw.phone?phone(raw.phone):household.phone,emergencyName:raw.emergencyName?fullName(raw.emergencyName,'emergency contact name'):household.emergencyName,emergencyPhone:raw.emergencyPhone?phone(raw.emergencyPhone):household.emergencyPhone,agreement:structuredClone(agreement)};
}
function token(secret,family,participant){return createHmac('sha256',secret).update(`family-sign/v1/${family.id}/${participant.id}/${participant.linkExpiresAt}`).digest('hex');}
function publicParticipant(p){const {linkExpiresAt,signAttemptId,...safe}=p;return {...safe,linkExpiresAt};}
function summary(record,secret,origin){return {id:record.id,mode:record.mode,receivedAt:record.receivedAt,household:record.household,participants:record.participants.map(p=>({...publicParticipant(p),signUrl:p.status==='pending'?`${origin}/family-sign.html#family=${record.id}&participant=${p.id}&token=${token(secret,record,p)}`:null})),message:record.mode==='preview'?'Preview registration saved. No legal signature was created.':'Registration saved. Staff will check each waiver before class.'};}
async function jsonBody(req){if(!req.headers.get('content-type')?.startsWith('application/json'))fail('Use JSON for this request.',415);const reader=req.body?.getReader();if(!reader)fail('A request body is required.',400);let size=0;const chunks=[];for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>65536){await reader.cancel();fail('This registration is too large.',413);}chunks.push(value);}try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{fail('The request could not be read.',400);}}
const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, private','Pragma':'no-cache','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'no-referrer'};
function response(body,status=200){return new Response(JSON.stringify(body),{status,headers});}
export function createHandler({store,secret,mode='preview',enabled=true,now=()=>new Date(),notify=async()=>{}}){
 return async function handler(req){
 try{
  const url=new URL(req.url),action=url.searchParams.get('action')||'catalog';const at=now(),day=localDay(at);
  if(req.method==='GET'&&action==='catalog')return response({mode,enabled,today:day,agreements:Object.values(agreements),accessText:ACCESS_TEXT});
  if(!enabled)fail('Family registration is not open yet. Please contact the Studio.',503);
  if(!secret||secret.length<32)fail('Registration is not configured. Please contact the Studio.',503);
  if(!['GET','POST'].includes(req.method))fail('Method not allowed.',405);
  if(req.method==='POST'&&req.headers.get('origin')!==url.origin)fail('Open this form on the Studio website before submitting.',403);
  if(req.method==='POST'&&action==='register'){
   const input=await jsonBody(req);if(input.website)fail('Unable to accept this registration.',400);
   if(!UUID.test(input.requestId)||!SECRET.test(input.receiptKey))fail('Reload the form to start a new registration.',400);
   if(input.householdConsent!==true)fail('Confirm you have permission to enter the household details.');
   const h=input.household||{};const household={contactName:fullName(h.contactName,'household contact name'),email:email(h.email),phone:phone(h.phone),emergencyName:fullName(h.emergencyName,'emergency contact name'),emergencyPhone:phone(h.emergencyPhone),whatsapp:h.whatsapp===true};
   if(!Array.isArray(input.participants)||input.participants.length<1||input.participants.length>8)fail('Add between one and eight participants.');
   const receiptHash=hash(input.receiptKey),payloadHash=hash(JSON.stringify(input)),key='families/'+input.requestId;
   const previous=await store.get(key);
   if(previous){if(!compare(previous.data.receiptHash,receiptHash)||previous.data.payloadHash!==payloadHash)fail('This registration reference has already been used. Start a new registration.',409);return response(summary(previous.data,secret,url.origin));}
   const participants=input.participants.map(raw=>{
    const p=profile(raw,day,household);
    if(raw.signLater===true){if(p.age<18)fail('A guardian must sign for each child in this registration.');return {...p,status:'pending',signing:null,linkExpiresAt:new Date(at.getTime()+7*86400000).toISOString()};}
    if(normalized(p.emergencyName)===normalized(p.name))fail('Choose an emergency contact other than the participant.');
    return {...p,status:'signed',signing:signature(raw,p,day,at,mode),linkExpiresAt:null};
   });
   const names=participants.map(p=>normalized(p.name)+'/'+p.dob);if(new Set(names).size!==names.length)fail('Each participant should appear only once in this registration.');
   const record={schemaVersion:1,id:input.requestId,mode,testOnly:mode==='preview',receivedAt:at.toISOString(),household,householdConsent:true,receiptHash,payloadHash,participants};
   const saved=await store.set(key,record,{onlyIfNew:true});
   if(!saved.modified){const existing=await store.get(key);if(!existing||existing.data.payloadHash!==payloadHash||!compare(existing.data.receiptHash,receiptHash))fail('A registration conflict occurred. Please contact the Studio.',409);return response(summary(existing.data,secret,url.origin));}
   const verified=await store.get(key);if(!verified||verified.data.payloadHash!==payloadHash)fail('We could not verify storage. Keep this page open and contact the Studio before trying again.',503);
   await notify(verified.data,'Family registration submitted');
   return response(summary(verified.data,secret,url.origin),201);
  }
  const familyId=url.searchParams.get('family'),participantId=url.searchParams.get('participant');
  if(!UUID.test(familyId||''))fail('This private registration link is invalid.',404);
  const auth=req.headers.get('authorization')?.replace(/^Bearer /,'')||'';
  if(!SECRET.test(auth))fail('A private access key is required.',401);
  const key='families/'+familyId;const found=await store.get(key);
  if(!found)fail('The registration could not be found.',404);const record=found.data;
  if(action==='receipt'&&req.method==='GET'){
   if(!compare(record.receiptHash,hash(auth)))fail('This private access key is invalid.',403);
   return response(summary(record,secret,url.origin));
  }
  if(!UUID.test(participantId||''))fail('This signing link is invalid.',404);
  const p=record.participants.find(p=>p.id===participantId);if(!p)fail('The participant could not be found.',404);
  if(!compare(token(secret,record,p),auth))fail('This signing link is invalid.',403);
  if(p.linkExpiresAt<=at.toISOString())fail('This signing link has expired. Please contact the Studio.',410);
  if(action==='participant'&&req.method==='GET')return response({mode:record.mode,participant:publicParticipant(p),householdContact:record.household.contactName,accessText:ACCESS_TEXT});
  if(action==='sign'&&req.method==='POST'){
   const raw=await jsonBody(req);
   if(!UUID.test(raw.attemptId||''))fail('Reload the signing page before trying again.',400);
   if(p.status==='signed'){if(p.signAttemptId===raw.attemptId)return response({mode:record.mode,participant:publicParticipant(p),alreadySaved:true});fail('This participant already has a signed record. Contact the Studio to make corrections.',409);}
   if(raw.agreementVersion!==p.agreement.version||raw.agreementHash!==p.agreement.sha256)fail('Read the complete agreement before signing.',409);
   const bd=birth(raw.dob,day);if(bd.age<18)fail('This link is for an adult to sign personally. Contact the Studio for a guardian form.');
   const revised={...p,name:fullName(raw.name,'participant legal name'),...bd,email:email(raw.email),phone:phone(raw.phone),emergencyName:fullName(raw.emergencyName,'emergency contact name'),emergencyPhone:phone(raw.emergencyPhone)};
   if(normalized(revised.emergencyName)===normalized(revised.name))fail('Choose an emergency contact other than yourself.');
   const signed={...revised,status:'signed',signing:signature(raw,revised,day,at,record.mode),signAttemptId:raw.attemptId};
   const next={...record,participants:record.participants.map(x=>x.id===p.id?signed:x)};
   const saved=await store.set(key,next,{onlyIfMatch:found.etag});
   if(!saved.modified)fail('Another family member updated this registration. Refresh before trying again.',409);
   const verified=await store.get(key);const participant=verified?.data.participants.find(x=>x.id===p.id);
   if(!participant||participant.signAttemptId!==raw.attemptId)fail('We could not confirm the saved signature. Contact the Studio.',503);
   await notify(verified.data,'Adult waiver signed');
   return response({mode:record.mode,participant:publicParticipant(participant)});
  }
  fail('This action is not available.',404);
 }catch(e){return response({error:e.status?e.message:'We could not confirm storage. Keep your details here and contact the Studio before trying again.'},e.status||503);}
 };
}
