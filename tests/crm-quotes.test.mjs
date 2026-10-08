import test from 'node:test';import assert from 'node:assert/strict';
import {createDemoState} from '../crm/data/fixtures.mjs';import {selectQuotes} from '../crm/domain/quotes.mjs';
test('only orders currently in quotation appear, regardless of head',()=>{
 const s=createDemoState();s.orders[0].status='new';s.orders[0].pricingMode='quote';
 assert.deepEqual(selectQuotes(s).map(o=>o.id),['order-4']);
 s.orders[0].status='accepted';assert.deepEqual(selectQuotes(s).map(o=>o.id),['order-4']);
 s.orders[0].status='quote';s.orders[0].assigneeId=null;assert.deepEqual(selectQuotes(s).map(o=>o.id),['order-1','order-4']);
 assert.equal(selectQuotes(s,'Empresa exemplo A').length,1);
 s.orders[0].status='cancelled';s.orders[3].status='production';assert.equal(selectQuotes(s).length,0);
});
