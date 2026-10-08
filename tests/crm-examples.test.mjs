import test from 'node:test';
import assert from 'node:assert/strict';
import {createDemoState} from '../crm/data/fixtures.mjs';
import {addExampleTasks} from '../crm/data/example-tasks.mjs';
import {validateState} from '../crm/domain/model.mjs';
test('requested examples preserve edits and are inserted once',()=>{
 const s=createDemoState();s.tasks[0].title='Título existente';s.tasks[0].status='done';
 const next=addExampleTasks(s);
 assert.equal(next.tasks.length,s.tasks.length+8);
 assert.deepEqual(next.tasks.slice(0,s.tasks.length),s.tasks);
 assert.equal(next.users.length,2);
 assert.equal(validateState(next).ok,true);
 assert.equal(addExampleTasks(next),next);
 assert.equal(s.users.length,1);
});
test('examples do not attach tasks to archived projects',()=>{
 const s=createDemoState();s.orders.forEach(o=>o.status='delivered');
 assert.equal(addExampleTasks(s),s);
});
