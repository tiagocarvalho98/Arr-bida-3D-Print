import {el,toolbar,field,badge,date,owner,empty} from '../ui/dom.mjs';
import {ORDER_STATES,TASK_STATES} from '../domain/model.mjs';
import {orderRoute} from '../domain/workflow.mjs';
import {products} from '../../scripts/products.mjs';
export function orderInformation(ctx,o){
 const s=ctx.state,client=s.clients.find(c=>c.id===o.clientId),jobs=s.jobs.filter(j=>j.orderId===o.id),tasks=s.tasks.filter(t=>jobs.some(j=>j.id===t.jobId));
 const fact=(label,value)=>[el('dt',{},label),el('dd',{},value||'Não indicado')];
 const route=orderRoute(o);
 ctx.openDialog({title:o.title,wide:true,body:el('div',{class:'stack order-information'},el('p',{class:'muted small'},'Consulta da encomenda'),el('dl',{class:'details'},...fact('Estado',badge(o.status)),...fact('Cliente',client?.name),...fact('Contacto',client?.contact),...fact('Cidade',client?.city),...fact('Head do trabalho',owner(s,o.assigneeId)),...fact('Prazo',date(o.dueDate)),...fact('Percurso',route.length?route.map(k=>ORDER_STATES[k]).join(' → '):'Por definir na aceitação'),...fact('Aceite por',o.acceptedBy?owner(s,o.acceptedBy):o.status==='new'?'Por aceitar':'Registo anterior à aceitação por colaborador'),...fact('Notas',o.notes)),el('section',{},el('h3',{},'Produtos e personalização'),...o.lines.map(l=>{const product=products.find(p=>p.id===l.productId);return el('div',{class:'information-product'},el('strong',{},product?.name||l.productId),el('dl',{class:'details'},...(product?.fields||[]).filter(f=>l.configuration[f.name]!==undefined&&l.configuration[f.name]!=='').flatMap(f=>fact(f.label,String(l.configuration[f.name])))));})),el('section',{},el('h3',{},'Tarefas do projeto'),tasks.length?el('ul',{class:'information-tasks'},...tasks.map(t=>el('li',{},el('div',{},el('strong',{},t.title),el('p',{class:'muted small'},`${owner(s,t.assigneeId)} · ${date(t.dueDate)}`)),badge(t.status)))):el('p',{class:'muted'},'Sem tarefas.')))});
}
export function render(ctx){
 const s=ctx.state,list=el('div',{class:'orders-directory'});let query='',status='';
 const draw=()=>{
  const orders=s.orders.filter(o=>(!status||o.status===status)&&`${o.title} ${s.clients.find(c=>c.id===o.clientId)?.name||''} ${owner(s,o.assigneeId)}`.toLocaleLowerCase('pt-PT').includes(query.toLocaleLowerCase('pt-PT')));
  list.replaceChildren(orders.length?el('ul',{class:'orders-directory-list'},...orders.map(o=>el('li',{},el('button',{type:'button',class:'order-directory-row',onclick:()=>orderInformation(ctx,o),'aria-label':`Consultar ${o.title}`},el('span',{class:'directory-project'},el('strong',{},o.title),el('span',{class:'muted small'},s.clients.find(c=>c.id===o.clientId)?.name||'Cliente')),el('span',{class:'directory-head'},el('small',{},'Head'),el('span',{},owner(s,o.assigneeId))),el('span',{class:'directory-date'},el('small',{},'Prazo'),el('span',{},date(o.dueDate))),badge(o.status),el('span',{class:'directory-arrow','aria-hidden':'true'},'↗'))))):empty('Nenhuma encomenda nesta seleção.'));
 };
 const filter=field('Estado','directory-status','',{choices:[['','Todos os estados'],...Object.entries(ORDER_STATES)]});filter.querySelector('select').addEventListener('change',e=>{status=e.target.value;draw();});draw();
 return el('div',{class:'stack'},el('p',{class:'muted'},'Todas as encomendas, incluindo entregues e canceladas. Seleciona uma para consultar os detalhes.'),toolbar('Pesquisar encomenda, cliente ou head',q=>{query=q;draw();},[filter]),list);
}
