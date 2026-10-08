import {getLotBalance} from './inventory.mjs';
const money=n=>Number.isSafeInteger(n)&&n>=0&&n<=1000000000000;
export function estimateQuote(state,p){
 const lot=state.lots.find(l=>l.id===p.lotId);
 if(!lot||getLotBalance(state,lot.id).available<=0)throw new Error('Seleciona um filamento disponível em stock.');
 if(!Number.isSafeInteger(p.grams)||p.grams<=0||p.grams>getLotBalance(state,lot.id).available)throw new Error('As gramas devem ser inteiras e caber no stock disponível.');
 if(!Number.isSafeInteger(p.hours)||p.hours<0||p.hours>10000||!Number.isSafeInteger(p.minutes)||p.minutes<0||p.minutes>59||p.hours*60+p.minutes<=0)throw new Error('Indica horas e minutos válidos; o tempo deve ser superior a zero.');
 if(!money(p.hourlyRateMilliEuro)||!money(p.finalMilliEuro)||p.finalMilliEuro<=0)throw new Error('Indica um custo por hora válido e um valor final superior a zero.');
 const durationMinutes=p.hours*60+p.minutes;
 const materialMilliEuro=Math.round(p.grams*lot.purchaseCostMilliEuro/lot.receivedGrams);
 const timeMilliEuro=Math.round(durationMinutes*p.hourlyRateMilliEuro/60);
 if(!money(materialMilliEuro)||!money(timeMilliEuro)||!money(materialMilliEuro+timeMilliEuro))throw new Error('Valores de orçamento demasiado elevados.');
 return {lotId:lot.id,material:lot.material,color:lot.color,grams:p.grams,lotPurchaseCostMilliEuro:lot.purchaseCostMilliEuro,lotReceivedGrams:lot.receivedGrams,durationMinutes,hourlyRateMilliEuro:p.hourlyRateMilliEuro,materialMilliEuro,timeMilliEuro,finalMilliEuro:p.finalMilliEuro};
}
export function validQuotation(q,state){
 return q&&['pending','approved'].includes(q.status)&&state.lots.some(l=>l.id===q.lotId)&&typeof q.material==='string'&&typeof q.color==='string'&&Number.isSafeInteger(q.grams)&&q.grams>0&&Number.isSafeInteger(q.lotReceivedGrams)&&q.lotReceivedGrams>0&&money(q.lotPurchaseCostMilliEuro)&&Number.isSafeInteger(q.durationMinutes)&&q.durationMinutes>0&&q.durationMinutes<=600059&&money(q.hourlyRateMilliEuro)&&money(q.finalMilliEuro)&&q.finalMilliEuro>0&&money(q.materialMilliEuro)&&money(q.timeMilliEuro)&&q.materialMilliEuro===Math.round(q.grams*q.lotPurchaseCostMilliEuro/q.lotReceivedGrams)&&q.timeMilliEuro===Math.round(q.durationMinutes*q.hourlyRateMilliEuro/60)&&state.users.some(u=>u.id===q.submittedBy)&&Number.isFinite(Date.parse(q.submittedAt))&&(q.status!=='approved'||state.users.some(u=>u.id===q.approvedBy)&&Number.isFinite(Date.parse(q.approvedAt)));
}
