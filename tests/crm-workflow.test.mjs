import test from 'node:test';
import assert from 'node:assert/strict';
import {createDemoState} from '../crm/data/fixtures.mjs';
import {applyCommand,transitionOptions} from '../crm/domain/commands.mjs';
import {validateState} from '../crm/domain/model.mjs';
let sequence=0;
const run=(s,type,payload)=>applyCommand(s,{id:`route-test-${++sequence}`,type,payload,actorId:'user-demo',at:new Date().toISOString()});
const accept=(steps)=>{const s=createDemoState();return run(s,'order.accept',{id:'order-3',steps});};
test('acceptance required and only selected steps available',()=>{
 const s=createDemoState();assert.deepEqual(transitionOptions(s.orders[2]),['cancelled']);
 assert.equal(run(s,'order.transition',{id:'order-3',status:'production'}).ok,false);
 const r=accept(['production']);assert.equal(r.ok,true);const o=r.state.orders[2];
 assert.equal(o.status,'accepted');assert.equal(o.acceptedBy,'user-demo');
 assert.deepEqual(o.route,['accepted','production','delivered']);assert.equal(o.artRequired,false);
 assert.deepEqual(transitionOptions(o),['production','cancelled']);
 assert.equal(run(r.state,'order.transition',{id:o.id,status:'approval'}).ok,false);
 assert.equal(run(r.state,'order.accept',{id:o.id,steps:[]}).ok,false);
});
test('production cannot be bypassed by omitting ready',()=>{
 let r=accept(['production']);r=run(r.state,'order.transition',{id:'order-3',status:'production'});assert.equal(r.ok,true);
 assert.equal(run(r.state,'order.transition',{id:'order-3',status:'delivered'}).ok,false);
 r=run(r.state,'job.start',{jobId:'job-3',reservations:[]});assert.equal(r.ok,true);
 r=run(r.state,'job.confirmConsumption',{jobId:'job-3',consumptions:[],outcome:'completed'});assert.equal(r.ok,true);
 r=run(r.state,'order.transition',{id:'order-3',status:'delivered'});assert.equal(r.ok,true);
});
test('no production route can go directly to ready then delivered',()=>{
 let r=accept(['ready']);r=run(r.state,'order.transition',{id:'order-3',status:'ready'});assert.equal(r.ok,true);
 r=run(r.state,'order.transition',{id:'order-3',status:'delivered'});assert.equal(r.ok,true);
 assert.equal(validateState(JSON.parse(JSON.stringify(r.state))).ok,true);
});
test('selected approval cannot be bypassed even without production',()=>{
 let r=accept(['approval']);r=run(r.state,'order.transition',{id:'order-3',status:'approval'});assert.equal(r.ok,true);
 assert.equal(run(r.state,'order.transition',{id:'order-3',status:'delivered'}).ok,false);
 r=run(r.state,'order.approveArt',{id:'order-3'});r=run(r.state,'order.transition',{id:'order-3',status:'delivered'});assert.equal(r.ok,true);
});
test('invalid routes rejected; existing in-progress projects preserved',()=>{
 assert.equal(accept(['unknown']).ok,false);assert.equal(accept(['quote','quote']).ok,false);
 assert.deepEqual(transitionOptions(createDemoState().orders[1]),['ready','cancelled']);
 const r=accept([]);assert.equal(r.ok,true);r.state.orders[2].route=['accepted','bad','delivered'];assert.equal(validateState(r.state).ok,false);
});
