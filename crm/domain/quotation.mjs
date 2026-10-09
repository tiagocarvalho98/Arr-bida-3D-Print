import {getLotBalance} from './inventory.mjs';
const money=n=>Number.isSafeInteger(n)&&n>=0&&n<=1000000000000;
export function quoteMaterials(q){return q.materials===undefined?(q.lotId?[q]:[]):q.materials;}
export function estimateQuote(state,p){
 const rows=p.materials===undefined?[{lotId:p.lotId,grams:p.grams}]:p.materials;
 if(!Array.isArray(rows)||!rows.length)throw new Error('Adiciona pelo menos um filamento.');
 if(rows.some(r=>!r)||new Set(rows.map(r=>r.lotId)).size!==rows.length)throw new Error('Usa uma linha por lote de filamento; junta as gramas do mesmo lote.');
 const materials=rows.map(row=>{
  const lot=state.lots.find(l=>l.id===row.lotId);
  if(!lot||getLotBalance(state,lot.id).available<=0)throw new Error('Seleciona um filamento disponível em stock em cada linha.');
  if(!Number.isSafeInteger(row.grams)||row.grams<=0||row.grams>getLotBalance(state,lot.id).available)throw new Error('As gramas de cada filamento devem ser inteiras e caber no stock disponível.');
  const materialMilliEuro=Math.round(row.grams*lot.purchaseCostMilliEuro/lot.receivedGrams);
  if(!money(materialMilliEuro))throw new Error('Custo de material demasiado elevado.');
  return {lotId:lot.id,material:lot.material,color:lot.color,grams:row.grams,lotPurchaseCostMilliEuro:lot.purchaseCostMilliEuro,lotReceivedGrams:lot.receivedGrams,materialMilliEuro};
 });
 if(!Number.isSafeInteger(p.hours)||p.hours<0||p.hours>10000||!Number.isSafeInteger(p.minutes)||p.minutes<0||p.minutes>59||p.hours*60+p.minutes<=0)throw new Error('Indica horas e minutos válidos; o tempo deve ser superior a zero.');
 if(!money(p.hourlyRateMilliEuro)||!money(p.finalMilliEuro)||p.finalMilliEuro<=0)throw new Error('Indica um custo por hora válido e um valor final superior a zero.');
 const durationMinutes=p.hours*60+p.minutes;
 const materialMilliEuro=materials.reduce((sum,r)=>sum+r.materialMilliEuro,0);
 const timeMilliEuro=Math.round(durationMinutes*p.hourlyRateMilliEuro/60);
 if(!money(materialMilliEuro)||!money(timeMilliEuro)||!money(materialMilliEuro+timeMilliEuro))throw new Error('Valores de orçamento demasiado elevados.');
 return {materials,durationMinutes,hourlyRateMilliEuro:p.hourlyRateMilliEuro,materialMilliEuro,timeMilliEuro,finalMilliEuro:p.finalMilliEuro};
}
export function validQuotation(q,state){
 if(!q)return false;
 const rows=quoteMaterials(q);
 if(!Array.isArray(rows)||!rows.length||rows.some(r=>!r)||new Set(rows.map(r=>r.lotId)).size!==rows.length)return false;
 const validRows=rows.every(r=>state.lots.some(l=>l.id===r.lotId)&&typeof r.material==='string'&&typeof r.color==='string'&&Number.isSafeInteger(r.grams)&&r.grams>0&&Number.isSafeInteger(r.lotReceivedGrams)&&r.lotReceivedGrams>0&&money(r.lotPurchaseCostMilliEuro)&&money(r.materialMilliEuro)&&r.materialMilliEuro===Math.round(r.grams*r.lotPurchaseCostMilliEuro/r.lotReceivedGrams));
 return validRows&&['pending','approved'].includes(q.status)&&Number.isSafeInteger(q.durationMinutes)&&q.durationMinutes>0&&q.durationMinutes<=600059&&money(q.hourlyRateMilliEuro)&&money(q.finalMilliEuro)&&q.finalMilliEuro>0&&money(q.materialMilliEuro)&&money(q.timeMilliEuro)&&q.materialMilliEuro===rows.reduce((sum,r)=>sum+r.materialMilliEuro,0)&&q.timeMilliEuro===Math.round(q.durationMinutes*q.hourlyRateMilliEuro/60)&&state.users.some(u=>u.id===q.submittedBy)&&Number.isFinite(Date.parse(q.submittedAt))&&(q.status!=='approved'||state.users.some(u=>u.id===q.approvedBy)&&Number.isFinite(Date.parse(q.approvedAt)));
}
