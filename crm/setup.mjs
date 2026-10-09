import {el,link} from './ui/dom.mjs';

// Production entry while the real Auth + transactional data adapter is prepared.
// Deliberately does not import app.mjs/store.mjs or access old demo storage.
document.querySelector('#app').replaceChildren(
  el('div',{class:'login-screen'},
    el('main',{class:'login-card',id:'workspace',tabindex:-1},
      el('img',{src:'../assets/logo.jpeg',alt:'Arrábida 3D Print',class:'login-logo'}),
      el('p',{class:'eyebrow'},'Gestão do estúdio'),
      el('h1',{},'A preparar o teu espaço.'),
      el('p',{class:'muted'},'Os exemplos foram retirados desta versão. O acesso ao CRM estará disponível após configurar a ligação e as contas da equipa.'),
      link('Voltar ao website','../index.html','text-link')
    )
  )
);
document.querySelector('.skip').addEventListener('click',event=>{
  event.preventDefault();
  document.querySelector('#workspace').focus();
});
