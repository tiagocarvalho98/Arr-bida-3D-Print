import {requireThat,text,validateState,TASK_STATES,ORDER_STATES,dateValid} from './model.mjs';
import {inventoryCommand} from './inventory.mjs';
import {validateConfiguration} from '../../scripts/products.mjs';
export function transitionOptions(order){return ({new:order.pricingMode==='known'?['quote','approval','cancelled']:['quote','cancelled'],quote:['approval','cancelled'],approval:['production','cancelled'],production:['ready','cancelled'],ready:['delivered','cancelled'],delivered:[],cancelled:[]})[order.status]||[];}
export function applyCommand(state,command){
  try{
    requireThat(command&&typeof command.id==='string'&&command.id&&state.users.some(u=>u.id===command.actorId),'Operação ou utilizador inválido.');
    if(state.processedCommands.includes(command.id))return {ok:true,state};
    const s=structuredClone(state),c=command,p=c.payload;let entityId=p.id||p.jobId||c.id;
    const owner=id=>requireThat(id==null||id===''||s.users.some(u=>u.id===id),'Responsável não encontrado.');
    const due=()=>requireThat(dateValid(p.dueDate),'Prazo inválido.');
    if(c.type.startsWith('job.')||c.type==='lot.add')entityId=inventoryCommand(s,c);
    else if(c.type==='client.save'){
      requireThat(text(p.name)&&['business','person'].includes(p.type),'Preenche o nome e o tipo de cliente.');
      const client=p.id?s.clients.find(x=>x.id===p.id):{id:c.id};requireThat(client,'Cliente não encontrado.');
      Object.assign(client,{name:text(p.name,120),type:p.type,contact:text(p.contact,120),city:text(p.city,100),unit:text(p.unit,100),notes:text(p.notes)});if(!p.id)s.clients.push(client);
    }else if(c.type==='order.save'){
      requireThat(s.clients.some(x=>x.id===p.clientId)&&text(p.title),'Escolhe cliente e título.');owner(p.assigneeId);due();
      requireThat(['known','quote'].includes(p.pricingMode)&&Array.isArray(p.lines)&&p.lines.length,'Adiciona pelo menos um produto.');
      for(const line of p.lines){const errors=validateConfiguration(line.productId,line.configuration||{});requireThat(!Object.keys(errors).length,`Personalização incompleta: ${Object.keys(errors).join(', ')}.`);}
      const order=p.id?s.orders.find(x=>x.id===p.id):{id:c.id,status:'new',artApproved:false};requireThat(order,'Encomenda não encontrada.');
      requireThat(['new','quote','approval'].includes(order.status),'As linhas ficam fechadas ao iniciar produção.');
      const lines=p.lines.map((l,i)=>({id:`${order.id}-line-${i}`,productId:l.productId,configuration:structuredClone(l.configuration)}));
      const changed=JSON.stringify(lines)!==JSON.stringify(order.lines);
      Object.assign(order,{clientId:p.clientId,title:text(p.title,120),pricingMode:p.pricingMode,artRequired:Boolean(p.artRequired),dueDate:p.dueDate||'',assigneeId:p.assigneeId||null,notes:text(p.notes),lines});if(changed)order.artApproved=false;
      if(!p.id){s.orders.push(order);s.jobs.push({id:`${c.id}-job`,orderId:c.id,title:`Produção · ${order.title}`,status:'pending',parentJobId:null,consumptionConfirmed:false});}
    }else if(c.type==='order.approveArt'){
      const o=s.orders.find(x=>x.id===p.id);requireThat(o&&['new','quote','approval'].includes(o.status),'A arte já não pode ser alterada nesta etapa.');o.artApproved=true;
    }else if(c.type==='order.transition'){
      const o=s.orders.find(x=>x.id===p.id);requireThat(o&&transitionOptions(o).includes(p.status),'Transição não permitida.');
      if(p.status==='production')requireThat(!o.artRequired||o.artApproved,'Aprova a arte antes da produção.');
      if(p.status==='ready'){const jobs=s.jobs.filter(j=>j.orderId===o.id);const resolved=j=>j.status==='completed'||j.status==='cancelled'||j.status==='failed'&&jobs.some(child=>child.parentJobId===j.id&&resolved(child));requireThat(jobs.some(j=>j.status==='completed')&&jobs.every(resolved),'Conclui a produção ou resolve os trabalhos falhados primeiro.');}
      o.status=p.status;
      if(p.status==='cancelled'){const jobs=s.jobs.filter(j=>j.orderId===o.id);for(const j of jobs)if(['pending','active'].includes(j.status))j.status='cancelled';const ids=jobs.map(j=>j.id);s.reservations=s.reservations.filter(r=>!ids.includes(r.jobId));}
    }else if(c.type==='task.save'){
      const job=s.jobs.find(j=>j.id===p.jobId);requireThat(job&&text(p.title),'Indica trabalho e título da tarefa.');owner(p.assigneeId);due();
      const task=p.id?s.tasks.find(t=>t.id===p.id):{id:c.id,status:'pending'};requireThat(task,'Tarefa não encontrada.');Object.assign(task,{jobId:p.jobId,title:text(p.title,120),dueDate:p.dueDate||'',assigneeId:p.assigneeId||null});if(!p.id)s.tasks.push(task);
    }else if(c.type==='task.transition'){
      const task=s.tasks.find(t=>t.id===p.id);requireThat(task&&Object.hasOwn(TASK_STATES,p.status),'Estado de tarefa inválido.');task.status=p.status;
    }else throw new Error('Operação desconhecida.');
    s.revision++;s.processedCommands.push(c.id);s.history.push({id:`history-${c.id}`,entityId,actorId:c.actorId,at:c.at,description:({ 'client.save':'Cliente guardado','order.save':'Encomenda guardada','order.approveArt':'Arte aprovada','order.transition':`Etapa alterada para ${ORDER_STATES[p.status]}`,'task.save':'Tarefa guardada','task.transition':`Tarefa «${s.tasks.find(t=>t.id===p.id)?.title}»: ${TASK_STATES[p.status]}`,'lot.add':'Lote recebido','job.start':'Material reservado e trabalho iniciado','job.confirmConsumption':'Consumo real confirmado','job.cancel':'Trabalho cancelado; reservas libertadas','job.reprint':'Reimpressão criada'})[c.type]});
    const valid=validateState(s);requireThat(valid.ok,valid.message);return {ok:true,state:s};
  }catch(e){return {ok:false,code:'invalid',message:e.message};}
}
