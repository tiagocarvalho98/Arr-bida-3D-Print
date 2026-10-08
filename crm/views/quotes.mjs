import {el,toolbar,link,badge,date,owner,empty} from '../ui/dom.mjs';
import {icon} from '../ui/icons.mjs';
import {selectQuotes} from '../domain/quotes.mjs';

export function render(ctx){
  const s=ctx.state,grid=el('div',{class:'quotes-grid'}),count=el('p',{class:'muted small','aria-live':'polite'});
  const draw=(query='')=>{
    const orders=selectQuotes(s,query);count.textContent=`${orders.length} ${orders.length===1?'projeto em orçamentação':'projetos em orçamentação'}`;
    grid.replaceChildren(...orders.map(o=>{
      const client=s.clients.find(c=>c.id===o.clientId),jobs=s.jobs.filter(j=>j.orderId===o.id),tasks=s.tasks.filter(t=>jobs.some(j=>j.id===t.jobId));
      const head=o.assigneeId?owner(s,o.assigneeId):'Por atribuir';
      return el('article',{class:'quote-card'},el('div',{class:'quote-card-top'},el('span',{class:'quote-icon'},icon('orcamentos')),badge(o.status)),el('p',{class:'small muted'},client?.name||'Cliente'),el('h2',{},link(o.title,`#encomenda/${o.id}`)),el('p',{class:'quote-description muted'},o.notes||'Orçamento a preparar para este projeto.'),el('dl',{class:'quote-facts'},el('dt',{},'Prazo'),el('dd',{},date(o.dueDate)),el('dt',{},'Tarefas'),el('dd',{},`${tasks.filter(t=>t.status==='done').length} de ${tasks.length} concluídas`)),el('div',{class:'quote-card-bottom'},el('div',{},el('span',{class:'small muted'},'Head do trabalho'),el('strong',{},head)),link('Abrir projeto',`#encomenda/${o.id}`,'btn secondary')));
    }));
    if(!orders.length)grid.append(empty('Sem projetos em orçamentação nesta seleção.'));
  };
  draw();
  return el('div',{class:'stack'},el('div',{class:'operations-heading'},el('div',{},el('h2',{},'Dar forma ao próximo trabalho.'),el('p',{class:'muted'},'Orçamentos da equipa. O head coordena; todos os colaboradores podem consultar.'))),toolbar('Pesquisar projeto, cliente ou head',draw),count,grid);
}
