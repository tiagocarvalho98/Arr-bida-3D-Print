import {validateState} from '../crm/domain/model.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import {createDemoState} from '../crm/data/fixtures.mjs';import {selectToday} from '../crm/domain/selectors.mjs';
test('today is not overdue, yesterday is; completed tasks disappear',()=>{const s=createDemoState(new Date('2026-10-08T10:00:00Z'));s.tasks=[{id:'a',title:'A',status:'pending',dueDate:'2026-10-08'},{id:'b',title:'B',status:'pending',dueDate:'2026-10-07'}];let view=selectToday(s,'2026-10-08');assert.equal(view.overdueTasks.length,1);assert.equal(view.openTasks.length,2);s.tasks[1].status='done';view=selectToday(s,'2026-10-08');assert.equal(view.overdueTasks.length,0);assert.equal(view.openTasks.length,1);});

test('delivered project keeps tasks in state but removes them from active work',()=>{
  const s=createDemoState(new Date('2026-10-08T10:00:00Z'));
  const task=s.tasks.find(t=>t.jobId==='job-2');
  s.orders.find(o=>o.id==='order-2').status='delivered';
  const view=selectToday(s,'2026-10-08');
  assert.equal(view.openTasks.some(t=>t.id===task.id),false);
  assert.equal(view.activeOrders.some(o=>o.id==='order-2'),false);
  assert.equal(s.tasks.find(t=>t.id===task.id),task);
});

test('multiple assignees persist while the demo login remains available',()=>{
  const s=createDemoState(new Date('2026-10-08T10:00:00Z'));
  s.users.push({id:'partner',name:'Sócio',role:'admin'});
  s.tasks[0].assigneeId='partner';
  assert.equal(validateState(JSON.parse(JSON.stringify(s))).ok,true);
  assert.equal(selectToday(s,'2026-10-08').openTasks.find(t=>t.id===s.tasks[0].id).assigneeId,'partner');
});
