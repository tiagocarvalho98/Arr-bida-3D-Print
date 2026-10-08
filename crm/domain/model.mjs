import {OPTIONAL_STEPS} from './workflow.mjs';
import {validateConfiguration} from '../../scripts/products.mjs';
export const ORDER_STATES={new:'Por aceitar',accepted:'Aceite',quote:'Orçamento',approval:'Aprovação',production:'Produção',ready:'Pronto',delivered:'Entregue',cancelled:'Cancelado'};
export const TASK_STATES={pending:'Em pedido',active:'Em curso',done:'Concluída'};
export const JOB_STATES={pending:'Por iniciar',active:'Em produção',completed:'Concluído',failed:'Falhou',cancelled:'Cancelado'};
export function requireThat(condition,message){if(!condition)throw new Error(message);}
export function text(value,max=500){return String(value??'').trim().slice(0,max);}
export function dateValid(value){if(!value)return true;if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const d=new Date(value+'T12:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value;}
export function localDate(now=new Date()){return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;}
export function validateState(s){
  try {
    requireThat(s&&s.version===1&&Number.isInteger(s.revision)&&s.revision>=0,'Versão de dados incompatível.');
    const collections=['users','clients','orders','jobs','tasks','lots','reservations','movements','history','processedCommands'];
    for(const key of collections)requireThat(Array.isArray(s[key]),`Dados incompletos: ${key}.`);
    for(const key of ['users','clients','orders','jobs','tasks','lots','movements','history']){
      requireThat(s[key].every(x=>x&&typeof x.id==='string'&&x.id),'Identificador inválido.');
      requireThat(new Set(s[key].map(x=>x.id)).size===s[key].length,'Identificadores repetidos.');
    }
    const has=(key,id)=>s[key].some(x=>x.id===id);
    const owner=id=>id===null||has('users',id);
    requireThat(s.users.some(u=>u.id==='user-demo')&&s.users.every(u=>typeof u.name==='string'&&u.name.trim()&&u.role==='admin'),'Conta de demonstração inválida.');
    for(const c of s.clients)requireThat(typeof c.name==='string'&&c.name.trim()&&['business','person'].includes(c.type),'Cliente inválido.');
    for(const o of s.orders){
      if(o.route!==undefined){
        requireThat(Array.isArray(o.route)&&o.route.length>=2&&o.route[0]==='accepted'&&o.route.at(-1)==='delivered','Percurso inválido.');
        const middle=o.route.slice(1,-1);
        requireThat(new Set(middle).size===middle.length&&middle.every(k=>OPTIONAL_STEPS.includes(k))&&JSON.stringify(middle)===JSON.stringify(OPTIONAL_STEPS.filter(k=>middle.includes(k))),'Ordem de etapas inválida.');
        requireThat((o.status==='cancelled'||o.route.includes(o.status))&&has('users',o.acceptedBy)&&typeof o.acceptedAt==='string'&&Number.isFinite(Date.parse(o.acceptedAt)),'Aceitação inválida.');
        requireThat(o.artRequired===o.route.includes('approval')&&(o.pricingMode==='quote')===o.route.includes('quote'),'Percurso e requisitos inconsistentes.');
      }else requireThat(o.status!=='accepted','Falta definir o percurso.');
      requireThat(typeof o.artRequired==='boolean'&&typeof o.artApproved==='boolean','Estado de aprovação inválido.');
      requireThat(has('clients',o.clientId)&&Object.hasOwn(ORDER_STATES,o.status)&&owner(o.assigneeId)&&dateValid(o.dueDate),'Encomenda inválida.');
      requireThat(typeof o.title==='string'&&o.title.trim()&&['known','quote'].includes(o.pricingMode)&&Array.isArray(o.lines)&&o.lines.length>0,'Linhas de encomenda inválidas.');
      for(const l of o.lines)requireThat(l.configuration&&Object.keys(validateConfiguration(l.productId,l.configuration)).length===0,'Personalização inválida.');
    }
    for(const j of s.jobs){
      requireThat(has('orders',j.orderId)&&Object.hasOwn(JOB_STATES,j.status)&&typeof j.consumptionConfirmed==='boolean'&&(!j.parentJobId||has('jobs',j.parentJobId)),'Trabalho inválido.');
      requireThat(j.consumptionConfirmed===['completed','failed'].includes(j.status),'Confirmação de consumo inconsistente.');
      const visited=new Set([j.id]);let parent=j.parentJobId;
      while(parent){requireThat(!visited.has(parent),'Ciclo de reimpressão inválido.');visited.add(parent);const ancestor=s.jobs.find(x=>x.id===parent);requireThat(ancestor&&ancestor.orderId===j.orderId,'Reimpressão inválida.');parent=ancestor.parentJobId;}
    }
    for(const t of s.tasks)requireThat(has('jobs',t.jobId)&&typeof t.title==='string'&&t.title.trim()&&Object.hasOwn(TASK_STATES,t.status)&&owner(t.assigneeId)&&dateValid(t.dueDate),'Tarefa inválida.');
    for(const l of s.lots)requireThat(typeof l.material==='string'&&l.material&&typeof l.color==='string'&&l.color&&Number.isSafeInteger(l.receivedGrams)&&l.receivedGrams>0&&Number.isSafeInteger(l.purchaseCostMilliEuro)&&l.purchaseCostMilliEuro>=0&&Number.isSafeInteger(l.lowStockGrams)&&l.lowStockGrams>=0,'Lote inválido.');
    const reservationKeys=new Set();
    for(const r of s.reservations){const k=r.jobId+':'+r.lotId;requireThat(!reservationKeys.has(k)&&s.jobs.some(j=>j.id===r.jobId&&j.status==='active')&&has('lots',r.lotId)&&Number.isSafeInteger(r.grams)&&r.grams>=0,'Reserva inválida ou ligada a trabalho encerrado.');reservationKeys.add(k);}
    for(const m of s.movements)requireThat(has('lots',m.lotId)&&has('jobs',m.jobId)&&Number.isSafeInteger(m.deltaGrams)&&m.deltaGrams<=0&&Number.isFinite(m.costMilliEuro)&&m.costMilliEuro>=0,'Movimento inválido.');
    for(const l of s.lots){const physical=l.receivedGrams+s.movements.filter(m=>m.lotId===l.id).reduce((n,m)=>n+m.deltaGrams,0);const reserved=s.reservations.filter(r=>r.lotId===l.id).reduce((n,r)=>n+r.grams,0);requireThat(physical>=reserved&&reserved>=0,'Saldo de material inconsistente.');}
    return {ok:true};
  }catch(e){return {ok:false,message:e.message};}
}
