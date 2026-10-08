import {ORDER_STATES,TASK_STATES,JOB_STATES} from '../domain/model.mjs';
export function el(tag,attrs={},...children){const node=document.createElement(tag);for(const [key,value] of Object.entries(attrs)){if(value===undefined||value===null)continue;if(key==='class')node.className=value;else if(key.startsWith('on'))node.addEventListener(key.slice(2),value);else if(key==='text')node.textContent=value;else if(key==='checked'||key==='disabled'||key==='required'||key==='hidden')node[key]=Boolean(value);else node.setAttribute(key,String(value));}for(const child of children.flat(Infinity)){if(child!==null&&child!==undefined&&child!==false)node.append(child instanceof Node?child:document.createTextNode(String(child)));}return node;}
export const button=(label,action,kind='primary')=>el('button',{type:'button',class:`btn ${kind}`,onclick:action},label);
export const link=(label,href,cls='')=>el('a',{href,class:cls},label);
export const badge=status=>el('span',{class:`badge ${status}`},ORDER_STATES[status]||TASK_STATES[status]||JOB_STATES[status]||status);
export const empty=(message='Sem resultados.',action=null)=>el('div',{class:'empty'},el('span',{class:'empty-icon','aria-hidden':'true'},'◇'),el('p',{},message),action);
export const panel=(title,...content)=>el('section',{class:'panel'},el('div',{class:'panel-heading'},el('h2',{},title)),...content);
export const euro=value=>new Intl.NumberFormat('pt-PT',{style:'currency',currency:'EUR'}).format(value/1000);
export const date=value=>value?value.split('-').reverse().join('/'):'Sem prazo';
export const owner=(s,id)=>s.users.find(u=>u.id===id)?.name||'Sem responsável';
export function field(label,name,value='',options={}){const id=`field-${name}`;const {type='text',choices,...rest}=options;const input=choices?el('select',{id,name,...rest},choices.map(item=>{const [v,t]=Array.isArray(item)?item:[item,item];return el('option',{value:v},t);})):el(type==='textarea'?'textarea':'input',{id,name,type:type==='textarea'?undefined:type,...rest});input.value=value??'';return el('div',{class:'field'},el('label',{for:id},label,rest.required?' *':''),input);}
export function table(headers,rows){return el('div',{class:'table-wrap',tabindex:'0','aria-label':'Tabela, desloca horizontalmente se necessário'},el('table',{},el('thead',{},el('tr',{},headers.map(h=>el('th',{scope:'col'},h)))),el('tbody',{},rows.map(cells=>el('tr',{},cells.map(cell=>el('td',{},cell)))))));}
export function toolbar(placeholder,onSearch,extra=[]){return el('div',{class:'toolbar'},el('label',{class:'search'},el('span',{'aria-hidden':'true'},'⌕'),el('input',{type:'search',placeholder,'aria-label':placeholder,oninput:e=>onSearch(e.target.value)})),...extra);}
export function data(form){return Object.fromEntries(new FormData(form));}
export function actions(...items){return el('div',{class:'actions'},...items);}
export function notice(message){return el('p',{class:'notice'},message);}
