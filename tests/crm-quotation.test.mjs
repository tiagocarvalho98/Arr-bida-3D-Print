import test from 'node:test';import assert from 'node:assert/strict';
import {createDemoState} from '../crm/data/fixtures.mjs';import {applyCommand} from '../crm/domain/commands.mjs';import {validateState} from '../crm/domain/model.mjs';import {getLotBalance} from '../crm/domain/inventory.mjs';
let sequence=0;const run=(s,type,payload)=>applyCommand(s,{id:`quotation-${++sequence}`,type,payload,actorId:'user-demo',at:'2026-10-08T12:00:00Z'});
const input={id:'order-4',lotId:'lot-1',grams:100,hours:1,minutes:30,hourlyRateMilliEuro:10000,finalMilliEuro:45000};
test('estimate snapshots material and time, never changes stock; approval advances',()=>{
 const s=createDemoState(),balance=getLotBalance(s,'lot-1');const r=run(s,'quote.submit',input);assert.equal(r.ok,true);
 const q=r.state.orders[3].quotation;assert.equal(q.materialMilliEuro,2000);assert.equal(q.timeMilliEuro,15000);assert.equal(q.finalMilliEuro,45000);assert.equal(q.status,'pending');
 assert.deepEqual(getLotBalance(r.state,'lot-1'),balance);assert.deepEqual(r.state.reservations,s.reservations);assert.deepEqual(r.state.movements,s.movements);
 assert.equal(run(r.state,'order.transition',{id:'order-4',status:'approval'}).ok,false);
 const approved=run(r.state,'quote.approve',{id:'order-4'});assert.equal(approved.ok,true);assert.equal(approved.state.orders[3].status,'approval');assert.equal(approved.state.orders[3].quotation.status,'approved');
 assert.equal(run(approved.state,'quote.approve',{id:'order-4'}).ok,false);
 assert.equal(validateState(JSON.parse(JSON.stringify(approved.state))).ok,true);
});
test('invalid amounts, duration, grams and exhausted lots are rejected atomically',()=>{
 const s=createDemoState();for(const change of [{grams:0},{grams:100000},{minutes:60},{hours:-1},{hours:0,minutes:0},{hourlyRateMilliEuro:NaN},{finalMilliEuro:-1},{finalMilliEuro:0},{lotId:'missing'}])assert.equal(run(s,'quote.submit',{...input,...change}).ok,false);
 assert.equal(s.orders[3].quotation,undefined);
});
test('approval needs submitted estimate, only quoting orders can submit',()=>{
 const s=createDemoState();assert.equal(run(s,'quote.approve',{id:'order-4'}).ok,false);assert.equal(run(s,'quote.submit',{...input,id:'order-3'}).ok,false);
});
test('catalog-priced pending orders cannot enter quotation when accepted',()=>{
 const s=createDemoState();const r=run(s,'order.accept',{id:'order-3',steps:['quote','production','ready']});assert.equal(r.ok,true);assert.equal(r.state.orders[2].route.includes('quote'),false);assert.equal(r.state.orders[2].pricingMode,'known');
});
test('custom and mixed orders retain quotation option; approval follows selected route',()=>{
 const s=createDemoState();const o=s.orders[2];o.lines=[structuredClone(s.orders[1].lines[0]),...o.lines];
 let r=run(s,'order.accept',{id:o.id,steps:['quote','ready']});assert.equal(r.ok,true);assert.equal(r.state.orders[2].route.includes('quote'),true);
 r=run(r.state,'order.transition',{id:o.id,status:'quote'});r=run(r.state,'quote.submit',{...input,id:o.id});r=run(r.state,'quote.approve',{id:o.id});assert.equal(r.ok,true);assert.equal(r.state.orders[2].status,'ready');
});
test('editing approved lines is rejected and pending estimate invalidated on line edits',()=>{
 let r=run(createDemoState(),'quote.submit',input);let o=r.state.orders[3];const edited={...o,lines:structuredClone(o.lines)};edited.lines[0].configuration.quantity='5';
 const changed=run(r.state,'order.save',edited);assert.equal(changed.ok,true);assert.equal(changed.state.orders[3].quotation,undefined);
 r=run(r.state,'quote.approve',{id:o.id});assert.equal(run(r.state,'order.save',edited).ok,false);
});
test('historical cost is stable and tampered totals are rejected',()=>{
 const r=run(createDemoState(),'quote.submit',input);r.state.lots[0].purchaseCostMilliEuro=40000;assert.equal(validateState(r.state).ok,true);assert.equal(r.state.orders[3].quotation.materialMilliEuro,2000);
 r.state.orders[3].quotation.timeMilliEuro=1;assert.equal(validateState(r.state).ok,false);
});
test('metadata-only edits preserve pending and approved estimates on legacy line IDs',()=>{
 let r=run(createDemoState(),'quote.submit',input);let o=r.state.orders[3];
 const edit=run(r.state,'order.save',{...o,notes:'Updated note'});assert.equal(edit.ok,true);assert.deepEqual(edit.state.orders[3].quotation,o.quotation);
 r=run(r.state,'quote.approve',{id:o.id});o=r.state.orders[3];
 const approvedEdit=run(r.state,'order.save',{...o,notes:'Updated approved note'});assert.equal(approvedEdit.ok,true);assert.deepEqual(approvedEdit.state.orders[3].quotation,o.quotation);
});
