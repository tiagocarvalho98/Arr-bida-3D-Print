let pointer=false;
document.addEventListener('pointerdown',()=>{pointer=true;document.documentElement.dataset.input='pointer';},true);
document.addEventListener('keydown',()=>{pointer=false;document.documentElement.dataset.input='keyboard';document.querySelectorAll('.view,dialog,#announcement').forEach(n=>n.getAnimations().forEach(a=>a.cancel()));},true);
export function reveal(node,kind='view'){
  if(!node||!pointer||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  node.getAnimations().forEach(a=>a.cancel());
  const frames=kind==='dialog'?[{opacity:0,transform:'translateY(6px) scale(.985)'},{opacity:1,transform:'translateY(0) scale(1)'}]:[{opacity:.35,transform:`translateY(${kind==='toast'?6:4}px)`},{opacity:1,transform:'translateY(0)'}];
  node.animate(frames,{duration:kind==='dialog'?200:160,easing:'cubic-bezier(.16,1,.3,1)'});
}
