import {addExampleTasks} from './example-tasks.mjs';
import {createDemoState} from './fixtures.mjs';import {validateState} from '../domain/model.mjs';import {applyCommand} from '../domain/commands.mjs';
export const DATA_KEY='arrabida.crm.demo.v1';const SESSION_KEY='arrabida.crm.demo.session.v1';
export function createStore({storage,sessionStorage,now=()=>new Date(),makeId=()=>crypto.randomUUID()}){
  let state=null;
  const failure=message=>({ok:false,message});
  const persist=next=>{try{storage.setItem(DATA_KEY,JSON.stringify(next));state=next;return {ok:true,state};}catch{return failure('Não foi possível guardar neste browser. Liberta espaço ou permite armazenamento local. Nenhuma alteração foi aplicada.');}};
  return {
    load(){try{const raw=storage.getItem(DATA_KEY);if(raw===null)return persist(createDemoState(now()));const parsed=JSON.parse(raw),valid=validateState(parsed);if(!valid.ok)return valid;state=parsed;return {ok:true,state};}catch{return failure('Não foi possível ler os dados locais. Podes tentar novamente ou repor os exemplos.');}},
    addTaskExamples(){if(!state)return failure('Carrega os dados primeiro.');const next=addExampleTasks(state,now());if(next===state)return {ok:true,state};const valid=validateState(next);return valid.ok?persist(next):valid;},
    getState:()=>state,
    dispatch(type,payload){if(!state)return failure('Carrega os dados primeiro.');try{const raw=storage.getItem(DATA_KEY);if(!raw||JSON.parse(raw).revision!==state.revision)return failure('Os dados mudaram noutra aba. Recarrega antes de continuar.');}catch{return failure('Armazenamento indisponível.');}const result=applyCommand(state,{id:makeId(),type,payload,actorId:'user-demo',at:now().toISOString()});return result.ok?persist(result.state):result;},
    resetDemo(){const next=createDemoState(now());next.revision=state?state.revision+1:0;return persist(next);},
    enterDemo(){try{sessionStorage.setItem(SESSION_KEY,'user-demo');return {ok:true};}catch{return failure('Permite o armazenamento de sessão para entrar na demonstração.');}},
    exitDemo(){try{sessionStorage.removeItem(SESSION_KEY);return {ok:true};}catch{return failure('Não foi possível terminar a sessão de demonstração.');}},
    isDemoSession(){try{return sessionStorage.getItem(SESSION_KEY)==='user-demo';}catch{return false;}}
  };
}
