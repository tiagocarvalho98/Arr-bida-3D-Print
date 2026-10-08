import {requireThat,text} from './model.mjs';
export function getLotBalance(state,lotId){const lot=state.lots.find(l=>l.id===lotId);if(!lot)throw new Error('Lote não encontrado.');const physical=lot.receivedGrams+state.movements.filter(m=>m.lotId===lotId).reduce((n,m)=>n+m.deltaGrams,0);const reserved=state.reservations.filter(r=>r.lotId===lotId).reduce((n,r)=>n+r.grams,0);return {physical,reserved,available:physical-reserved};}
export function inventoryCommand(s,c){
  const p=c.payload;
  if(c.type==='lot.add'){
    requireThat(text(p.material)&&text(p.color),'Preenche material e cor.');
    requireThat(Number.isSafeInteger(p.receivedGrams)&&p.receivedGrams>0&&Number.isSafeInteger(p.purchaseCostMilliEuro)&&p.purchaseCostMilliEuro>=0&&Number.isSafeInteger(p.lowStockGrams)&&p.lowStockGrams>=0,'Indica peso e custo válidos.');
    s.lots.push({id:c.id,material:text(p.material,60),brand:text(p.brand,80),color:text(p.color,60),receivedGrams:p.receivedGrams,purchaseCostMilliEuro:p.purchaseCostMilliEuro,lowStockGrams:p.lowStockGrams});return c.id;
  }
  const job=s.jobs.find(j=>j.id===p.jobId);requireThat(job,'Trabalho não encontrado.');
  const order=s.orders.find(o=>o.id===job.orderId);
  requireThat(!['cancelled','delivered'].includes(order.status),'Esta encomenda está encerrada.');
  if(c.type==='job.cancel'){requireThat(['pending','active'].includes(job.status),'Este trabalho já está encerrado.');job.status='cancelled';s.reservations=s.reservations.filter(r=>r.jobId!==job.id);return job.orderId;}
  if(c.type==='job.reprint'){requireThat(job.status==='failed','Só podes reimprimir um trabalho falhado.');requireThat(!s.jobs.some(j=>j.parentJobId===job.id&&j.status!=='cancelled'),'Já existe uma reimpressão para este trabalho.');s.jobs.push({id:c.id,orderId:job.orderId,title:`Reimpressão · ${job.title}`,status:'pending',parentJobId:job.id,consumptionConfirmed:false});return job.orderId;}
  requireThat(order.status==='production','Coloca a encomenda em produção antes de iniciar ou confirmar material.');
  const start=c.type==='job.start';requireThat(start||c.type==='job.confirmConsumption','Operação de material desconhecida.');
  requireThat(start?job.status==='pending':job.status==='active'&&!job.consumptionConfirmed,'O trabalho não permite esta operação ou o consumo já foi confirmado.');
  const rows=start?p.reservations:p.consumptions;requireThat(Array.isArray(rows),'Indica os materiais.');
  requireThat(new Set(rows.map(r=>r.lotId)).size===rows.length,'O mesmo lote não pode aparecer duas vezes.');
  if(!start){requireThat(['completed','failed'].includes(p.outcome),'Escolhe o resultado da produção.');requireThat(s.reservations.filter(r=>r.jobId===job.id).every(r=>rows.some(x=>x.lotId===r.lotId)),'Confirma também os lotes reservados, mesmo com consumo zero.');}
  for(const row of rows){requireThat(Number.isSafeInteger(row.grams)&&row.grams>=0,'As gramas devem ser um número inteiro não negativo.');const b=getLotBalance(s,row.lotId);const own=s.reservations.filter(r=>r.jobId===job.id&&r.lotId===row.lotId).reduce((n,r)=>n+r.grams,0);requireThat(row.grams<=b.available+own,'Material insuficiente: considera as reservas dos outros trabalhos.');}
  if(start){job.status='active';for(const row of rows)if(row.grams)s.reservations.push({jobId:job.id,...row});}
  else {for(const [i,row] of rows.entries())if(row.grams){const lot=s.lots.find(l=>l.id===row.lotId);const rate=lot.purchaseCostMilliEuro/lot.receivedGrams;s.movements.push({id:`${c.id}-${i}`,jobId:job.id,lotId:lot.id,deltaGrams:-row.grams,costMilliEuro:row.grams*rate,unitCostMilliEuro:rate,actorId:c.actorId,at:c.at});}s.reservations=s.reservations.filter(r=>r.jobId!==job.id);job.status=p.outcome;job.consumptionConfirmed=true;}
  return job.orderId;
}
