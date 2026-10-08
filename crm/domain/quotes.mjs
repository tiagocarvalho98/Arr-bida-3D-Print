export function selectQuotes(state,query=''){
  const term=query.trim().toLocaleLowerCase('pt-PT');
  return state.orders.filter(o=>o.status==='quote').filter(o=>{
    const client=state.clients.find(c=>c.id===o.clientId),head=state.users.find(u=>u.id===o.assigneeId);
    return `${o.title} ${client?.name||''} ${head?.name||''}`.toLocaleLowerCase('pt-PT').includes(term);
  });
}
