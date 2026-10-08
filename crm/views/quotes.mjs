import {el,toolbar} from '../ui/dom.mjs';
import {selectQuotes} from '../domain/quotes.mjs';
import {quotationGroups} from '../ui/quotation.mjs';
export function render(ctx){
 const groups=el('div',{class:'quotation-workspace'});
 const draw=q=>groups.replaceChildren(...quotationGroups(ctx,selectQuotes(ctx.state,q)));
 draw('');
 return el('div',{class:'stack'},el('div',{class:'operations-heading'},el('div',{},el('h2',{},'Orçamentos da equipa'),el('p',{class:'muted'},'Calcula os custos, define o valor final e aprova para avançar.'))),toolbar('Pesquisar projeto, cliente ou head',draw),groups);
}
