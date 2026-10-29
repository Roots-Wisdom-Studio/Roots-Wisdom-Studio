import test from 'node:test';
import assert from 'node:assert/strict';
import { OPTIONS, optionStatus, publicOptions, checkout, SalsaError } from '../server/salsa.mjs';

const before=new Date('2026-11-01T12:00:00-08:00');
function fakeShopify({founders=4,early=4,raceAfterCreate=false}={}){
 const stock={};for(const o of OPTIONS){stock[o.sku+'-FOUNDERS']=founders;stock[o.sku+'-EARLY']=early;}
 const calls=[];let created=0;
 const gql=async(query,variables)=>{
  calls.push({query,variables});
  if(query.includes('draftOrderCreate')){created++;for(const li of variables.input.lineItems){const sku=li.variantId.replace('gid://v/','');stock[sku]-=raceAfterCreate?2:1;}return {draftOrderCreate:{draftOrder:{id:'gid://d/1',invoiceUrl:'https://shop.example/invoice/1'},userErrors:[]}};}
  if(query.includes('draftOrderDelete'))return {draftOrderDelete:{deletedId:'gid://d/1',userErrors:[]}};
  return {productVariants:{nodes:OPTIONS.flatMap(o=>[['FOUNDERS',195,true],['EARLY',225,true],['REGULAR',250,false]].map(([k,p,t])=>({id:'gid://v/'+o.sku+'-'+k,sku:o.sku+'-'+k,price:String(p),inventoryItem:{tracked:t,inventoryLevels:{nodes:[{quantities:[{name:'available',quantity:t?stock[o.sku+'-'+k]:0}]}]}}})))},draftOrders:{nodes:[]},orders:{nodes:[]}};
 };
 return {gql,calls,get created(){return created;}};
}
const body={options:['nov-on1'],name:'Test Dancer',email:'t@example.com',phone:'925 555 0100',priorExperience:true,separatePurchaseAck:true,quoted:{'nov-on1':195}};

test('sells the cheapest tier that still has spots',async()=>{
 assert.equal((await publicOptions({gql:fakeShopify().gql,caps:{},now:before})).options[0].price,195);
 assert.equal((await publicOptions({gql:fakeShopify({founders:0}).gql,caps:{},now:before})).options[0].price,225);
 assert.equal((await publicOptions({gql:fakeShopify({founders:0,early:0}).gql,caps:{},now:before})).options[0].price,250);
});

test('registration closes when the first class starts',()=>{
 const snap={variants:{'AOS-NOV26-ON1-REGULAR':{id:'v',price:250,tracked:false,available:0}},holds:{},orders:[]};
 assert.equal(optionStatus(OPTIONS[0],snap,{},new Date('2026-11-09T18:29:00-08:00')).closed,false);
 assert.equal(optionStatus(OPTIONS[0],snap,{},new Date('2026-11-09T18:30:00-08:00')).full,true);
 assert.equal(optionStatus(OPTIONS[2],snap,{},new Date('2026-11-09T18:30:00-08:00')).closed,false);
});

test('rejects a stale or tampered price with the current one',async()=>{
 const shop=fakeShopify({founders:0});
 await assert.rejects(checkout({gql:shop.gql,caps:{},body,now:before}),e=>e instanceof SalsaError&&e.status===409&&e.extra.changed['nov-on1'].price===225);
 assert.equal(shop.created,0);
});

test('requires both confirmations',async()=>{
 await assert.rejects(checkout({gql:fakeShopify().gql,caps:{},body:{...body,priorExperience:false},now:before}),/both checkboxes/);
});

test('creates a tagged draft order that reserves the spot',async()=>{
 const shop=fakeShopify();
 const res=await checkout({gql:shop.gql,caps:{},body,now:before});
 assert.equal(res.checkoutUrl,'https://shop.example/invoice/1');
 const input=shop.calls.find(c=>c.query.includes('draftOrderCreate')).variables.input;
 assert.deepEqual(input.tags,['art-of-salsa']);
 assert.equal(input.reserveInventoryUntil,new Date(before.getTime()+600000).toISOString());
});

test('withdraws the draft when a simultaneous checkout took the last spot',async()=>{
 const shop=fakeShopify({founders:1,raceAfterCreate:true});
 await assert.rejects(checkout({gql:shop.gql,caps:{},body,now:before}),e=>e.status===409);
 assert.ok(shop.calls.some(c=>c.query.includes('draftOrderDelete')));
});

test('test-mode and cancelled orders do not count as paid registrations',()=>{
 const item={sku:'AOS-NOV26-ON1-FOUNDERS',qty:1,price:195};
 const snap={variants:{'AOS-NOV26-ON1-REGULAR':{id:'v',price:250,tracked:false,available:0}},holds:{},orders:[
  {status:'PAID',test:true,cancelled:false,items:[item]},{status:'PAID',test:false,cancelled:true,items:[item]},{status:'PAID',test:false,cancelled:false,items:[item]}]};
 assert.equal(optionStatus(OPTIONS[0],snap,{},before).paid,1);
});

test('a capacity limit closes the series',async()=>{
 const out=await publicOptions({gql:fakeShopify().gql,caps:{'nov-on1':0},now:before});
 assert.equal(out.options[0].full,true);
});
