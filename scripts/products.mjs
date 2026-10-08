const quantity = {name:'quantity', label:'Quantidade', type:'number', required:true, min:1, max:1000, value:'1'};
const color = {name:'color', label:'Cor', type:'select', required:true, options:['Preto','Branco','Verde-azeitona']};
const notes = {name:'notes', label:'Notas adicionais', type:'textarea', required:false, maxLength:500};
export const products = [
  {id:'produto-1', name:'Produto 1', category:'Letreiro personalizado', visual:'sign', description:'O nome do teu negócio, com lugar de destaque. Experimenta o texto, a cor e a dimensão de um letreiro personalizado.', fields:[
    {name:'text',label:'Texto do letreiro',type:'text',required:true,maxLength:60,placeholder:'Ex.: A tua marca'},
    {name:'width',label:'Largura pretendida (cm)',type:'number',required:true,min:5,max:200,value:'30'},color,quantity,notes]},
  {id:'produto-2', name:'Produto 2', category:'Placa QR personalizada', visual:'qr', description:'Uma ligação entre o teu espaço e o mundo digital. Preenche os dados do negócio e indica a página que o QR deverá abrir.',fields:[
    {name:'business',label:'Nome do negócio',type:'text',required:true,maxLength:100,placeholder:'Ex.: Restaurante da Praça'},
    {name:'city',label:'Localização / cidade',type:'text',required:true,maxLength:100,placeholder:'Ex.: Setúbal'},
    {name:'contact',label:'Contacto do negócio',type:'text',required:true,maxLength:120,placeholder:'Telefone ou email'},
    {name:'url',label:'Destino do QR code',type:'url',required:true,maxLength:500,placeholder:'https://exemplo.pt/menu',hint:'Indica o endereço completo do menu, página ou perfil. Cidade e contacto não definem o destino do QR.'},color,quantity,notes]},
  {id:'produto-3',name:'Produto 3',category:'Cartão personalizado',visual:'card',description:'Uma apresentação que fica. Personaliza o nome, a função e os contactos para criar um cartão com a tua identidade.',fields:[
    {name:'name',label:'Nome a apresentar',type:'text',required:true,maxLength:100},
    {name:'business',label:'Empresa / marca',type:'text',required:false,maxLength:100},
    {name:'role',label:'Função',type:'text',required:false,maxLength:100},
    {name:'contact',label:'Contacto',type:'text',required:true,maxLength:120},color,quantity,notes]}
];
export function validateConfiguration(id, data) {
  const product = products.find(item => item.id === id);
  if (!product) return {product:'Produto não encontrado.'};
  const errors = {};
  for (const field of product.fields) {
    const value = String(data[field.name] ?? '').trim();
    if (field.required && !value) { errors[field.name] = 'Preenche este campo.'; continue; }
    if (!value) continue;
    if (field.maxLength && value.length > field.maxLength) errors[field.name] = `Usa até ${field.maxLength} caracteres.`;
    if (field.type === 'number' && (!Number.isFinite(Number(value)) || Number(value) < field.min || Number(value) > field.max || (field.name === 'quantity' && !Number.isInteger(Number(value))))) errors[field.name] = field.name === 'quantity' ? 'Indica uma quantidade inteira entre 1 e 1000.' : `Indica um valor entre ${field.min} e ${field.max}.`;
    if (field.type === 'select' && !field.options.includes(value)) errors[field.name] = 'Escolhe uma das opções disponíveis.';
    if (field.type === 'url') {
      try { const url = new URL(value); if (!['https:','http:'].includes(url.protocol) || !url.hostname || url.username || url.password) throw new Error(); }
      catch { errors[field.name] = 'Indica um endereço válido começado por https:// ou http://.'; }
    }
  }
  return errors;
}
