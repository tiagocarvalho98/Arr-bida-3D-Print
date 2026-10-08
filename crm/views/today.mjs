import {el,link,badge,panel,date,empty} from '../ui/dom.mjs';
import {selectToday} from '../domain/selectors.mjs';
import {localDate,ORDER_STATES} from '../domain/model.mjs';
import {icon} from '../ui/icons.mjs';
import {reveal} from '../ui/motion.mjs';

export function render({state:s,now}) {
  const summary=selectToday(s,localDate(now()));
  const stages=['new','quote','approval','production','ready'];
  let selected=summary.activeOrders.find(o=>o.status==='production')||summary.activeOrders[0];
  let filter='all';
  const inspector=el('section',{class:'production-inspector','aria-label':'Encomenda selecionada'});
  const canvas=el('div',{class:'production-flow'});
  const filters=el('div',{class:'stage-filters','aria-label':'Filtrar encomendas por fase'});
  const detail=()=>{
    if(!selected){inspector.replaceChildren(empty('Sem encomendas nesta fase.'));return;}
    const jobs=s.jobs.filter(j=>j.orderId===selected.id);
    const ids=new Set(jobs.map(j=>j.id));
    const tasks=s.tasks.filter(t=>ids.has(t.jobId));
    const done=tasks.filter(t=>t.status==='done').length;
    const reservations=s.reservations.filter(r=>ids.has(r.jobId));
    const grams=reservations.reduce((n,r)=>n+r.grams,0);
    const client=s.clients.find(c=>c.id===selected.clientId);
    inspector.replaceChildren(
      el('div',{class:'inspector-kicker'},icon('pipeline'),'EM FOCO',badge(selected.status)),
      el('h3',{},selected.title),el('p',{class:'muted'},client?.name||'Sem cliente'),
      el('div',{class:'object-preview','aria-hidden':'true'},el('div',{class:'print-object'},el('span',{},'ARRÁ'),el('span',{},'BIDA'))),
      el('div',{class:'inspector-facts'},el('div',{},el('span',{},'Entrega prevista'),el('strong',{},date(selected.dueDate))),el('div',{},el('span',{},'Personalização'),el('strong',{},selected.artRequired?(selected.artApproved?'Arte aprovada':'Por aprovar'):'Sem aprovação'))),
      el('div',{class:'production-gauges'},el('div',{},el('span',{class:'muted'},'Tarefas concluídas'),el('strong',{},`${done}`,el('small',{},` / ${tasks.length}`)),el('progress',{value:done,max:Math.max(1,tasks.length),'aria-label':'Tarefas concluídas'})),el('div',{},el('span',{class:'muted'},'Filamento reservado'),el('strong',{},grams,el('small',{},' g')),el('span',{class:'material-note'},reservations.length?reservations.map(r=>{const l=s.lots.find(l=>l.id===r.lotId);return `${l?.material} · ${l?.color}`;}).join(', '):'Sem reserva'))),
      link(el('span',{},'Abrir encomenda',icon('arrow')),`#encomenda/${selected.id}`,'btn primary inspector-link')
    );
  };
  const draw=()=>{
    const visible=filter==='all'?stages:[filter];
    canvas.replaceChildren(...visible.map((stage,i)=>{
      const orders=summary.activeOrders.filter(o=>o.status===stage);
      return el('section',{class:`flow-lane lane-${stage}`},el('div',{class:'lane-heading'},el('span',{class:'lane-dot'}),el('h3',{},ORDER_STATES[stage]),el('span',{class:'count'},orders.length)),
        el('div',{class:'lane-track'},...orders.map(o=>el('button',{type:'button',class:`flow-order ${selected?.id===o.id?'is-selected':''}`,'aria-pressed':String(selected?.id===o.id),'data-order':o.id,onclick:e=>{const focused=document.activeElement===e.currentTarget;selected=o;draw();detail();if(focused)Array.from(canvas.querySelectorAll('button')).find(b=>b.dataset.order===o.id)?.focus({preventScroll:true});reveal(inspector);}},
          el('span',{class:'flow-order-icon'},icon(o.status==='ready'?'check':'catalogo')),
          el('strong',{},o.title),el('span',{class:'flow-client'},s.clients.find(c=>c.id===o.clientId)?.name),el('span',{class:'flow-date'},icon('clock'),date(o.dueDate)))),orders.length?null:el('p',{class:'lane-empty'},'Sem encomendas')));
    }));
    filters.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.stage===filter)));
  };
  for(const [value,label] of [['all','Todas'],...stages.map(k=>[k,ORDER_STATES[k]])]){
    filters.append(el('button',{type:'button','data-stage':value,'aria-pressed':String(value===filter),onclick:()=>{filter=value;const candidates=summary.activeOrders.filter(o=>value==='all'||o.status===value);if(!candidates.some(o=>o.id===selected?.id))selected=candidates[0];draw();detail();reveal(canvas);}},label,el('span',{},value==='all'?summary.activeOrders.length:summary.activeOrders.filter(o=>o.status===value).length)));
  }
  draw();detail();
  const stats=[['Encomendas',summary.activeOrders.length,'pipeline'],['Tarefas',summary.openTasks.length,'tarefas'],['Aprovações',summary.approvals.length,'pipeline'],['Stock baixo',summary.lowStock.length,'filamentos']].map(([label,n,key])=>link(el('span',{},icon(key),label),`#${key}`,'status-chip'));
  stats.forEach((node,i)=>node.append(el('strong',{},[summary.activeOrders.length,summary.openTasks.length,summary.approvals.length,summary.lowStock.length][i])));
  return el('div',{class:'operations-view'},el('div',{class:'status-strip'},...stats,el('span',{class:'studio-status'},el('i',{}),'Estúdio · demonstração')),
    el('div',{class:'operations-heading'},el('div',{},el('h2',{},'O teu estúdio, em movimento.'),el('p',{class:'muted'},'Da primeira ideia à peça pronta. Tudo à vista.')),link(el('span',{},'Ver pipeline',icon('arrow')),'#pipeline','btn secondary')),
    el('div',{class:'operations-toolbar'},filters,el('span',{class:'muted small'},'Seleciona uma encomenda para explorar')),
    el('div',{class:'operations-stage'},inspector,el('section',{class:'flow-space','aria-label':'Produção por fase'},el('div',{class:'flow-space-heading'},el('span',{},'Fluxo de produção'),el('span',{class:'muted'},`${summary.activeOrders.length} encomendas ativas`)),canvas,el('div',{class:'flow-legend'},el('span',{},el('i',{}),'Seleção atual'),el('span',{},'Dados locais · sem telemetria de impressoras')))),
    el('div',{class:'operations-bottom'},panel('Próximas entregas',summary.upcoming.length?summary.upcoming.slice(0,3).map(o=>el('div',{class:'work-row'},link(o.title,`#encomenda/${o.id}`,'row-title'),badge(o.status),el('span',{class:'date'},date(o.dueDate)))):empty()),
      panel('Na tua lista',summary.openTasks.length?summary.openTasks.slice(0,3).map(t=>el('div',{class:'task-row'},el('span',{class:`task-dot ${t.status}`}),el('div',{},link(t.title,`#encomenda/${s.jobs.find(j=>j.id===t.jobId)?.orderId}`,'row-title')),badge(t.status))):empty('Tudo em dia.')),
      panel('Material a acompanhar',summary.lowStock.length?summary.lowStock.map(l=>link(el('div',{class:'alert-row'},el('span',{},`${l.material} · ${l.color}`),el('span',{},'Ver stock',icon('arrow'))),'#filamentos')):empty('Stock sem alertas.'))));
}
