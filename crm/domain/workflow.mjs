export const OPTIONAL_STEPS=['quote','approval','production','ready'];
export function orderRoute(order){
  if(order.route)return order.route;
  if(order.status==='new')return [];
  // Preserve the workflow of existing projects already in progress.
  return ['accepted',...(order.pricingMode==='quote'||order.status==='quote'?['quote']:[]),...(order.artRequired||order.status==='approval'?['approval']:[]),'production','ready','delivered'];
}
export function nextStages(order){
  if(['delivered','cancelled'].includes(order.status))return [];
  if(order.status==='new')return ['cancelled'];
  const route=orderRoute(order),index=route.indexOf(order.status);
  return [...(index>=0&&route[index+1]?[route[index+1]]:[]),'cancelled'];
}
