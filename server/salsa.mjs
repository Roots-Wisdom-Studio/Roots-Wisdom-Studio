// The Art of Salsa intensives: server-side pricing, Shopify draft-order checkout and admin data.
// Prices never come from the browser. Each option's rate is the cheapest Shopify tier variant that still
// has stock (Founders 4, Early 4, Regular untracked). Checkout creates a draft order that reserves the spot
// for HOLD_MINUTES and sends the dancer to Shopify's hosted invoice checkout.
export const API_VERSION='2026-10';
export const TAG='art-of-salsa';
export const HOLD_MINUTES=10;
export const TIERS=[['FOUNDERS','Founders Launch Rate',195,4],['EARLY','Early Registration',225,4],['REGULAR','Regular Registration',250,null]];
// starts = first class in studio time (Pacific); registration for that series closes then.
export const OPTIONS=[
 {id:'nov-on1',month:'November 2026',style:'On1',name:'Precision & Flow',time:'6:30–7:50 PM',dates:'Mondays · Nov 9, 16, 23, 30',sku:'AOS-NOV26-ON1',starts:'2026-11-09T18:30:00-08:00'},
 {id:'nov-on2',month:'November 2026',style:'On2',name:'Connection & Musicality',time:'8:00–9:20 PM',dates:'Mondays · Nov 9, 16, 23, 30',sku:'AOS-NOV26-ON2',starts:'2026-11-09T20:00:00-08:00'},
 {id:'dec-on1',month:'December 2026',style:'On1',name:'Precision & Flow',time:'6:30–7:50 PM',dates:'Mondays · Dec 7, 14, 21, 28',sku:'AOS-DEC26-ON1',starts:'2026-12-07T18:30:00-08:00'},
 {id:'dec-on2',month:'December 2026',style:'On2',name:'Connection & Musicality',time:'8:00–9:20 PM',dates:'Mondays · Dec 7, 14, 21, 28',sku:'AOS-DEC26-ON2',starts:'2026-12-07T20:00:00-08:00'},
];
const OPTION_BY_ID=Object.fromEntries(OPTIONS.map(o=>[o.id,o]));
const PAID=new Set(['PAID','PARTIALLY_REFUNDED']);
export class SalsaError extends Error{constructor(message,status=400,extra={}){super(message);this.status=status;this.extra=extra;}}

export function shopifyClient({store,clientId,clientSecret,token,fetch=globalThis.fetch}){
 let cached={value:token||'',expires:token?Infinity:0};
 async function accessToken(){
  if(cached.value&&Date.now()<cached.expires)return cached.value;
  const r=await fetch(`https://${store}/admin/oauth/access_token`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({grant_type:'client_credentials',client_id:clientId,client_secret:clientSecret}),signal:AbortSignal.timeout(15000)});
  if(!r.ok)throw new SalsaError('Shopify sign-in failed ('+r.status+')',502);
  const b=await r.json();cached={value:b.access_token,expires:Date.now()+((b.expires_in||86400)-300)*1000};return cached.value;
 }
 return async function gql(query,variables={}){
  const r=await fetch(`https://${store}/admin/api/${API_VERSION}/graphql.json`,{method:'POST',headers:{'Content-Type':'application/json','X-Shopify-Access-Token':await accessToken()},body:JSON.stringify({query,variables}),signal:AbortSignal.timeout(20000)});
  const b=await r.json().catch(()=>({}));
  if(!r.ok||b.errors)throw new SalsaError('Shopify error: '+JSON.stringify(b.errors||r.status).slice(0,300),502);
  return b.data;
 };
}

const SNAPSHOT=`query($q:String!){
 productVariants(first:20,query:"sku:AOS-*"){nodes{id sku price inventoryItem{tracked inventoryLevels(first:1){nodes{quantities(names:["available"]){name quantity}}}}}}
 draftOrders(first:100,query:"tag:art-of-salsa status:open"){nodes{id reserveInventoryUntil lineItems(first:10){nodes{sku quantity}}}}
 orders(first:250,query:$q,sortKey:CREATED_AT,reverse:true){nodes{id name createdAt email displayFinancialStatus customAttributes{key value} lineItems(first:10){nodes{sku quantity originalUnitPriceSet{shopMoney{amount}}}}}}
}`;

export async function snapshot(gql,now=new Date()){
 const d=await gql(SNAPSHOT,{q:'tag:'+TAG});
 const variants={},holds={};
 for(const v of d.productVariants.nodes){const l=v.inventoryItem.inventoryLevels.nodes[0];variants[v.sku]={id:v.id,price:Number(v.price),tracked:v.inventoryItem.tracked,available:l?l.quantities[0].quantity:0};}
 for(const o of d.draftOrders.nodes)if(o.reserveInventoryUntil&&new Date(o.reserveInventoryUntil)>now)for(const li of o.lineItems.nodes)holds[li.sku]=(holds[li.sku]||0)+li.quantity;
 const orders=d.orders.nodes.map(o=>({name:o.name,createdAt:o.createdAt,email:o.email,status:o.displayFinancialStatus,attributes:Object.fromEntries(o.customAttributes.map(a=>[a.key,a.value])),items:o.lineItems.nodes.map(li=>({sku:li.sku,qty:li.quantity,price:Number(li.originalUnitPriceSet.shopMoney.amount)}))}));
 return {variants,holds,orders};
}

export function optionStatus(option,snap,caps,now=new Date()){
 const sku=option.sku;
 const paid=snap.orders.filter(o=>PAID.has(o.status)).flatMap(o=>o.items).filter(i=>i.sku?.startsWith(sku+'-')).reduce((n,i)=>n+i.qty,0);
 const held=Object.entries(snap.holds).filter(([s])=>s.startsWith(sku+'-')).reduce((n,[,q])=>n+q,0);
 const cap=caps[option.id]??null;
 const base={id:option.id,paid,held,capacity:cap,closed:now>=new Date(option.starts)};
 if(base.closed||cap!=null&&paid+held>=cap)return {...base,full:true};
 for(const [key,label,,size] of TIERS){
  const v=snap.variants[`${sku}-${key}`];
  if(!v||size!=null&&v.available<=0)continue;
  let left=size!=null?v.available:null;
  if(cap!=null)left=left!=null?Math.min(left,cap-paid-held):cap-paid-held;
  return {...base,full:false,tier:key,tierLabel:label,price:v.price,variantId:v.id,sku:`${sku}-${key}`,leftAtRate:size!=null?left:null,spotsLeft:cap!=null?cap-paid-held:null};
 }
 return {...base,full:true};
}

export async function publicOptions({gql,caps,now=new Date()}){
 const snap=await snapshot(gql,now);
 return {mode:'live',tiers:TIERS.map(([key,label,price])=>({key,label,price})),options:OPTIONS.map(o=>{const s=optionStatus(o,snap,caps,now);return {id:o.id,month:o.month,style:o.style,name:o.name,time:o.time,dates:o.dates,full:s.full,closed:s.closed,tier:s.tier,tierLabel:s.tierLabel,price:s.price,leftAtRate:s.leftAtRate,spotsLeft:s.spotsLeft};})};
}

export async function checkout({gql,caps,body,now=new Date()}){
 const ids=Array.isArray(body.options)?body.options:[];
 if(!ids.length||new Set(ids).size!==ids.length||ids.some(i=>!OPTION_BY_ID[i]))throw new SalsaError('Choose one or more intensives');
 const [name,email,phone]=['name','email','phone'].map(k=>String(body[k]??'').trim());
 if(!name||!email.includes('@')||phone.replace(/\D/g,'').length<10)throw new SalsaError('Please enter your name, email and mobile number');
 if(body.priorExperience!==true||body.separatePurchaseAck!==true)throw new SalsaError('Please confirm both checkboxes');
 const quoted=body.quoted||{};
 const snap=await snapshot(gql,now),lines=[],changed={};
 for(const id of ids){
  const s=optionStatus(OPTION_BY_ID[id],snap,caps,now);
  if(s.full){changed[id]={full:true,closed:s.closed};continue;}
  if(Number(quoted[id]??-1)!==s.price)changed[id]={price:s.price,tierLabel:s.tierLabel};
  lines.push(s);
 }
 if(Object.keys(changed).length)throw new SalsaError('Availability changed while you were registering. Please review the updated price.',409,{changed});
 const until=new Date(now.getTime()+HOLD_MINUTES*60000).toISOString();
 const customAttributes=[{key:'Dancer name',value:name},{key:'Mobile',value:phone},{key:'Prior Salsa experience',value:'Confirmed'},{key:'Separate-month purchase acknowledged',value:'Yes'}];
 const d=await gql(`mutation($input:DraftOrderInput!){draftOrderCreate(input:$input){draftOrder{id invoiceUrl} userErrors{field message}}}`,{input:{email,tags:[TAG],customAttributes,reserveInventoryUntil:until,note:'The Art of Salsa registration from rootsandwisdomstudio.com',lineItems:lines.map(s=>({variantId:s.variantId,quantity:1}))}});
 const res=d.draftOrderCreate;
 if(res.userErrors.length)throw new SalsaError('Shopify: '+res.userErrors.map(e=>e.message).join('; '),502);
 // Serverless functions can run side by side, so re-check stock after reserving: if two people took the
 // last spot at one rate in the same moment, the later draft is withdrawn and that dancer sees the new price.
 const after=(await snapshot(gql,now)).variants;
 if(lines.some(s=>after[s.sku]?.tracked&&after[s.sku].available<0)){
  await gql(`mutation($id:ID!){draftOrderDelete(input:{id:$id}){deletedId userErrors{message}}}`,{id:res.draftOrder.id});
  throw new SalsaError('Availability changed while you were registering. Please review the updated price.',409,{changed:Object.fromEntries(lines.filter(s=>after[s.sku]?.available<0).map(s=>[s.id,{stale:true}]))});
 }
 return {checkoutUrl:res.draftOrder.invoiceUrl,holdMinutes:HOLD_MINUTES};
}

export async function adminData({gql,caps,now=new Date()}){
 const snap=await snapshot(gql,now);
 const label=Object.fromEntries(OPTIONS.flatMap(o=>TIERS.map(([k,l])=>[`${o.sku}-${k}`,`${o.month.split(' ')[0]} ${o.style} · ${l}`])));
 return {mode:'live',holdMinutes:HOLD_MINUTES,
  options:OPTIONS.map(o=>({label:`${o.month} · ${o.style} ${o.name}`,...optionStatus(o,snap,caps,now),foundersLeft:snap.variants[`${o.sku}-FOUNDERS`]?.available,earlyLeft:snap.variants[`${o.sku}-EARLY`]?.available})),
  orders:snap.orders.map(o=>({...o,items:o.items.map(i=>({...i,label:label[i.sku]||i.sku}))}))};
}

export function validCapacity(optionId,capacity){
 if(!OPTION_BY_ID[optionId])throw new SalsaError('Unknown option');
 if(capacity!=null&&(!Number.isInteger(capacity)||capacity<1))throw new SalsaError('Capacity must be a whole number of 1 or more, or empty for no limit');
}
