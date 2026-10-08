import { products, validateConfiguration } from './products.mjs';
const root = document.querySelector('#product-root');
const product = products.find(item => item.id === new URLSearchParams(location.search).get('id'));
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function visual(type) {
  const art = element('div', `product-visual ${type === 'qr' ? 'sand' : type === 'card' ? 'grey' : ''}`);
  art.append(element('span','visual-label','Imagem provisória'));
  const shape = element('div',`${type === 'sign' ? 'sign' : type === 'qr' ? 'qr' : 'card'}-object`);
  shape.setAttribute('aria-hidden','true');
  if (type === 'qr') shape.append(element('span','','A tua marca'),element('div','qr-symbol'),element('span','','Vamos ligar-nos.'));
  else shape.textContent = type === 'sign' ? 'a tua marca.' : 'OLÁ, MARCA.';
  art.append(shape); return art;
}
root.replaceChildren();
if (!product) {
  const section = element('section','not-found');
  section.append(element('h1','','Produto não encontrado'),element('p','','Escolhe um dos três produtos de demonstração.'));
  const link = element('a','text-link','Voltar ao catálogo'); link.href = 'index.html#produtos'; section.append(link); root.append(section);
} else {
  document.title = `${product.name} — ${product.category} | Arrábida 3D Print`;
  document.querySelector('#breadcrumb-name').textContent = product.name;
  const section = element('section','product-detail');
  const art = element('div','detail-art');
  art.append(visual(product.visual),element('p','',product.visual === 'qr' ? 'Representação ilustrativa. O padrão não é um QR code funcional.' : 'Representação ilustrativa. As fotografias reais serão adicionadas mais tarde.'));
  const info = element('div','product-info');
  info.append(element('p','eyeline',product.category),element('h1','',product.name),element('p','',product.description),element('p','demo-note','Demonstração de personalização. Sem preço, pagamento ou envio de dados. Usa dados de exemplo.'));
  const form = element('form'); form.noValidate = true;
  const fields = element('div','fields');
  for (const field of product.fields) {
    const wrapper = element('div',`field ${['textarea','url'].includes(field.type) ? 'wide' : ''}`);
    const label = element('label','',`${field.label}${field.required ? ' *' : ' (opcional)'}`); label.htmlFor = field.name;
    const input = element(field.type === 'select' ? 'select' : field.type === 'textarea' ? 'textarea' : 'input');
    if (input.tagName === 'INPUT') input.type = field.type;
    input.id = input.name = field.name; input.required = field.required; input.autocomplete = 'off';
    if (field.placeholder) input.placeholder = field.placeholder;
    if (field.maxLength) input.maxLength = field.maxLength;
    if (field.type === 'number') {input.min = field.min; input.max = field.max; input.step = field.name === 'quantity' ? '1' : '0.1';}
    if (field.options) for (const value of field.options) { const option = element('option','',value); option.value = value; input.append(option); }
    if (field.value) input.value = field.value;
    const error = element('span','error'); error.id = `${field.name}-error`; error.hidden = true;
    const described = [error.id]; wrapper.append(label,input);
    if (field.hint) {const hint = element('span','hint',field.hint); hint.id = `${field.name}-hint`; described.unshift(hint.id); wrapper.append(hint);}
    input.setAttribute('aria-describedby',described.join(' ')); wrapper.append(error); fields.append(wrapper);
  }
  const submit = element('button','button form-action','Rever personalização'); submit.type = 'submit';
  form.append(fields,submit);
  const summary = element('section','summary'); summary.hidden = true; summary.tabIndex = -1; summary.setAttribute('aria-label','Resumo da personalização');
  form.addEventListener('input', () => {summary.hidden = true;});
  form.addEventListener('change', () => {summary.hidden = true;});
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const errors = validateConfiguration(product.id,data);
    for (const field of product.fields) {
      const input = form.elements.namedItem(field.name); const error = document.getElementById(`${field.name}-error`);
      input.setAttribute('aria-invalid',String(Boolean(errors[field.name]))); error.textContent = errors[field.name] || ''; error.hidden = !errors[field.name];
    }
    if (Object.keys(errors).length) {summary.hidden = true; form.elements.namedItem(Object.keys(errors)[0]).focus(); return;}
    summary.replaceChildren(element('h2','','A tua personalização'));
    const list = element('dl');
    for (const field of product.fields) if (String(data[field.name] || '').trim()) list.append(element('dt','',field.label),element('dd','',String(data[field.name]).trim()));
    summary.append(list,element('p','','Resumo de demonstração. Não foi criada nenhuma encomenda. Os dados desaparecem ao recarregar a página.'));
    summary.hidden = false; summary.focus();
  });
  info.append(form,summary); section.append(art,info); root.append(section);
  const portfolio = element('section','section process'); portfolio.id = 'portfolio';
  portfolio.append(element('p','eyeline','Aplicações deste produto'),element('h2','','O teu próximo detalhe.'));
  const grid = element('div','portfolio-grid'); grid.style.marginTop = '30px';
  for (const title of ['No espaço do teu negócio','Com a identidade da tua marca']) {
    const placeholder = element('div','portfolio-placeholder'); placeholder.append(element('strong','',title),element('p','','Portefólio em preparação · fotografias a adicionar')); grid.append(placeholder);
  }
  portfolio.append(grid); root.append(portfolio);
}
