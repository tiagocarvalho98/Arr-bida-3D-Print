import {el,button,panel,table,toolbar,field,data,link,empty,badge,date,owner,actions} from '../ui/dom.mjs';
import {selectToday} from '../domain/selectors.mjs';
import {localDate} from '../domain/model.mjs';
export function editTask(ctx,task={}){
  const jobs=ctx.state.jobs.filter(j=>j.id===task.jobId||!['delivered','cancelled'].includes(ctx.state.orders.find(o=>o.id===j.orderId)?.status));
  ctx.openDialog({title:task.id?'Editar tarefa':'Nova tarefa',body:el('div',{class:'form-grid'},field('Título','title',task.title,{required:true,maxlength:120}),field('Projeto / trabalho','jobId',task.jobId||jobs[0]?.id,{choices:jobs.map(j=>[j.id,j.title]),required:true}),field('Prazo','dueDate',task.dueDate,{type:'date'}),field('Responsável','assigneeId',task.assigneeId||'',{choices:[['','Sem responsável'],...ctx.state.users.map(u=>[u.id,u.name])]})),onSave:form=>ctx.dispatch('task.save',{...data(form),id:task.id})});
}
export function taskTable(ctx,tasks,{readOnly=false}={}){
  const s=ctx.state;
  return tasks.length?table(['Tarefa','Projeto','Prazo','Responsável','Estado',...(readOnly?[]:['Ações'])],tasks.map(t=>{
    const j=s.jobs.find(j=>j.id===t.jobId),o=s.orders.find(o=>o.id===j?.orderId);
    return [el('strong',{},t.title),link(o?.title||'Projeto',`#encomenda/${j?.orderId}`),date(t.dueDate),owner(s,t.assigneeId),badge(t.status),...(readOnly?[]:[actions(button(t.status==='done'?'Reabrir':'Concluir',()=>ctx.dispatch('task.transition',{id:t.id,status:t.status==='done'?'pending':'done'}),'secondary'),t.status==='pending'?button('Iniciar',()=>ctx.dispatch('task.transition',{id:t.id,status:'active'}),'ghost'):t.status==='active'?button('Em pedido',()=>ctx.dispatch('task.transition',{id:t.id,status:'pending'}),'ghost'):null,button('Editar',()=>editTask(ctx,t),'ghost'))])];
  })):empty('Sem tarefas nesta seleção.');
}
export function render(ctx){
  const content=el('div',{class:'stack task-groups'});let query='',status='';
  const draw=()=>{
    const tasks=selectToday(ctx.state,localDate(ctx.now())).openTasks.filter(t=>{
      const j=ctx.state.jobs.find(j=>j.id===t.jobId),o=ctx.state.orders.find(o=>o.id===j?.orderId);
      return (!status||t.status===status)&&`${t.title} ${o?.title||''} ${owner(ctx.state,t.assigneeId)}`.toLowerCase().includes(query.toLowerCase());
    });
    content.replaceChildren(...[...ctx.state.users,{id:null,name:'Sem responsável'}].map(u=>{
      const assigned=tasks.filter(t=>(t.assigneeId||null)===u.id);
      return panel(`${u.name} · ${assigned.length}`,taskTable(ctx,assigned));
    }));
  };
  const filter=field('Estado','task-filter','',{choices:[['','Todas as abertas'],['pending','Em pedido'],['active','Em curso']]});
  filter.querySelector('select').addEventListener('change',e=>{status=e.target.value;draw();});draw();
  return el('div',{},toolbar('Pesquisar tarefa, projeto ou responsável',q=>{query=q;draw();},[filter,button('+ Nova tarefa',()=>editTask(ctx))]),el('p',{class:'muted small task-help'},'As tarefas concluídas ficam no histórico do respetivo projeto. Projetos entregues deixam esta lista.'),content);
}
