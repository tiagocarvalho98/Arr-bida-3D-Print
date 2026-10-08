import {el,button,panel,table,toolbar,field,data,link,empty,actions,badge,date,owner} from '../ui/dom.mjs';
import {taskTable} from './tasks.mjs';
export function editClient(ctx,client={}){ctx.openDialog({title:client.id?'Editar cliente':'Novo cliente',body:el('div',{class:'form-grid'},field('Nome','name',client.name,{required:true,maxlength:120}),field('Tipo','type',client.type||'business',{choices:[['business','Empresa'],['person','Particular']]}),field('Contacto','contact',client.contact,{maxlength:120}),field('Cidade','city',client.city,{maxlength:100}),field('Loja / unidade','unit',client.unit,{maxlength:100}),field('Notas','notes',client.notes,{type:'textarea',maxlength:500})),onSave:form=>ctx.dispatch('client.save',{...data(form),id:client.id})});}
export function render(ctx){
  if(ctx.id)return clientProfile(ctx);
  const {state:s}=ctx,content=el('div');
  function draw(query=''){
    const rows=s.clients.filter(c=>`${c.name} ${c.contact} ${c.city}`.toLowerCase().includes(query.toLowerCase())).map(c=>[el('div',{},link(c.name,`#cliente/${c.id}`,'row-title'),el('p',{class:'small muted'},c.type==='business'?'Empresa':'Particular')),c.city||'—',c.contact||'—',String(s.orders.filter(o=>o.clientId===c.id).length),actions(link('Abrir ficha',`#cliente/${c.id}`,'btn secondary'),button('Editar',()=>editClient(ctx,c),'ghost'))]);
    content.replaceChildren(rows.length?table(['Cliente','Cidade','Contacto','Projetos','Ações'],rows):empty('Nenhum cliente corresponde à pesquisa.'));
  }
  draw();return el('div',{},toolbar('Pesquisar clientes',draw,[button('+ Novo cliente',()=>editClient(ctx))]),panel('Clientes e projetos',content));
}
function clientProfile(ctx){
  const {state:s}=ctx,c=s.clients.find(c=>c.id===ctx.id);
  if(!c)return empty('Cliente não encontrado.',link('Voltar aos clientes','#clientes','btn secondary'));
  const projects=s.orders.filter(o=>o.clientId===c.id);
  const project=o=>{
    const ids=new Set(s.jobs.filter(j=>j.orderId===o.id).map(j=>j.id)),tasks=s.tasks.filter(t=>ids.has(t.jobId));
    const details=el('details',{class:'client-project'},el('summary',{},el('span',{},el('strong',{},o.title),el('span',{class:'small muted'},`${date(o.dueDate)} · ${tasks.length} tarefas · ${owner(s,o.assigneeId)}`)),badge(o.status)),el('div',{class:'client-project-body'},link('Abrir projeto e histórico',`#encomenda/${o.id}`,'btn secondary'),el('h3',{},'Tarefas por estado'),taskTable(ctx,tasks,{readOnly:true})));
    return details;
  };
  const active=projects.filter(o=>!['delivered','cancelled'].includes(o.status)),archived=projects.filter(o=>['delivered','cancelled'].includes(o.status));
  return el('div',{class:'stack'},link('← Clientes','#clientes','text-link'),el('div',{class:'order-banner'},el('div',{},el('p',{class:'eyebrow'},'Ficha de cliente'),el('h2',{},c.name),el('p',{class:'muted'},[c.city,c.contact,c.unit].filter(Boolean).join(' · '))),button('Editar cliente',()=>editClient(ctx,c),'secondary')),c.notes?el('p',{class:'notice'},c.notes):null,panel(`Projetos ativos · ${active.length}`,active.length?active.map(project):empty('Sem projetos ativos.')),panel(`Histórico de projetos · ${archived.length}`,archived.length?archived.map(project):empty('Os projetos entregues e cancelados ficam aqui.')));
}
