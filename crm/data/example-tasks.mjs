import {localDate} from '../domain/model.mjs';
export const EXAMPLE_TASKS_MARKER='demo-task-examples-v1';
// Add the requested examples once, preserving existing tasks and their states.
export function addExampleTasks(state,now=new Date()){
  if(state.history.some(h=>h.entityId===EXAMPLE_TASKS_MARKER))return state;
  const s=structuredClone(state);
  const jobs=s.jobs.filter(j=>!['delivered','cancelled','ready'].includes(s.orders.find(o=>o.id===j.orderId)?.status)&&!['cancelled','failed'].includes(j.status));
  if(!jobs.length)return state;
  const partner='user-partner-demo';
  if(!s.users.some(u=>u.id===partner))s.users.push({id:partner,name:'Sócio · demo',role:'admin'});
  const samples=[
    ['Validar nome, contacto e destino do QR','pending','user-demo',0],
    ['Preparar proposta visual para o cliente','active','user-demo',1],
    ['Confirmar medidas e cor do letreiro','pending',partner,1],
    ['Preparar ficheiro para impressão','active',partner,2],
    ['Rever texto dos cartões de visita','pending','user-demo',2],
    ['Calcular gramas de filamento necessárias','pending',partner,3],
    ['Confirmar prazo com o cliente','pending',null,3],
    ['Verificar dados recebidos do cliente','done',partner,0]
  ];
  samples.forEach(([title,status,assigneeId,offset],i)=>{
    const date=new Date(now);date.setDate(date.getDate()+offset);
    const id=`${EXAMPLE_TASKS_MARKER}-${i}`;
    s.tasks.push({id,jobId:jobs[[0,0,1,1,2,3,3,0][i]%jobs.length].id,title,status,assigneeId,dueDate:localDate(date)});
    s.history.push({id:`history-${id}`,entityId:id,actorId:'user-demo',at:now.toISOString(),description:`Tarefa de exemplo: ${title}${status==='done'?' · Concluída':''}`});
  });
  s.history.push({id:`history-${EXAMPLE_TASKS_MARKER}`,entityId:EXAMPLE_TASKS_MARKER,actorId:'user-demo',at:now.toISOString(),description:'Tarefas fictícias adicionadas para demonstrar a organização por responsável.'});
  s.revision++;
  return s;
}
