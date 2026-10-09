import {el,button,field,data,euro,notice,owner} from './dom.mjs';
import {getLotBalance} from '../domain/inventory.mjs';
import {estimateQuote,quoteMaterials} from '../domain/quotation.mjs';
export function quotationSummary(q){return el('dl',{class:'quote-costs'},el('dt',{},'Filamentos'),el('dd',{},euro(q.materialMilliEuro)),el('dt',{},'Tempo de produção'),el('dd',{},euro(q.timeMilliEuro)),el('dt',{},'Valor final'),el('dd',{class:'quote-final'},euro(q.finalMilliEuro)));}
export function quotationMaterials(q){return el('ul',{class:'quotation-material-breakdown'},...quoteMaterials(q).map(r=>el('li',{},el('span',{},`${r.material} · ${r.color} · ${r.grams} g`),el('strong',{},euro(r.materialMilliEuro)))));}
export function quotationDialog(ctx,o){
 const q=o.quotation||{},lots=ctx.state.lots.filter(l=>getLotBalance(ctx.state,l.id).available>0);
 if(!lots.length){ctx.openDialog({title:'Orçamentar projeto',body:notice('Não há filamento disponível em stock. Regista material na secção Filamentos antes de orçamentar.')});return;}
 const rows=el('div',{class:'stack quotation-materials'}),preview=el('div',{class:'quote-preview','aria-live':'polite'});let sequence=0;
 const addRow=(saved={})=>{
  const i=++sequence,used=new Set(Array.from(rows.querySelectorAll('select')).map(n=>n.value));
  const selected=saved.lotId||lots.find(l=>!used.has(l.id))?.id||'';
  const options=[['','Seleciona um filamento'],...lots.map(l=>[l.id,`${l.material} · ${l.color} · ${l.brand} · ${getLotBalance(ctx.state,l.id).available} g disponíveis`])];
  if(saved.lotId&&!lots.some(l=>l.id===saved.lotId))options.push([saved.lotId,`${saved.material} · ${saved.color} — indisponível; seleciona outro lote`]);
  const row=el('div',{class:'quotation-material-row'},field(`Filamento ${i}`,`lot-${i}`,selected,{required:true,choices:options}),field(`Gramas do filamento ${i}`,`grams-${i}`,saved.grams||'',{type:'number',required:true,min:1,step:1}));
  const remove=button('Remover',()=>{row.remove();draw();add.focus();},'ghost');remove.setAttribute('aria-label',`Remover filamento ${i}`);row.append(remove);rows.append(row);return row;
 };
 const add=button('+ Adicionar filamento',()=>{const row=addRow();row.querySelector('select').focus();draw();},'secondary');
 const body=el('div',{class:'stack'},el('p',{},o.title),rows,add,el('div',{class:'form-grid'},field('Horas de produção','hours',q.durationMinutes?Math.floor(q.durationMinutes/60):0,{type:'number',required:true,min:0,max:10000,step:1}),field('Minutos','minutes',q.durationMinutes?q.durationMinutes%60:0,{type:'number',required:true,min:0,max:59,step:1}),field('Custo por hora (€)','hourlyRate',q.hourlyRateMilliEuro===undefined?'':q.hourlyRateMilliEuro/1000,{type:'number',required:true,min:0,max:1000000,step:0.01}),field('Valor final do orçamento (€)','finalValue',q.finalMilliEuro===undefined?'':q.finalMilliEuro/1000,{type:'number',required:true,min:0.01,max:1000000,step:0.01})),notice('Estimativa para a encomenda completa. Não reserva nem desconta stock. O valor final é definido por ti, independentemente dos custos.'),preview);
 const payload=form=>{const p=form?data(form):Object.fromEntries(Array.from(body.querySelectorAll('input,select')).map(n=>[n.name,n.value]));return {id:o.id,materials:Array.from(rows.children).map(row=>({lotId:row.querySelector('select').value,grams:Number(row.querySelector('input').value)})),hours:Number(p.hours),minutes:Number(p.minutes),hourlyRateMilliEuro:p.hourlyRate===''?NaN:Math.round(Number(p.hourlyRate)*1000),finalMilliEuro:p.finalValue===''?NaN:Math.round(Number(p.finalValue)*1000)};};
 const draw=()=>{try{const estimate=estimateQuote(ctx.state,payload());preview.replaceChildren(quotationMaterials(estimate),quotationSummary(estimate),el('p',{class:'muted small'},`Custo estimado total: ${euro(estimate.materialMilliEuro+estimate.timeMilliEuro)}`));}catch(e){preview.replaceChildren(el('p',{class:'muted small'},e.message));}};
 const saved=quoteMaterials(q);(saved.length?saved:[{}]).forEach(addRow);
 body.addEventListener('input',draw);body.addEventListener('change',draw);draw();
 ctx.openDialog({title:q.status==='pending'?'Rever orçamento':'Orçamentar projeto',body,saveLabel:'Enviar para aprovação',onSave:form=>ctx.dispatch('quote.submit',payload(form))});
}
export function quotationCard(ctx,o){
 const client=ctx.state.clients.find(c=>c.id===o.clientId),pending=o.quotation?.status==='pending';
 return el('article',{class:'quotation-card'},el('p',{class:'small muted'},client?.name||'Cliente'),el('h3',{},button(o.title,()=>quotationDialog(ctx,o),'ghost quote-title-button')),pending?quotationSummary(o.quotation):el('p',{class:'muted small'},'Definir material, tempo e valor final.'),el('p',{class:'quote-head small muted'},`Head · ${owner(ctx.state,o.assigneeId)}`),el('div',{class:'actions'},pending?button('Aprovar',()=>ctx.dispatch('quote.approve',{id:o.id})):button('Orçamentar',()=>quotationDialog(ctx,o)),pending?button('Rever',()=>quotationDialog(ctx,o),'ghost'):null));
}
export function quotationGroups(ctx,orders){return ['prepare','pending'].map(kind=>{const items=orders.filter(o=>(o.quotation?.status==='pending')===(kind==='pending'));return el('section',{class:'quotation-group'},el('h3',{},kind==='pending'?'Aprovar Orçamento':'Orçamentação',el('span',{class:'count'},items.length)),el('div',{class:'quotation-cards'},...items.map(o=>quotationCard(ctx,o))),items.length?null:el('p',{class:'small muted'},'Sem projetos nesta subetapa.'));});}
