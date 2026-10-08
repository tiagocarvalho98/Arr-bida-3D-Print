const paths={
  orcamentos:['M6 3h12v18H6z','M9 7h6','M9 11h1','M14 11h1','M9 15h1','M14 15h1','M9 18h6'],
  hoje:['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M14 14h7v7h-7z'],
  clientes:['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2','M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8','M17 4a4 4 0 0 1 0 7','M22 21v-2a4 4 0 0 0-3-3.87'],
  pipeline:['M3 4h5v16H3z','M10 4h5v10h-5z','M17 4h4v13h-4z'],
  tarefas:['M9 5h11v15H4V9','M2 4l3 3 5-5','M8 12h8','M8 16h5'],
  catalogo:['M3 7l9-4 9 4-9 4z','M3 7v10l9 4 9-4V7','M12 11v10'],
  filamentos:['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18','M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8','M12 3v5','M12 16v5','M3 12h5','M16 12h5'],
  definicoes:['M4 7h16','M4 17h16','M8 4v6','M16 14v6'],
  collapse:['M4 4h16v16H4z','M9 4v16','M16 9l-3 3 3 3'],
  arrow:['M7 17L17 7','M7 7h10v10'],
  check:['M5 12l4 4L19 6'],
  clock:['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18','M12 7v5l3 2']
};
export function icon(name){const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');for(const [k,v] of Object.entries({viewBox:'0 0 24 24',fill:'none',stroke:'currentColor','stroke-width':'1.6','stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':'true',focusable:'false',class:'ui-icon'}))svg.setAttribute(k,v);for(const d of paths[name]||paths.hoje){const path=document.createElementNS(ns,'path');path.setAttribute('d',d);svg.append(path);}return svg;}
