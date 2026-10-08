import {el,button} from './dom.mjs';
import {reveal} from './motion.mjs';
export function openDialog({title,body,onSave,saveLabel='Guardar',wide=false}){
  const trigger=document.activeElement;
  const dialog=el('dialog',{class:wide?'wide':'','aria-labelledby':'dialog-title'});
  const error=el('p',{class:'form-error',role:'alert',hidden:true});
  const form=el('form',{},el('div',{class:'dialog-head'},el('h2',{id:'dialog-title'},title),button('Fechar',()=>dialog.close(),'ghost')),el('div',{class:'dialog-body'},body,error),el('div',{class:'dialog-actions'},button('Cancelar',()=>dialog.close(),'secondary'),onSave?el('button',{type:'submit',class:'btn primary'},saveLabel):null));
  form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;try{const result=onSave(form);if(result?.ok===false){error.textContent=result.message;error.hidden=false;error.tabIndex=-1;error.focus();return;}dialog.close();}catch(err){error.textContent=err.message;error.hidden=false;}});
  dialog.append(form);document.body.append(dialog);dialog.addEventListener('close',()=>{dialog.remove();if(trigger?.isConnected)trigger.focus();else document.querySelector('#workspace h1')?.focus();},{once:true});dialog.showModal();reveal(dialog,'dialog');
  return dialog;
}
