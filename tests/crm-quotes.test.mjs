import test from 'node:test';import assert from 'node:assert/strict';
import {createDemoState} from '../crm/data/fixtures.mjs';import {selectQuotes} from '../crm/domain/quotes.mjs';
test('quote workspace includes all heads and excludes projects beyond quotation',()=>{
 const s=createDemoState();s.orders[0].status='new';s.orders[0].pricingMode='quote';s.orders[0].assigneeId=null;
 assert.deepEqual(selectQuotes(s).map(o=>o.id),['order-1','order-4']);
 s.orders[3].status='production';assert.deepEqual(selectQuotes(s).map(o=>o.id),['order-1']);
 assert.equal(selectQuotes(s,'Empresa exemplo A').length,1);
 s.orders[0].status='cancelled';assert.equal(selectQuotes(s).length,0);
});
